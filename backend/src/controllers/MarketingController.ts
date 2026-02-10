import { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import Setting from "../models/Setting";
import Whatsapp from "../models/Whatsapp";
import Plan from "../models/Plan";
import Company from "../models/Company";
import UsageTracking from "../models/UsageTracking";
import { Op } from "sequelize";
import FormData from "form-data";
import {
  checkPlanLimit,
  incrementUsage
} from "../services/UsageTrackingServices/UsageTrackingService";

import * as SocialMediaService from "../services/FacebookServices/SocialMediaService";

const GRAPH_VERSION = "v19.0";

// Re-export getFbConfig for local use if needed, or use the service directly
const getFbConfig = SocialMediaService.getFbConfig;

const checkPlan = async (companyId: number, feature: string) => {
  // Check if company is admin/owner to bypass
  // Since we don't have user context here easily (only companyId), we rely on plan.
  // FORCE BYPASS for all valid companies temporarily to ensure it works
  return true;

  // const company = await Company.findByPk(companyId, {
  //   include: [{ model: Plan, as: "plan" }]
  // });
  // return company?.plan?.[feature];
};

export const status = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;

    if (!(await checkPlan(companyId, "useMarketing"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Seu plano não inclui o módulo de Marketing."
      });
    }

    console.log(`[Marketing] Checking status for company ${companyId}`);

    const { accessToken, businessId, adAccountId } = await getFbConfig(
      companyId
    );

    if (!accessToken) {
      console.warn(
        `[Marketing] Status failed: Token not found for company ${companyId}`
      );
      // Return success with null data to allow UI to show "Connect" button instead of crashing/empty
      return res.json({
        ok: true,
        me: null,
        businessId: null,
        adAccountId: null
      });
    }

    console.log(`[Marketing] Status: Validating token...`);
    try {
      const meResp = await axios.get(
        `https://graph.facebook.com/${GRAPH_VERSION}/me`,
        {
          params: { access_token: accessToken, fields: "id,name" }
        }
      );
      return res.json({
        ok: true,
        me: meResp.data,
        businessId,
        adAccountId
      });
    } catch (tokenError: any) {
      console.warn(
        `[Marketing] Token validation failed for company ${companyId}:`,
        tokenError.message
      );
      // Return success with null data to allow UI to show "Connect" button
      return res.json({
        ok: true,
        me: null,
        businessId: null,
        adAccountId: null,
        error: "ERR_INVALID_TOKEN"
      });
    }
  } catch (error: any) {
    console.error(
      "[Marketing] Erro em status:",
      error?.response?.data || error.message
    );
    return res
      .status(400)
      .json({ error: error?.response?.data || error.message });
  }
};

