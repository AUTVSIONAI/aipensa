import { Router } from "express";
import Setting from "../models/Setting";
import sequelize from "../database";
import cacheLayer from "../libs/cache";
import logger from "../utils/logger";

import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import settingRoutes from "./settingRoutes";
import contactRoutes from "./contactRoutes";
import ticketRoutes from "./ticketRoutes";
import whatsappRoutes from "./whatsappRoutes";
import messageRoutes from "./messageRoutes";
import whatsappSessionRoutes from "./whatsappSessionRoutes";
import queueRoutes from "./queueRoutes";
import companyRoutes from "./companyRoutes";
import planRoutes from "./planRoutes";
import ticketNoteRoutes from "./ticketNoteRoutes";
import quickMessageRoutes from "./quickMessageRoutes";
import helpRoutes from "./helpRoutes";
import dashboardRoutes from "./dashboardRoutes";
import scheduleRoutes from "./scheduleRoutes";
import tagRoutes from "./tagRoutes";
import contactListRoutes from "./contactListRoutes";
import contactListItemRoutes from "./contactListItemRoutes";
import campaignRoutes from "./campaignRoutes";
import campaignSettingRoutes from "./campaignSettingRoutes";
import announcementRoutes from "./announcementRoutes";
import chatRoutes from "./chatRoutes";
import queueIntegrationRoutes from "./queueIntegrationRoutes";
import chatBotRoutes from "./chatBotRoutes";
import webHookRoutes from "./webHookRoutes";
import subScriptionRoutes from "./subScriptionRoutes";
import invoiceRoutes from "./invoicesRoutes";
import apiRoutes from "./apiRoutes";
import versionRouter from "./versionRoutes";
import filesRoutes from "./filesRoutes";
import queueOptionRoutes from "./queueOptionRoutes";
import ticketTagRoutes from "./ticketTagRoutes";
import apiCompanyRoutes from "./api/apiCompanyRoutes";
import apiContactRoutes from "./api/apiContactRoutes";
import apiMessageRoutes from "./api/apiMessageRoutes";
import companySettingsRoutes from "./companySettingsRoutes";
import promptRoutes from "./promptRouter";
import statisticsRoutes from "./statisticsRoutes";
import scheduleMessageRoutes from "./ScheduledMessagesRoutes";
import flowDefaultRoutes from "./flowDefaultRoutes";
import webHook from "./webHookRoutes";
import flowBuilder from "./flowBuilderRoutes";
import flowCampaignRoutes from "./flowCampaignRoutes";
import forgotsRoutes from "./forgotPasswordRoutes";
import imaginasoftRoutes from "./imaginasoftRoutes";
import clinicChatRoutes from "./clinicChatRoutes";
import marketingRoutes from "./marketingRoutes";
import * as WebHooksController from "../controllers/WebHookController";
import instagramRoutes from "./instagramRoutes";
import huggingFaceRoutes from "./huggingFaceRoutes";

import hubChannelRoutes from "../HubEcosystem/routes/hubChannelRoutes";
import hubMessageRoutes from "../HubEcosystem/routes/hubMessageRoutes";
import hubWebhookRoutes from "../HubEcosystem/routes/hubWebhookRoutes";

const routes = Router();

