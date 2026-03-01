import "dotenv/config";
import os from "os";
import cluster from "cluster";
import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import logger from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import Company from "./models/Company";
import BullQueue from "./libs/queue";
import { startQueueProcess } from "./queues";
import { ensureCompaniesSettingsColumns } from "./utils/ensureCompaniesSettingsColumns";
import { ensureFlowSeeds } from "./utils/ensureFlowSeeds";

const PORT = process.env.PORT || 4000;
const clusterWorkerSize = os.cpus().length;

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

if (clusterWorkerSize > 1 && cluster.isMaster) {
  logger.info("Master process %d starting %d workers", process.pid, clusterWorkerSize);

  for (let i = 0; i < clusterWorkerSize; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.warn("Worker %d exited (code: %s, signal: %s). Restarting...", worker.id, code, signal);
    cluster.fork();
  });
} else {
  const server = app.listen(PORT, async () => {
    await startServer(server);
    logger.info(
      "Server started on port %s (worker PID: %d)",
      PORT,
      process.pid
    );
  });

  initIO(server);
  gracefulShutdown(server);

  process.on("uncaughtException", err => {
    logger.error("uncaughtException: %s", err.message);
    logger.error(err.stack);
    setTimeout(() => process.exit(1), 5000);
  });

  process.on("unhandledRejection", (reason, p) => {
    logger.error("unhandledRejection: %s", reason);
    setTimeout(() => process.exit(1), 5000);
  });
}
