import "dotenv/config";
import gracefulShutdown from "http-graceful-shutdown";
import https from "https"; // Importando https para o servidor
import fs from "fs"; // Para ler os arquivos do certificado
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

if (process.env.CERTIFICADOS == "true") {
  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_FILE),
    cert: fs.readFileSync(process.env.SSL_CRT_FILE)
  };

  const server = https
    .createServer(httpsOptions, app)
    .listen(process.env.PORT, async () => {
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

      logger.info(`Server started on port: ${process.env.PORT} with HTTPS`);
    });

  process.on("uncaughtException", err => {
    console.error(
      `${new Date().toUTCString()} uncaughtException:`,
      err.message
    );
    console.error(err.stack);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, p) => {
    console.error(`${new Date().toUTCString()} unhandledRejection:`, reason, p);
    process.exit(1);
  });

  initIO(server);
  gracefulShutdown(server);
} else {
  const server = app.listen(process.env.PORT, async () => {
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

    logger.info(`Server started on port: ${process.env.PORT}`);

    try {
      const allCompanies = await Company.findAll({
        include: [{ model: Plan, as: "plan", required: false }]
      });
      console.log(`[VERIFY] Total Companies: ${allCompanies.length}`);
      allCompanies.forEach(c => {
        console.log(
          `[VERIFY] ID: ${c.id}, Name: ${c.name}, Plan: ${
            c.plan?.name || "None"
          }, Status: ${c.status}`
        );
      });
      const settings = await Setting.findAll();
      console.log(`[VERIFY] Total Settings: ${settings.length}`);
      settings.forEach(s => {
        console.log(
          `[VERIFY] Key: ${s.key}, Value: ${s.value}, CompanyId: ${s.companyId}`
        );
      });
    } catch (e) {
      console.error("[VERIFY] Error:", e);
    }
  });

  process.on("uncaughtException", err => {
    console.error(
      `${new Date().toUTCString()} uncaughtException:`,
      err.message
    );
    console.error(err.stack);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, p) => {
    console.error(`${new Date().toUTCString()} unhandledRejection:`, reason, p);
    process.exit(1);
  });

  initIO(server);
  gracefulShutdown(server);
}
