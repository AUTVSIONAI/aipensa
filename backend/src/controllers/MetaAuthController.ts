import { Request, Response } from "express";
import * as MetaAuthService from "../services/FacebookServices/MetaAuthService";
import MetaIntegration from "../models/MetaIntegration";
import MetaPage from "../models/MetaPage";
import MetaAdsAccount from "../models/MetaAdsAccount";
import Whatsapp from "../models/Whatsapp";

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { shortToken } = req.body;
  const userId = parseInt(req.user.id);

  try {
    const integration = await MetaAuthService.saveMetaIntegration(userId, shortToken);
    return res.json(integration);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getPages = async (req: Request, res: Response): Promise<Response> => {
  const userId = parseInt(req.user.id);
  try {
    const integration = await MetaIntegration.findOne({ where: { userId } });
    if (!integration) return res.status(404).json({ error: "Integration not found" });

    const pages = await MetaPage.findAll({ where: { integrationId: integration.id } });
    return res.json(pages);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAdAccounts = async (req: Request, res: Response): Promise<Response> => {
  const userId = parseInt(req.user.id);
  try {
    const integration = await MetaIntegration.findOne({ where: { userId } });
    if (!integration) return res.status(404).json({ error: "Integration not found" });

    const accounts = await MetaAdsAccount.findAll({ where: { integrationId: integration.id } });
    return res.json(accounts);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const clearIntegration = async (req: Request, res: Response): Promise<Response> => {
  const userId = parseInt(req.user.id);
  try {
    const integration = await MetaIntegration.findOne({ where: { userId } });
    if (!integration) return res.status(404).json({ error: "Integration not found" });

    // Limpar todas as páginas e contas relacionadas
    await MetaPage.destroy({ where: { integrationId: integration.id } });
    await MetaAdsAccount.destroy({ where: { integrationId: integration.id } });
    await integration.destroy();

    // Também limpar o token do WhatsApp se existir
    const whatsapp = await Whatsapp.findOne({ where: { userId } });
    if (whatsapp) {
      await whatsapp.update({ 
        tokenMeta: null,
        facebookUserToken: null
      });
    }

    return res.json({ message: "Integração removida com sucesso" });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
