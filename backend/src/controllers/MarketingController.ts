import { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import Setting from "../models/Setting";
import Whatsapp from "../models/Whatsapp";
import { Op } from "sequelize";
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

    // Fallback: Se não houver token nas configurações, tentar encontrar nas conexões (Whatsapps table)
    if (!accessToken) {
      const whatsapp = await Whatsapp.findOne({
        where: {
          companyId,
          channel: { [Op.or]: ["facebook", "instagram"] },
          [Op.or]: [
            { 
              tokenMeta: { 
                [Op.and]: [
                  { [Op.ne]: null },
                  { [Op.ne]: "" }
                ] 
              } 
            },
            { 
              facebookUserToken: { 
                [Op.and]: [
                  { [Op.ne]: null },
                  { [Op.ne]: "" }
                ] 
              } 
            }
          ]
        },
        order: [["updatedAt", "DESC"]]
      });
      
      if (whatsapp) {
        // Prefer tokenMeta (User Token) over facebookUserToken (Page Token)
        accessToken = whatsapp.tokenMeta || whatsapp.facebookUserToken;
        console.log(`[Marketing] Usando token da conexão ${whatsapp.name} (ID: ${whatsapp.id}, Channel: ${whatsapp.channel})`);
      } else {
        console.log(`[Marketing] Nenhuma conexão com token encontrada para companyId: ${companyId}. Buscando em qualquer canal com token...`);
        // Fallback agressivo: Tentar qualquer conexão que tenha tokenMeta (pode ser um canal antigo ou mal classificado)
        const anyWhatsapp = await Whatsapp.findOne({
           where: {
             companyId,
             tokenMeta: { [Op.ne]: null, [Op.ne]: "" }
           },
           order: [["updatedAt", "DESC"]]
        });
        if (anyWhatsapp) {
            accessToken = anyWhatsapp.tokenMeta;
            console.log(`[Marketing] Fallback: Usando token da conexão ${anyWhatsapp.name} (ID: ${anyWhatsapp.id}, Channel: ${anyWhatsapp.channel})`);
        } else {
            console.log(`[Marketing] REALMENTE nenhuma conexão com token encontrada.`);
        }
      }
    }

    // Se temos token mas não temos adAccountId, tentar buscar automaticamente
    if (accessToken && !adAccountId) {
      try {
        const resp = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/me/adaccounts`, {
          params: { access_token: accessToken, fields: "account_id,id,name" }
        });
        if (resp.data?.data?.length > 0) {
          // Pega a primeira conta de anúncios encontrada
          adAccountId = resp.data.data[0].account_id;
          console.log(`[Marketing] Ad Account ID recuperado automaticamente: ${adAccountId}`);
        }
      } catch (err) {
        console.error("[Marketing] Erro ao buscar Ad Accounts:", err.message);
      }
    }

    // Ensure adAccountId is clean (without act_ prefix)
    if (adAccountId) {
      adAccountId = adAccountId.replace(/^act_/, "");
    }
  }


  accessToken = accessToken || process.env.FACEBOOK_ACCESS_TOKEN || null;
  businessId = businessId || process.env.FACEBOOK_BUSINESS_ID || null;
  adAccountId = adAccountId || process.env.FACEBOOK_AD_ACCOUNT_ID || null;

  // Ensure adAccountId is clean (without act_ prefix)
  if (adAccountId) {
    adAccountId = adAccountId.replace(/^act_/, "");
  }

  console.log(`[Marketing] getFbConfig result for company ${companyId}:`, { 
    hasAccessToken: !!accessToken, 
    hasAdAccount: !!adAccountId,
    adAccountId 
  });

  return { accessToken, businessId, adAccountId };
}

export const status = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    console.log(`[Marketing] Checking status for company ${companyId}`);
    
    const { accessToken, businessId, adAccountId } = await getFbConfig(companyId);
    
    if (!accessToken) {
      console.warn(`[Marketing] Status failed: Token not found for company ${companyId}`);
      return res.status(400).json({ error: "ERR_NO_TOKEN", message: "Token de acesso não encontrado. Conecte o Facebook ou insira o token manualmente." });
    }
    
    console.log(`[Marketing] Status: Validating token...`);
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
    console.error("[Marketing] Erro em status:", error?.response?.data || error.message);
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const insights = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken, adAccountId } = await getFbConfig(companyId);
    if (!accessToken) {
      return res.status(400).json({ error: "ERR_NO_TOKEN", message: "Conexão com Facebook ausente ou expirada." });
    }
    if (!adAccountId) {
      return res.status(400).json({ error: "ERR_NO_AD_ACCOUNT", message: "Nenhuma conta de anúncios encontrada." });
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
    console.error("[Marketing] Erro em insights:", error?.response?.data || error.message);
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
      params: { access_token: accessToken, fields: "id,name,access_token,instagram_business_account{id,username,profile_picture_url}" }
    });
    return res.json(resp.data);
  } catch (error: any) {
    console.error("[Marketing] Erro em getFeed:", error?.response?.data || error.message);
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const publishContent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken } = await getFbConfig(companyId);
    if (!accessToken) {
      return res.status(400).json({ error: "access_token ausente" });
    }

    const { facebookPageId, instagramId, message, imageUrl, scheduledTime } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Mensagem é obrigatória" });
    }

    if (!facebookPageId && !instagramId) {
       return res.status(400).json({ error: "Selecione pelo menos uma plataforma (Facebook ou Instagram)" });
    }

    const results: any = {};

    // 1. Publicar no Facebook
    if (facebookPageId) {
      try {
        const pageResp = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${facebookPageId}`, {
          params: { fields: "access_token", access_token: accessToken }
        });
        const pageAccessToken = pageResp.data.access_token;

        const endpoint = imageUrl 
          ? `https://graph.facebook.com/${GRAPH_VERSION}/${facebookPageId}/photos`
          : `https://graph.facebook.com/${GRAPH_VERSION}/${facebookPageId}/feed`;
        
        const body: any = {
          access_token: pageAccessToken,
          message: message
        };

        if (imageUrl) {
          body.url = imageUrl;
          body.caption = message;
          delete body.message;
        }

        if (scheduledTime) {
           body.published = false;
           body.scheduled_publish_time = Math.floor(new Date(scheduledTime).getTime() / 1000);
        }

        const resp = await axios.post(endpoint, body);
        results.facebook = resp.data;
      } catch (err: any) {
        console.error("Erro Facebook Publish:", err.message);
        results.facebook = { error: err.response?.data || err.message };
      }
    }

    // 2. Publicar no Instagram
    if (instagramId) {
      try {
        if (!imageUrl) {
           results.instagram = { error: "Instagram requer uma imagem" };
        } else {
          const containerParams: any = {
            access_token: accessToken,
            image_url: imageUrl,
            caption: message
          };

          const createContainer = await axios.post(
            `https://graph.facebook.com/${GRAPH_VERSION}/${instagramId}/media`,
            null, 
            { params: containerParams }
          );
          
          const creationId = createContainer.data.id;

          const publishParams: any = {
            access_token: accessToken,
            creation_id: creationId
          };

          const publishResp = await axios.post(
            `https://graph.facebook.com/${GRAPH_VERSION}/${instagramId}/media_publish`,
            null,
            { params: publishParams }
          );
          
          results.instagram = publishResp.data;
        }
      } catch (err: any) {
        console.error("Erro Instagram Publish:", err.message);
        results.instagram = { error: err.response?.data || err.message };
      }
    }

    return res.json(results);

  } catch (error: any) {
    console.error("[Marketing] Erro em publishContent:", error?.response?.data || error.message);
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const getFeed = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken } = await getFbConfig(companyId);
    if (!accessToken) {
      return res.status(400).json({ error: "access_token ausente" });
    }
    const { pageId } = req.query;
    if (!pageId) {
      return res.status(400).json({ error: "pageId é obrigatório" });
    }

    const resp = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/feed`, {
      params: {
        access_token: accessToken,
        fields: "id,message,created_time,full_picture,permalink_url,comments.summary(true).limit(5){id,message,created_time,from},likes.summary(true)",
        limit: 10
      }
    });

    return res.json(resp.data);
  } catch (error: any) {
    console.error("[Marketing] Erro em getFeed:", error?.response?.data || error.message);
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const likePost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken } = await getFbConfig(companyId);
    if (!accessToken) return res.status(400).json({ error: "access_token ausente" });

    const { objectId, pageAccessToken } = req.body;
    if (!objectId) return res.status(400).json({ error: "objectId é obrigatório" });

    const tokenToUse = pageAccessToken || accessToken;

    const resp = await axios.post(`https://graph.facebook.com/${GRAPH_VERSION}/${objectId}/likes`, null, {
      params: { access_token: tokenToUse }
    });

    return res.json(resp.data);
  } catch (error: any) {
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};

