import "dotenv/config";
import gracefulShutdown from "http-graceful-shutdown";
import https from "https";
import fs from "fs";
import path from "path";
import app from "./app";
import cron from "node-cron";
import { initIO } from "./libs/socket";
import logger from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import Company from "./models/Company";
import Plan from "./models/Plan";
import Setting from "./models/Setting";
import BullQueue from "./libs/queue";
import { startQueueProcess } from "./queues";
import { ensureCompaniesSettingsColumns } from "./utils/ensureCompaniesSettingsColumns";
import { ensureFlowSeeds } from "./utils/ensureFlowSeeds";

const startServer = async (server: any) => {
  await ensureCompaniesSettingsColumns();
  await ensureFlowSeeds();
  const companies = await Company.findAll({
    where: { status: true },
    attributes: ["id"]
  });

  const allPromises: any[] = [];
  companies.map(async c => {
    const promise = StartAllWhatsAppsSessions(c.id);
    allPromises.push(promise);
  });

  Promise.all(allPromises).then(async () => {
    await startQueueProcess();
  });

  if (process.env.REDIS_URI_ACK && process.env.REDIS_URI_ACK !== "") {
    BullQueue.process();
  }
};

if (process.env.CERTIFICADOS == "true") {
  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_FILE),
    cert: fs.readFileSync(process.env.SSL_CRT_FILE)
  };

  const server = https
    .createServer(httpsOptions, app)
    .listen(process.env.PORT, async () => {
      await startServer(server);
      logger.info(`Server started on port: ${process.env.PORT} with HTTPS`);
    });

  initIO(server);
  gracefulShutdown(server);
} else {
  const server = app.listen(process.env.PORT, async () => {
    await startServer(server);
    logger.info(`Server started on port: ${process.env.PORT}`);
  });

  initIO(server);
  gracefulShutdown(server);
}

process.on("uncaughtException", err => {
  logger.error(`uncaughtException: ${err.message}`);
  logger.error(err.stack);
  setTimeout(() => process.exit(1), 5000);
});

process.on("unhandledRejection", (reason, p) => {
  logger.error(`unhandledRejection: ${reason}`);
  setTimeout(() => process.exit(1), 5000);
});