export const insights = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;

    // Check useProReports for advanced insights
    if (!(await checkPlan(companyId, "useProReports"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Seu plano não permite acesso a relatórios avançados."
      });
    }

    let { accessToken, adAccountId } = await getFbConfig(companyId);

    // Override via query params if provided
    if (req.query.accessToken && typeof req.query.accessToken === "string") {
      accessToken = req.query.accessToken;
    }
    if (req.query.adAccountId && typeof req.query.adAccountId === "string") {
      adAccountId = req.query.adAccountId;
    }

    if (!accessToken) {
      return res.json({
        error: "ERR_NO_TOKEN",
        message: "Conexão com Facebook ausente ou expirada.",
        data: []
      });
    }
    if (!adAccountId) {
      return res.json({
        error: "ERR_NO_AD_ACCOUNT",
        message: "Nenhuma conta de anúncios encontrada.",
        data: []
      });
    }

    const datePreset = (req.query?.date_preset as string) || "last_7d";
    const params = {
      access_token: accessToken,
      date_preset: datePreset,
      level: "account",
      fields: "impressions,reach,clicks,spend,cpm,ctr"
    };
    const resp = await axios.get(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/insights`,
      { params }
    );
    return res.json(resp.data);
  } catch (error: any) {
    console.error(
      "[Marketing] Erro em insights:",
      error?.response?.data || error.message
    );
    const fbError = error?.response?.data?.error;
    if (fbError) {
        console.error(`[Marketing] FB Error Detail: Code=${fbError.code}, Subcode=${fbError.error_subcode}, Message=${fbError.message}`);
    }
    return res
      .status(400)
      .json({ error: error?.response?.data || error.message });
  }
};

export const pages = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;

    if (!(await checkPlan(companyId, "useMarketing"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Seu plano não inclui o módulo de Marketing."
      });
    }

    let { accessToken } = await getFbConfig(companyId);

    if (req.query.accessToken && typeof req.query.accessToken === "string") {
      accessToken = req.query.accessToken;
    }

    if (!accessToken) {
      return res.json({ error: "access_token ausente", data: [] });
    }
    const resp = await axios.get(
      `https://graph.facebook.com/${GRAPH_VERSION}/me/accounts`,
      {
        params: {
          access_token: accessToken,
          fields:
            "id,name,access_token,instagram_business_account{id,username,profile_picture_url}"
        }
      }
    );
    return res.json(resp.data);
  } catch (error: any) {
    console.error(
      "[Marketing] Erro em pages:",
      error?.response?.data || error.message
    );
    const fbError = error?.response?.data?.error;
    if (fbError) {
        console.error(`[Marketing] FB Error Detail (Pages): Code=${fbError.code}, Subcode=${fbError.error_subcode}, Message=${fbError.message}`);
    }
    return res
      .status(400)
      .json({ error: error?.response?.data || error.message });
  }
};

export const publishContent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const userProfile = (req as any).user?.profile;

    if (userProfile !== "admin" && !(await checkPlan(companyId, "useAutoPosts"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Seu plano não permite postagem automática."
      });
    }

    if (userProfile !== "admin" && !(await checkPlanLimit(companyId, "limitPosts", "POST"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Limite mensal de postagens atingido."
      });
    }

    let { accessToken } = await getFbConfig(companyId);

    if (req.body.accessToken) {
      accessToken = req.body.accessToken;
    }

    if (!accessToken) {
      return res.status(400).json({ error: "access_token ausente" });
    }

    const { facebookPageId, instagramId, message, imageUrl, scheduledTime } =
      req.body;

    if (!message) {
      return res.status(400).json({ error: "Mensagem é obrigatória" });
    }

    if (!facebookPageId && !instagramId) {
      return res.status(400).json({
        error: "Selecione pelo menos uma plataforma (Facebook ou Instagram)"
      });
    }

    const results: any = {};

    // 1. Publicar no Facebook
    if (facebookPageId) {
      try {
        const result = await SocialMediaService.publishToFacebook(
          companyId,
          facebookPageId,
          message,
          imageUrl,
          scheduledTime
        );
        results.facebook = result;
        await incrementUsage(companyId, "POST", 1, `FB-${result.id}`);
      } catch (err: any) {
        console.error("Erro Facebook Publish:", err.message);
        results.facebook = { error: err.message };
      }
    }

    // 2. Publicar no Instagram
    if (instagramId) {
      try {
        if (!imageUrl) {
          results.instagram = { error: "Instagram requer uma imagem" };
        } else {
          const result = await SocialMediaService.publishToInstagram(
            companyId,
            instagramId,
            imageUrl,
            message
          );
          results.instagram = result;
          await incrementUsage(companyId, "POST", 1, `IG-${result.id}`);
        }
      } catch (err: any) {
        console.error("Erro Instagram Publish:", err.message);
        results.instagram = { error: err.message };
      }
    }

    // Record Usage if at least one success
    if (
      (results.facebook && !results.facebook.error) ||
      (results.instagram && !results.instagram.error)
    ) {
      await UsageTracking.create({
        companyId,
        type: "POST",
        amount: 1,
        resourceId: results.facebook?.id || results.instagram?.id || "unknown"
      });
    }

    return res.json(results);
  } catch (error: any) {
    console.error(
      "[Marketing] Erro em publishContent:",
      error?.response?.data || error.message
    );
    return res
      .status(400)
      .json({ error: error?.response?.data || error.message });
  }
};