export const commentPost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyId = (req as any).user?.companyId;
    const { accessToken } = await getFbConfig(companyId);
    if (!accessToken) return res.status(400).json({ error: "access_token ausente" });

    const { objectId, message, pageAccessToken } = req.body;
    if (!objectId || !message) return res.status(400).json({ error: "objectId e message são obrigatórios" });

    const tokenToUse = pageAccessToken || accessToken;

    const resp = await axios.post(`https://graph.facebook.com/${GRAPH_VERSION}/${objectId}/comments`, null, {
      params: { access_token: tokenToUse, message }
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

    console.log("[Marketing] createWhatsappAdFlow params:", { 
      adAccountId, page_id, phone_number_e164, image_hash 
    });

    const sanitizedPhone = phone_number_e164.replace(/\D/g, "");

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
    console.error("[Marketing] Erro em createWhatsappAdFlow:", JSON.stringify(error?.response?.data || error.message, null, 2));
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
      return res.status(400).json({ error: "config_missing", message: "Configure o Ad Account ID e Token." });
    }
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "file_missing" });
    }

    console.log(`[Marketing] Uploading image: ${file.path} (${file.mimetype})`);

    const form = new FormData();
    form.append("source", fs.createReadStream(file.path), { filename: file.originalname, contentType: file.mimetype });
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
    console.error("[Marketing] Upload error:", error?.response?.data || error.message);
    return res.status(400).json({ error: error?.response?.data || error.message });
  }
};
