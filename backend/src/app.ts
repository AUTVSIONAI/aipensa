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

import { allowedOrigins } from "./config/cors";

// Configuração do BullBoard
if (
  String(process.env.BULL_BOARD).toLocaleLowerCase() === "true" &&
  process.env.REDIS_URI_ACK !== ""
) {
  BullBoard.setQueues(BullQueue.queues.map(queue => queue && queue.bull));
  app.use("/admin/queues", isBullAuth, BullBoard.UI);
}

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // API-only, no HTML to protect
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
  })
);

// CORS with origin whitelist
app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      return cb(new Error("Not allowed by CORS"));
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

app.use(compression());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

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
