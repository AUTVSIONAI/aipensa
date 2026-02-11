import { Request, Response } from "express";
import * as MetaAuthService from "../services/FacebookServices/MetaAuthService";
import MetaIntegration from "../models/MetaIntegration";
import MetaPage from "../models/MetaPage";
import MetaAdsAccount from "../models/MetaAdsAccount";

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
