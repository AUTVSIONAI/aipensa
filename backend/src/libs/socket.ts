import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";
import { instrument } from "@socket.io/admin-ui";
import User from "../models/User";
import logger from "../utils/logger";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    allowRequest: (req, callback) => {
      // Permitir todas as requisições temporariamente
      callback(null, true);
    },
    cors: {
      origin: (origin, cb) => {
        try {
          const allowed = process.env.FRONTEND_URL || origin;
          return cb(null, allowed);
        } catch {
          return cb(null, origin || true);
        }
      },
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  // if (process.env.SOCKET_ADMIN && JSON.parse(process.env.SOCKET_ADMIN)) {
  //   User.findByPk(1).then(
  //     (adminUser) => {
  //       instrument(io, {
  //         auth: {
  //           type: "basic",
  //           username: adminUser.email,
  //           password: adminUser.passwordHash
  //         },
  //         mode: "development",
  //       });
  //     }
  //   );
  // }

  const workspaces = io.of(/^\/\w+$/);
  workspaces.on("connection", socket => {
    const { userId } = socket.handshake.query;
    console.log(`Client connected: ${socket.id} ${socket.nsp.name}`);

    // Caso o userId seja passado, armazene no socket
    if (userId) {
      socket.data.userId = userId;
    }

    let offlineTimeout: NodeJS.Timeout | null = null;

    // Quando o cliente se desconectar
    socket.on("disconnect", async () => {
      const userId = socket.data.userId;
      console.log(`Client disconnected: ${socket.id}`);

      if (userId) {
        // Inicia o timer de 60 segundos se tiver necessidade
        offlineTimeout = setTimeout(async () => {
          try {
            // Atualiza o status do usuário para offline instant
            await User.update({ online: false }, { where: { id: userId } });
            console.log(`User ${userId} marcado como off-line após fechar o navegador`);
          } catch (error) {
            console.error("Erro ao marcar o usuário como offline:", error);
          }
        }, 0);  // instant para marcar como offline
      }
    });

    // Quando o cliente reconectar
    socket.on('reconnect', async () => {
      const userId = socket.data.userId;
      console.log(`Client reconnected: ${socket.id}`);

      if (offlineTimeout) {
        // Se o cliente reconectar, limpa o timer
        clearTimeout(offlineTimeout);
        offlineTimeout = null;
      }

      if (userId) {
        try {
          // Atualiza o status para "online"
          await User.update({ online: true }, { where: { id: userId } });
          console.log(`User ${userId} marcado como on-line`);
        } catch (error) {
          console.error("Erro ao marcar o usuário como online:", error);
        }
      }
    });

    // Outros eventos de conexão
    socket.on("joinChatBox", (ticketId: string) => {
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      socket.join("notification");
    });

    socket.on("leaveNotification", () => {
      socket.leave("notification");
    });

    socket.on("joinTickets", (status: string) => {
      socket.join(status);
    });

    socket.on("joinTicketsLeave", (status: string) => {
      socket.leave(status);
    });

    socket.on("joinChatBoxLeave", (ticketId: string) => {
      socket.leave(ticketId);
    });

  });
  
  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
