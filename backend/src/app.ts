import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import * as Sentry from "@sentry/node";
import { config as dotenvConfig } from "dotenv";
import bodyParser from "body-parser";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import logger from "./utils/logger";
import { messageQueue, sendScheduledMessages } from "./queues";
import BullQueue from "./libs/queue";
import BullBoard from "bull-board";
import basicAuth from "basic-auth";
import * as WebHooksController from "./controllers/WebHookController";

// Função de middleware para autenticação básica
export const isBullAuth = (req, res, next) => {
  const user = basicAuth(req);

  if (
    !user ||
    user.name !== process.env.BULL_USER ||
    user.pass !== process.env.BULL_PASS
  ) {
    res.set("WWW-Authenticate", 'Basic realm="example"');
    return res.status(401).send("Authentication required.");
  }
  next();
};

// Carregar variáveis de ambiente
dotenvConfig();

// Inicializar Sentry
Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

// Configuração de filas
app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

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

// Configuração do BullBoard
if (
  String(process.env.BULL_BOARD).toLocaleLowerCase() === "true" &&
  process.env.REDIS_URI_ACK !== ""
) {
  BullBoard.setQueues(BullQueue.queues.map(queue => queue && queue.bull));
  app.use("/admin/queues", isBullAuth, BullBoard.UI);
}

// Middlewares
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'", "https://localhost:8080"],
//       imgSrc: ["'self'", "data:", "https://localhost:8080"],
//       scriptSrc: ["'self'", "https://localhost:8080"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://localhost:8080"],
//       connectSrc: ["'self'", "https://localhost:8080"]
//     }
//   },
//   crossOriginResourcePolicy: false, // Permite recursos de diferentes origens
//   crossOriginEmbedderPolicy: false, // Permite incorporação de diferentes origens
//   crossOriginOpenerPolicy: false, // Permite abertura de diferentes origens
//   // crossOriginResourcePolicy: {
//   //   policy: "cross-origin" // Permite carregamento de recursos de diferentes origens
//   // }
// }));

// CORS deve vir ANTES de outros middlewares
app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      console.log(`[CORS] Origin: ${origin}`);
      if (!origin) {
        return cb(null, true);
      }
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (!allowedOrigin) return false;
        return (
          origin === allowedOrigin ||
          origin.includes(allowedOrigin.replace(/^https?:\/\//, ""))
        );
      });
      if (process.env.NODE_ENV === "production") {
        if (isAllowed) {
          return cb(null, true);
        } else {
          return cb(new Error("Not allowed by CORS"), false);
        }
      }
      return cb(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-CSRF-Token"
    ],
    optionsSuccessStatus: 200,
    preflightContinue: false
  })
);

app.use(compression()); // Compressão HTTP
app.use(bodyParser.json({ limit: "5mb" })); // Aumentar o limite de carga para 5 MB
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
// Middleware para debug de CORS e OPTIONS
app.use((req, res, next) => {
  console.log(
    `[CORS Debug] ${req.method} ${req.url} - Origin: ${req.headers.origin}`
  );

  // Adicionar headers de CORS extras para garantir
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-Requested-With, Accept, Origin, X-CSRF-Token"
  );

  // Se for OPTIONS, responder imediatamente
  if (req.method === "OPTIONS") {
    console.log(`[CORS Debug] Responding to OPTIONS for ${req.url}`);
    return res.status(200).end();
  }

  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use("/public", express.static(uploadConfig.directory));

// Webhook público (Meta/Instagram/Facebook) – montado ANTES de quaisquer rotas que possam ter middleware
app.get("/webhook", WebHooksController.index);
app.get("/webhooks/instagram", WebHooksController.index);
app.post("/webhook", WebHooksController.webHook);
app.post("/webhooks/instagram", WebHooksController.webHook);

// Rotas
app.use(routes);

// Manipulador de erros do Sentry
app.use(Sentry.Handlers.errorHandler());

// Middleware de tratamento de erros
app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
