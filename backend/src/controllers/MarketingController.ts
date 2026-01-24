import { Request, Response } from "express";
import axios from "axios";
import Setting from "../models/Setting";
import FormData from "form-data";

const GRAPH_VERSION = "v19.0";

async function getFbConfig(companyId?: number) {
  let accessToken: string | null = null;
  let businessId: string | null = null;
  let adAccountId: string | null = null;

  if (companyId) {
    const at = await Setting.findOne({
      where: { companyId, key: "facebook_access_token" }
    });
    const bid = await Setting.findOne({
      where: { companyId, key: "facebook_business_id" }
    });
    const act = await Setting.findOne({
      where: { companyId, key: "facebook_ad_account_id" }
    });
    accessToken = at?.value || null;
    businessId = bid?.value || null;
    adAccountId = act?.value || null;
  }

  accessToken = accessToken || process.env.FACEBOOK_ACCESS_TOKEN || null;
  businessId = businessId || process.env.FACEBOOK_BUSINESS_ID || null;
  adAccountId = adAccountId || process.env.FACEBOOK_AD_ACCOUNT_ID || null;

  return { accessToken, businessId, adAccountId };
}

export const status = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken, businessId, adAccountId } = await getFbConfig(companyId);
    if (!accessToken) {
      return res.status(400).json({ error: "facebook_access_token ausente" });
    }
    const meResp = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/me`, {
      params: { access_token: accessToken, fields: "id,name" }
    });
    return res.json({
      ok: true,
      me: meResp.data,
      businessId,
      adAccountId
    });
  } catch (error: any) {
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const insights = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken, adAccountId } = await getFbConfig(companyId);
    if (!accessToken || !adAccountId) {
      return res.status(400).json({ error: "Config ausente: access_token ou ad_account_id" });
    }
    const params = {
      access_token: accessToken,
      date_preset: "last_7d",
      level: "account",
      fields: "impressions,reach,clicks,spend,cpm,ctr"
    };
    const resp = await axios.get(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/insights`,
      { params }
    );
    return res.json(resp.data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const pages = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken } = await getFbConfig(companyId);
    if (!accessToken) {
      return res.status(400).json({ error: "access_token ausente" });
    }
    const resp = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/me/accounts`, {
      params: { access_token: accessToken, fields: "id,name" }
    });
    return res.json(resp.data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const createCampaign = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken, adAccountId } = await getFbConfig(companyId);
    if (!accessToken || !adAccountId) {
      return res.status(400).json({ error: "Config ausente: access_token ou ad_account_id" });
    }
    const { name, objective = "MESSAGES", status = "PAUSED", special_ad_categories = [] } = req.body || {};

    const payload = {
      name,
      objective,
      status,
      special_ad_categories
    };

    const resp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/campaigns`,
      payload,
      { params: { access_token: accessToken } }
    );
    return res.json(resp.data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const createAdSet = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken, adAccountId } = await getFbConfig(companyId);
    if (!accessToken || !adAccountId) {
      return res.status(400).json({ error: "Config ausente: access_token ou ad_account_id" });
    }
    const {
      name,
      campaign_id,
      daily_budget, // em centavos
      billing_event = "IMPRESSIONS",
      optimization_goal = "REACH",
      start_time, // ISO
      end_time,   // ISO
      status = "PAUSED",
      targeting = { geo_locations: { countries: ["BR"] } }
    } = req.body || {};

    const payload = {
      name,
      campaign_id,
      daily_budget,
      billing_event,
      optimization_goal,
      start_time,
      end_time,
      status,
      targeting
    };

    const resp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/adsets`,
      payload,
      { params: { access_token: accessToken } }
    );
    return res.json(resp.data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const createCreative = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken, adAccountId } = await getFbConfig(companyId);
    if (!accessToken || !adAccountId) {
      return res.status(400).json({ error: "Config ausente: access_token ou ad_account_id" });
    }
    const {
      page_id,
      link,
      image_hash,
      message // texto do anúncio
    } = req.body || {};

    const object_story_spec = {
      page_id,
      link_data: {
        link,
        message,
        image_hash
      }
    };

    const payload = { name: "Creative Link", object_story_spec };

    const resp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/adcreatives`,
      payload,
      { params: { access_token: accessToken } }
    );
    return res.json(resp.data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const createAd = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken, adAccountId } = await getFbConfig(companyId);
    if (!accessToken || !adAccountId) {
      return res.status(400).json({ error: "Config ausente: access_token ou ad_account_id" });
    }
    const { name, adset_id, creative_id, status = "PAUSED" } = req.body || {};

    const payload = {
      name,
      adset_id,
      creative: { creative_id },
      status
    };

    const resp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/ads`,
      payload,
      { params: { access_token: accessToken } }
    );
    return res.json(resp.data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const createWhatsappAdFlow = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken, adAccountId } = await getFbConfig(companyId);
    if (!accessToken || !adAccountId) {
      return res.status(400).json({ error: "Config ausente: access_token ou ad_account_id" });
    }
    const {
      campaign_name = "Campanha WhatsApp",
      adset_name = "AdSet WhatsApp",
      daily_budget = 1000,
      targeting = { geo_locations: { countries: ["BR"] } },
      page_id,
      phone_number_e164, // ex: 5511912345678
      image_hash,
      message_text = "Fale conosco no WhatsApp",
      ad_name = "Anúncio WhatsApp"
    } = req.body || {};

    // 1) Campaign (MESSAGES)
    const campResp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/campaigns`,
      { name: campaign_name, objective: "MESSAGES", status: "PAUSED", special_ad_categories: [] },
      { params: { access_token: accessToken } }
    );
    const campaign_id = campResp.data.id;

    // 2) AdSet
    const adsetResp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/adsets`,
      {
        name: adset_name,
        campaign_id,
        daily_budget,
        billing_event: "IMPRESSIONS",
        optimization_goal: "REACH",
        status: "PAUSED",
        targeting
      },
      { params: { access_token: accessToken } }
    );
    const adset_id = adsetResp.data.id;

    // 3) Creative (link to wa.me for fallback; páginas com WhatsApp conectado podem exibir CTA WhatsApp)
    const waLink = `https://wa.me/${phone_number_e164}`;
    const object_story_spec = {
      page_id,
      link_data: {
        link: waLink,
        message: message_text,
        ...(image_hash ? { image_hash } : {})
      }
    };
    const creativeResp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/adcreatives`,
      { name: "Creative WhatsApp Link", object_story_spec },
      { params: { access_token: accessToken } }
    );
    const creative_id = creativeResp.data.id;

    // 4) Ad
    const adResp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/ads`,
      { name: ad_name, adset_id, creative: { creative_id }, status: "PAUSED" },
      { params: { access_token: accessToken } }
    );

    return res.json({
      campaign_id,
      adset_id,
      creative_id,
      ad_id: adResp.data.id
    });
  } catch (error: any) {
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const updateCampaignStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken } = await getFbConfig(companyId);
    const { campaign_id, status } = req.body || {};
    if (!accessToken || !campaign_id || !status) {
      return res.status(400).json({ error: "params_missing" });
    }
    const resp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${campaign_id}`,
      { status },
      { params: { access_token: accessToken } }
    );
    return res.json(resp.data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const updateAdSetStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken } = await getFbConfig(companyId);
    const { adset_id, status } = req.body || {};
    if (!accessToken || !adset_id || !status) {
      return res.status(400).json({ error: "params_missing" });
    }
    const resp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${adset_id}`,
      { status },
      { params: { access_token: accessToken } }
    );
    return res.json(resp.data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const uploadAdImage = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken, adAccountId } = await getFbConfig(companyId);
    if (!accessToken || !adAccountId) {
      return res.status(400).json({ error: "config_missing" });
    }
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "file_missing" });
    }
    const form = new FormData();
    form.append("source", file.buffer, { filename: file.originalname, contentType: file.mimetype });
    const resp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/adimages`,
      form,
      {
        params: { access_token: accessToken },
        headers: form.getHeaders()
      }
    );
    return res.json(resp.data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};
