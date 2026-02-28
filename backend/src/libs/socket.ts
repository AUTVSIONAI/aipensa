import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import { verify } from "jsonwebtoken";
import AppError from "../errors/AppError";
import authConfig from "../config/auth";
import User from "../models/User";
import logger from "../utils/logger";

let io: SocketIO;

const normalizeOrigin = (value?: string) =>
  value ? value.replace(/\/$/, "") : value;

const allowedOrigins = [
  normalizeOrigin(process.env.FRONTEND_URL),
  normalizeOrigin(process.env.BACKEND_URL),
  "http://localhost:3000",
  "http://localhost:3001",
  "https://aipensa.com",
  "https://api.aipensa.com"
].filter(Boolean);

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
  });

  const workspaces = io.of(/^\/\w+$/);
  workspaces.on("connection", socket => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token;

    if (!token || typeof token !== "string") {
      logger.warn(`Socket rejected: no token provided (${socket.id})`);
      socket.disconnect(true);
      return;
    }

    // Strip JSON quotes if token was stored with JSON.stringify
    const cleanToken = token.replace(/^"|"$/g, "");

    try {
      const decoded = verify(cleanToken, authConfig.secret) as any;
      socket.data.userId = decoded.id;
      socket.data.companyId = decoded.companyId;
    } catch (err) {
      logger.warn(`Socket rejected: invalid token (${socket.id})`);
      socket.disconnect(true);
      return;
    }

    logger.info(`Socket connected: ${socket.id} ns=${socket.nsp.name} user=${socket.data.userId}`);

    let offlineTimeout: NodeJS.Timeout | null = null;

    socket.on("disconnect", async () => {
      const userId = socket.data.userId;
      logger.info(`Socket disconnected: ${socket.id}`);

      if (userId) {
        offlineTimeout = setTimeout(async () => {
          try {
            await User.update({ online: false }, { where: { id: userId } });
          } catch (error) {
            logger.error("Error marking user offline:", error);
          }
        }, 0);
      }
    });

    socket.on("reconnect", async () => {
      const userId = socket.data.userId;

      if (offlineTimeout) {
        clearTimeout(offlineTimeout);
        offlineTimeout = null;
      }

      if (userId) {
        try {
          await User.update({ online: true }, { where: { id: userId } });
        } catch (error) {
          logger.error("Error marking user online:", error);
        }
      }
    });

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