routes.use(userRoutes);
routes.use("/auth", authRoutes);
routes.use("/api/messages", apiRoutes);
routes.use(settingRoutes);
routes.use(contactRoutes);
routes.use(ticketRoutes);
routes.use(whatsappRoutes);
routes.use(messageRoutes);
routes.use(whatsappSessionRoutes);
routes.use(queueRoutes);
routes.use(companyRoutes);
routes.use(planRoutes);
routes.use(ticketNoteRoutes);
routes.use(quickMessageRoutes);
routes.use(helpRoutes);
routes.use(dashboardRoutes);
routes.use(scheduleRoutes);
routes.use(tagRoutes);
routes.use(contactListRoutes);
routes.use(contactListItemRoutes);
routes.use(campaignRoutes);
routes.use(campaignSettingRoutes);
routes.use(announcementRoutes);
routes.use(chatRoutes);
routes.use(chatBotRoutes);
routes.use("/webhook", webHookRoutes);
routes.use("/webhooks/instagram", webHookRoutes);
routes.use(subScriptionRoutes);
routes.use(invoiceRoutes);
routes.use(versionRouter);
routes.use(filesRoutes);
routes.use(queueOptionRoutes);
routes.use(queueIntegrationRoutes);
routes.use(ticketTagRoutes);
routes.use("/api", apiCompanyRoutes);
routes.use("/api", apiContactRoutes);
routes.use("/api", apiMessageRoutes);
routes.use(forgotsRoutes);
routes.use(flowDefaultRoutes);
routes.use(webHook);
routes.use(flowBuilder);
routes.use(flowCampaignRoutes);
routes.use(promptRoutes);
routes.use(statisticsRoutes);
routes.use(companySettingsRoutes);
routes.use(scheduleMessageRoutes);

routes.use("/api/imaginasoft", imaginasoftRoutes);
routes.use("/api/clinic", clinicChatRoutes);
routes.use(marketingRoutes);

// Instagram/Facebook Webhooks (Meta) - alias conforme configuração no Meta
routes.get("/webhooks/instagram", WebHooksController.index);
routes.post("/webhooks/instagram", WebHooksController.webHook);

// Healthcheck with DB and Redis verification
routes.get("/health", async (req, res) => {
  const checks: Record<string, string> = {};
  let healthy = true;

  try {
    await sequelize.authenticate();
    checks.database = "ok";
  } catch (err) {
    checks.database = "error";
    healthy = false;
    logger.error("Health check: database failed", err);
  }

  try {
    const redis = cacheLayer.getRedisInstance();
    await redis.ping();
    checks.redis = "ok";
  } catch (err) {
    checks.redis = "error";
    healthy = false;
    logger.error("Health check: redis failed", err);
  }

  const status = healthy ? 200 : 503;
  return res.status(status).json({ ok: healthy, checks });
});

// Config/health info (sem expor segredos)
routes.get("/health/config", async (req, res) => {
  try {
    const dailyImageLimit =
      parseInt(process.env.DAILY_IMAGE_LIMIT || "", 10) || 3;

    // Verificações básicas de configuração (true/false) sem retornar chaves
    const openaiSetting =
      (await Setting.findOne({
        where: { companyId: 1, key: "userApiToken" }
      })) || null;
    const openrouterSetting =
      (await Setting.findOne({
        where: { companyId: 1, key: "openrouterApiKey" }
      })) || null;
    const whisperSetting =
      (await Setting.findOne({
        where: { companyId: 1, key: "openaikeyaudio" }
      })) || null;

    const openaiConfigured =
      !!process.env.OPENAI_API_KEY || !!openaiSetting?.value;
    const openrouterConfigured =
      !!process.env.OPENROUTER_API_KEY || !!openrouterSetting?.value;
    const whisperConfigured =
      !!process.env.OPENAI_API_KEY || !!whisperSetting?.value;

    return res.json({
      status: "ok",
      dailyImageLimit,
      models: {
        defaultText: "gpt-4o-mini",
        escalateWhen: {
          hasImages: true,
          longContextChars: 8000
        },
        escalateModel: "gpt-4o",
        fallback: "deepseek/deepseek-v3.2"
      },
      providers: {
        openaiConfigured,
        openrouterConfigured,
        whisperConfigured
      }
    });
  } catch (e: any) {
    return res.status(500).json({ status: "error", message: e.message });
  }
});

// Rota padrão para o endpoint raiz
routes.get("/", (req, res) =>
  res.json({
    status: "running",
    message: "API Whaticket está funcionando",
    version: "1.0.0",
    documentation: "https://aipensa.com/docs"
  })
);
routes.use(instagramRoutes);
routes.use(huggingFaceRoutes);

// HubEcosystem
routes.use(hubChannelRoutes);
routes.use(hubMessageRoutes);
routes.use(hubWebhookRoutes);

export default routes;