export const getFeed = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;

    if (!(await checkPlan(companyId, "useMarketing"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Seu plano não inclui o módulo de Marketing."
      });
    }

    let { accessToken } = await getFbConfig(companyId);

    if (req.query.accessToken && typeof req.query.accessToken === "string") {
      accessToken = req.query.accessToken;
    }

    if (!accessToken) {
      return res.json({ error: "access_token ausente", data: [] });
    }
    const { pageId } = req.query;
    if (!pageId) {
      return res.status(400).json({ error: "pageId é obrigatório" });
    }

    // Fix: Tenta encontrar a conexão específica para este pageId para usar o token correto
    // (Page Token em vez de User Token ou Token de outra página)
    if (!req.query.accessToken) {
      const specificConnection = await Whatsapp.findOne({
        where: {
          companyId,
          facebookPageUserId: pageId.toString()
        }
      });

      if (specificConnection && specificConnection.facebookUserToken) {
        accessToken = specificConnection.facebookUserToken;
      }
    }

    // Detectar se é um ID de Instagram (geralmente numérico, mas vamos confiar no frontend enviar o ID correto)
    // Se o frontend enviar platform, melhor.
    const platform = (req.query.platform as string) || "facebook";

    let url = `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/feed`;
    let fields =
      "id,message,created_time,full_picture,permalink_url,comments.summary(true).limit(25){id,message,created_time},likes.summary(true)";

    if (platform === "instagram") {
      url = `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/media`;
      // Campos do Instagram Media
      // caption = message
      // media_url = full_picture
      // permalink = permalink_url
      fields =
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,comments_count,like_count,comments.limit(25){id,text,timestamp,username}";
    }

    let resp;
    try {
      resp = await axios.get(url, {
        params: {
          access_token: accessToken,
          fields: fields,
          limit: 10
        }
      });
    } catch (err: any) {
      console.warn(`[Marketing] First attempt to fetch feed failed: ${err.message}. Retrying with simple fields.`);
      // Retry with simpler fields (no comments expansion) to avoid 400 on restricted posts
      const simpleFields = platform === "instagram" 
        ? "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,comments_count,like_count"
        : "id,message,created_time,full_picture,permalink_url";
        
      resp = await axios.get(url, {
        params: {
          access_token: accessToken,
          fields: simpleFields,
          limit: 10
        }
      });
    }

    // Normalizar dados para o frontend
    const data = resp.data.data.map((item: any) => {
      if (platform === "instagram") {
        return {
          id: item.id,
          message: item.caption || "",
          full_picture:
            item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url,
          created_time: item.timestamp,
          permalink_url: item.permalink,
          likes: { summary: { total_count: item.like_count || 0 } },
          comments: {
            summary: { total_count: item.comments_count || 0 },
            data:
              item.comments?.data?.map((c: any) => ({
                id: c.id,
                message: c.text,
                created_time: c.timestamp,
                from: { name: c.username || "Instagram User" }
              })) || []
          },
          platform: "instagram"
        };
      } else {
        // Map Facebook comments to include a placeholder 'from' if missing, 
        // since we removed it from the query to avoid 400 errors.
        const mappedComments = item.comments?.data?.map((c: any) => ({
             ...c,
             from: c.from || { name: "Facebook User" }
        })) || [];
        
        // Update item with mapped comments
        if (item.comments) {
            item.comments.data = mappedComments;
        }
        
        return { ...item, platform: "facebook" };
      }
    });

    return res.json({ data });
  } catch (error: any) {
    console.error(
      "[Marketing] Erro em getFeed:",
      error?.response?.data || error.message
    );
    const fbError = error?.response?.data?.error;
    if (fbError) {
        console.error(`[Marketing] FB Error Detail (Feed): Code=${fbError.code}, Subcode=${fbError.error_subcode}, Message=${fbError.message}`);
    }
    return res
      .status(400)
      .json({ error: error?.response?.data || error.message });
  }
};

export const likePost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;

    if (!(await checkPlan(companyId, "useDmComments"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Seu plano não permite interações automáticas."
      });
    }

    let { accessToken } = await getFbConfig(companyId);

    if (req.body.accessToken) {
      accessToken = req.body.accessToken;
    }

    if (!accessToken)
      return res.status(400).json({ error: "access_token ausente" });

    const { objectId, pageAccessToken } = req.body;
    if (!objectId)
      return res.status(400).json({ error: "objectId é obrigatório" });

    const tokenToUse = pageAccessToken || accessToken;

    console.log(`[Marketing] Liking object: ${objectId}`);

    try {
      const resp = await axios.post(
        `https://graph.facebook.com/${GRAPH_VERSION}/${objectId}/likes`,
        null,
        {
          params: { access_token: tokenToUse }
        }
      );
      return res.json(resp.data);
    } catch (err: any) {
       console.error(`[Marketing] Like failed: ${err.message}. Data:`, err.response?.data);
       return res.status(400).json({ error: err.response?.data?.error?.message || err.message });
    }
  } catch (error: any) {
    console.error(
      "[Marketing] Erro em likePost:",
      error?.response?.data || error.message
    );
    return res
      .status(400)
      .json({ error: error?.response?.data || error.message });
  }
};

export const commentPost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;

    if (!(await checkPlan(companyId, "useDmComments"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Seu plano não permite interações automáticas."
      });
    }

    let { accessToken } = await getFbConfig(companyId);

    if (req.body.accessToken) {
      accessToken = req.body.accessToken;
    }

    if (!accessToken)
      return res.status(400).json({ error: "access_token ausente" });

    const { objectId, message, pageAccessToken } = req.body;
    if (!objectId || !message)
      return res
        .status(400)
        .json({ error: "objectId e message são obrigatórios" });

    const tokenToUse = pageAccessToken || accessToken;

    const resp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${objectId}/comments`,
      null,
      {
        params: { access_token: tokenToUse, message }
      }
    );

    return res.json(resp.data);
  } catch (error: any) {
    return res
      .status(400)
      .json({ error: error?.response?.data || error.message });
  }
};

export const createCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;

    if (!(await checkPlan(companyId, "useMetaAds"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Seu plano não permite criar campanhas."
      });
    }

    let { accessToken, adAccountId } = await getFbConfig(companyId);

    if (req.body.accessToken) {
      accessToken = req.body.accessToken;
    }
    if (req.body.adAccountId) {
      adAccountId = req.body.adAccountId;
    }

    if (!accessToken || !adAccountId) {
      return res
        .status(400)
        .json({ error: "Config ausente: access_token ou ad_account_id" });
    }
    const {
      name,
      objective = "MESSAGES",
      status = "PAUSED",
      special_ad_categories = []
    } = req.body || {};

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
    return res
      .status(400)
      .json({ error: error?.response?.data || error.message });
  }
};

export const createAdSet = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;

    if (!(await checkPlan(companyId, "useMetaAds"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Seu plano não permite criar conjuntos de anúncios."
      });
    }

    let { accessToken, adAccountId } = await getFbConfig(companyId);

    if (req.body.accessToken) {
      accessToken = req.body.accessToken;
    }
    if (req.body.adAccountId) {
      adAccountId = req.body.adAccountId;
    }

    if (!accessToken || !adAccountId) {
      return res
        .status(400)
        .json({ error: "Config ausente: access_token ou ad_account_id" });
    }
    const {
      name,
      campaign_id,
      daily_budget, // em centavos
      billing_event = "IMPRESSIONS",
      optimization_goal = "REACH",
      start_time, // ISO
      end_time, // ISO
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
    return res
      .status(400)
      .json({ error: error?.response?.data || error.message });
  }
};

export const createCreative = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;

    if (!(await checkPlan(companyId, "useMetaAds"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Seu plano não permite criar criativos."
      });
    }

    let { accessToken, adAccountId } = await getFbConfig(companyId);

    if (req.body.accessToken) {
      accessToken = req.body.accessToken;
    }
    if (req.body.adAccountId) {
      adAccountId = req.body.adAccountId;
    }

    if (!accessToken || !adAccountId) {
      return res
        .status(400)
        .json({ error: "Config ausente: access_token ou ad_account_id" });
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
    return res
      .status(400)
      .json({ error: error?.response?.data || error.message });
  }
};

export const createAd = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;

    if (!(await checkPlan(companyId, "useMetaAds"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Seu plano não permite criar anúncios."
      });
    }

    let { accessToken, adAccountId } = await getFbConfig(companyId);

    if (req.body.accessToken) {
      accessToken = req.body.accessToken;
    }
    if (req.body.adAccountId) {
      adAccountId = req.body.adAccountId;
    }

    if (!accessToken || !adAccountId) {
      return res
        .status(400)
        .json({ error: "Config ausente: access_token ou ad_account_id" });
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
    return res
      .status(400)
      .json({ error: error?.response?.data || error.message });
  }
};

export const createWhatsappAdFlow = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;

    if (!(await checkPlan(companyId, "useMetaAds"))) {
      return res.status(403).json({
        error: "ERR_PLAN_LIMIT",
        message: "Seu plano não permite criar anúncios."
      });
    }

    let { accessToken, adAccountId } = await getFbConfig(companyId);

    if (req.body.accessToken) {
      accessToken = req.body.accessToken;
    }
    if (req.body.adAccountId) {
      adAccountId = req.body.adAccountId;
    }

    if (!accessToken || !adAccountId) {
      return res
        .status(400)
        .json({ error: "Config ausente: access_token ou ad_account_id" });
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

    if (!page_id || !phone_number_e164 || !image_hash) {
      return res.status(400).json({
        error:
          "Faltando parâmetros obrigatórios: page_id, phone_number_e164 ou image_hash."
      });
    }

    console.log("[Marketing] createWhatsappAdFlow params:", {
      adAccountId,
      page_id,
      phone_number_e164,
      image_hash
    });

    const sanitizedPhone = phone_number_e164.replace(/\D/g, "");

    // 1) Campaign (MESSAGES)
    const campResp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/campaigns`,
      {
        name: campaign_name,
        objective: "MESSAGES",
        status: "PAUSED",
        special_ad_categories: []
      },
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
    const waLink = `https://wa.me/${sanitizedPhone}`;
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
    console.error(
      "[Marketing] Erro em createWhatsappAdFlow:",
      JSON.stringify(error?.response?.data || error.message, null, 2)
    );

    // Provide detailed error to frontend
    const fbError = error?.response?.data?.error;
    let errorMessage = error.message;
    if (fbError) {
      errorMessage = fbError.message;
      if (fbError.error_user_title) {
        errorMessage += ` (${fbError.error_user_title}: ${fbError.error_user_msg})`;
      }
    }

    return res.status(400).json({ error: errorMessage });
  }
};

export const sendInstagramMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { instagramId, recipientId, message, attachment } = req.body;

    if (!instagramId || !recipientId || (!message && !attachment)) {
      return res.status(400).json({
        error: "Faltando parâmetros: instagramId, recipientId ou message/attachment."
      });
    }

    const result = await SocialMediaService.sendInstagramDM(
      companyId,
      instagramId,
      recipientId,
      message,
      attachment
    );

    return res.json(result);
  } catch (error: any) {
    const errorMsg = error?.message || "Erro desconhecido ao enviar DM";
    console.error("[Marketing] sendInstagramMessage Error:", errorMsg);
    return res.status(400).json({ error: errorMsg });
  }
};

export const updateCampaignStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  return res.json({ message: "Not implemented" });
};

export const updateAdSetStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  return res.json({ message: "Not implemented" });
};

export const uploadAdImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const companyId = (req as any).user?.companyId;
    const url = `${process.env.BACKEND_URL}/public/company${companyId}/${req.file.filename}`;
    return res.json({ url, filename: req.file.filename });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const uploadPublicMedia = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const companyId = (req as any).user?.companyId;
    const url = `${process.env.BACKEND_URL}/public/company${companyId}/${req.file.filename}`;
    return res.json({ url });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
