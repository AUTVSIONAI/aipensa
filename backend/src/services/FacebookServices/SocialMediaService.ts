import axios from "axios";
import { Op } from "sequelize";
import Setting from "../../models/Setting";
import Whatsapp from "../../models/Whatsapp";
import Jimp from "jimp";

const GRAPH_VERSION = "v19.0";

interface FbConfig {
  accessToken: string | null;
  businessId: string | null;
  adAccountId: string | null;
}

export const getFbConfig = async (companyId: number): Promise<FbConfig> => {
  let accessToken: string | null = null;
  let businessId: string | null = null;
  let adAccountId: string | null = null;

  console.log(`[getFbConfig] Starting for company ${companyId}`);

  // 1. Try to find token in Whatsapp connections (Prioritize connections with tokens)
  if (companyId) {
    const whatsapp = await Whatsapp.findOne({
      where: {
        companyId,
        channel: { [Op.or]: ["facebook", "instagram"] },
        [Op.or]: [
          { tokenMeta: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] } },
          { facebookUserToken: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] } }
        ]
      },
      order: [["updatedAt", "DESC"]]
    });

    if (whatsapp) {
      console.log(`[getFbConfig] Found Whatsapp connection ID ${whatsapp.id} for company ${companyId}`);
      accessToken = whatsapp.tokenMeta || whatsapp.facebookUserToken;
    } else {
      console.log(`[getFbConfig] No Whatsapp connection found for company ${companyId}`);
    }
  }

  // 2. Fallback: Check Settings table
  if (!accessToken && companyId) {
    console.log(`[getFbConfig] Checking Settings table for fallback token`);
    const at = await Setting.findOne({
      where: { companyId, key: "facebook_access_token" }
    });
    accessToken = at?.value || null;
  }

  // 3. Get Business ID and Ad Account ID from Settings
  if (companyId) {
    const bid = await Setting.findOne({ where: { companyId, key: "facebook_business_id" } });
    const act = await Setting.findOne({ where: { companyId, key: "facebook_ad_account_id" } });
    
    if (!businessId) businessId = bid?.value || null;
    if (!adAccountId) adAccountId = act?.value || null;
  }

  // 4. Try to fetch Ad Account ID if not set but we have a token
  if (accessToken && !adAccountId) {
    try {
      const resp = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/me/adaccounts`, {
        params: { access_token: accessToken, fields: "account_id" }
      });
      if (resp.data?.data?.length > 0) {
        adAccountId = resp.data.data[0].account_id;
      }
    } catch (err: any) {
      console.error("[SocialMediaService] Error fetching ad accounts:", err.message);
    }
  }

  if (adAccountId) adAccountId = adAccountId.replace(/^act_/, "");

  return { accessToken, businessId, adAccountId };
};

// Helper to centralize Facebook Error Handling
const handleFacebookError = (error: any) => {
  const errorData = error.response?.data?.error || {};
  const errorMessage = JSON.stringify(errorData);
  
  console.error("[SocialMediaService] Facebook API Error:", errorMessage);

  if (errorData.message) {
    // Return detailed message to user
    throw new Error(`Erro do Facebook/Instagram: ${errorData.message}`);
  }

  if (errorMessage.includes("pages_read_engagement")) {
    throw new Error(
      "Erro de permissão: A conexão com o Facebook precisa ser atualizada. Vá em Configurações > Conexões e reconecte a página."
    );
  }
  if (errorMessage.includes("instagram_manage_messages")) {
    throw new Error(
      "Erro de permissão: Faltando permissão 'instagram_manage_messages'. Reconecte a página."
    );
  }
  if (errorMessage.includes("publish_to_groups")) {
      throw new Error("Erro de permissão: Não é possível postar em grupos sem permissão explícita.");
  }
  if (errorData?.code === 190 || errorData?.code === 10) {
     throw new Error("Sessão do Facebook expirada. Por favor, vá em Conexões e reconecte a página.");
  }
  
  // Re-throw original error if not handled specifically
  throw error;
};

const validateImageForInstagram = async (imageUrl: string): Promise<void> => {
  try {
    console.log(`[validateImageForInstagram] Validating: ${imageUrl}`);
    const image = await Jimp.read(imageUrl);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const ratio = width / height;

    console.log(`[validateImageForInstagram] Dimensions: ${width}x${height}, Ratio: ${ratio.toFixed(2)}`);

    // Accepted ratios: 1:1 (1), 4:5 (0.8), 1.91:1 (1.91)
    // Tolerance +/- 0.05
    const validRatios = [1.0, 0.8, 1.91];
    const isValid = validRatios.some(r => Math.abs(ratio - r) < 0.05);

    if (!isValid) {
      // Tentar ajustar? Por enquanto, apenas erro.
      throw new Error(`Aspect Ratio inválido: ${ratio.toFixed(2)}. Permitidos: 1:1 (Quadrado), 4:5 (Vertical), 1.91:1 (Horizontal).`);
    }
    
    const mime = image.getMIME();
    if (mime !== "image/jpeg" && mime !== "image/jpg") {
         throw new Error(`Formato inválido: ${mime}. O Instagram requer JPG.`);
    }

  } catch (error) {
    console.error(`[validateImageForInstagram] Error: ${error.message}`);
    // Se falhar o download ou leitura, lançamos erro para ser capturado e retornado ao usuário
    throw new Error(`Falha na validação da imagem: ${error.message}`);
  }
};

export const publishToFacebook = async (
  companyId: number,
  pageId: string,
  message: string,
  imageUrl?: string,
  scheduledTime?: string
): Promise<any> => {
  try {
    const { accessToken } = await getFbConfig(companyId);
    if (!accessToken) throw new Error("ERR_NO_TOKEN: Facebook Token not found");

    // Get Page Access Token
    const pageResp = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${pageId}`, {
      params: { fields: "access_token", access_token: accessToken }
    });
    const pageAccessToken = pageResp.data.access_token;

    const endpoint = imageUrl
      ? `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/photos`
      : `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/feed`;

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
    return resp.data;
  } catch (error) {
    handleFacebookError(error);
  }
};

export const publishVideoToFacebook = async (
  companyId: number,
  pageId: string,
  videoUrl: string,
  description: string
): Promise<any> => {
  try {
    const { accessToken } = await getFbConfig(companyId);
    if (!accessToken) throw new Error("ERR_NO_TOKEN: Facebook Token not found");

    // Get Page Access Token
    const pageResp = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${pageId}`, {
      params: { fields: "access_token", access_token: accessToken }
    });
    const pageAccessToken = pageResp.data.access_token;

    const endpoint = `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/videos`;

    const body = {
      access_token: pageAccessToken,
      file_url: videoUrl,
      description: description
    };

    const resp = await axios.post(endpoint, body);
    return resp.data;
  } catch (error) {
    handleFacebookError(error);
  }
};

const waitForInstagramMedia = async (creationId: string, accessToken: string) => {
  let attempts = 0;
  while (attempts < 20) {
    // Try for 40 seconds
    const statusResp = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/${creationId}`, {
      params: { fields: "status_code,status", access_token: accessToken }
    });
    const status = statusResp.data.status_code;
    
    if (status === "FINISHED") return;
    if (status === "ERROR") throw new Error("Instagram Video Processing Failed");

    await new Promise(r => setTimeout(r, 2000)); // Wait 2s
    attempts++;
  }
  throw new Error("Timeout waiting for Instagram video processing");
};

export const publishVideoToInstagram = async (
  companyId: number,
  instagramId: string,
  videoUrl: string,
  caption: string
): Promise<any> => {
  try {
    const { accessToken } = await getFbConfig(companyId);
    if (!accessToken) throw new Error("ERR_NO_TOKEN: Facebook Token not found");

    // 1. Create Container
    const containerParams: any = {
      access_token: accessToken,
      caption: caption
    };

    if (videoUrl) {
      containerParams.video_url = videoUrl;
      containerParams.media_type = "VIDEO";
    }

    const createContainer = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${instagramId}/media`,
      containerParams // Parâmetros no BODY (JSON/Form)
    );

    const creationId = createContainer.data.id;

    // Wait for processing
    await waitForInstagramMedia(creationId, accessToken);

    // 2. Publish Container
    const publishParams = {
      access_token: accessToken,
      creation_id: creationId
    };

    const publishResp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${instagramId}/media_publish`,
      publishParams // Parâmetros no BODY
    );

    return publishResp.data;
  } catch (error) {
    handleFacebookError(error);
  }
};

export const publishToInstagram = async (
  companyId: number,
  instagramId: string,
  imageUrl: string,
  caption: string
): Promise<any> => {
  try {
    const { accessToken } = await getFbConfig(companyId);
    if (!accessToken) throw new Error("ERR_NO_TOKEN: Facebook Token not found");

    console.log(`[publishToInstagram] Creating container for image: ${imageUrl}`);

    // Validate Image Aspect Ratio and Format
    await validateImageForInstagram(imageUrl);

    // 1. Create Container
    const containerParams = {
      access_token: accessToken,
      image_url: imageUrl,
      caption: caption
    };

    const createContainer = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${instagramId}/media`,
      containerParams // Parâmetros no BODY
    );

    const creationId = createContainer.data.id;
    console.log(`[publishToInstagram] Container created: ${creationId}`);

    // 2. Publish Container
    const publishParams = {
      access_token: accessToken,
      creation_id: creationId
    };

    const publishResp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${instagramId}/media_publish`,
      publishParams // Parâmetros no BODY
    );

    console.log(`[publishToInstagram] Published successfully: ${publishResp.data.id}`);
    return publishResp.data;
  } catch (error) {
    handleFacebookError(error);
  }
};

export const sendInstagramDM = async (
  companyId: number,
  instagramId: string,
  recipientId: string,
  text: string,
  attachment?: { url: string; type: "image" | "video" | "audio" }
): Promise<any> => {
  try {
    const { accessToken } = await getFbConfig(companyId);
    if (!accessToken) throw new Error("ERR_NO_TOKEN: Facebook Token not found");

    const messagePayload: any = {};
    
    if (text) {
        messagePayload.text = text;
    }

    if (attachment) {
        messagePayload.attachment = {
            type: attachment.type,
            payload: { 
                url: attachment.url,
                is_reusable: true
            }
        };
    }

    if (!text && !attachment) {
        throw new Error("Message must have text or attachment");
    }

    const params = {
      recipient: { id: recipientId },
      message: messagePayload,
      access_token: accessToken
    };

    const resp = await axios.post(
      `https://graph.facebook.com/${GRAPH_VERSION}/${instagramId}/messages`,
      params
    );

    return resp.data;
  } catch (error) {
    handleFacebookError(error);
  }
};

export const getConnectedPages = async (companyId: number): Promise<any[]> => {
  const { accessToken } = await getFbConfig(companyId);
  if (!accessToken) return [];

  try {
    const resp = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/me/accounts`, {
      params: {
        access_token: accessToken,
        fields: "id,name,access_token,instagram_business_account{id,username}"
      }
    });
    return resp.data.data || [];
  } catch (e: any) {
    console.error("[SocialMediaService] Error fetching pages:", e.message);
    return [];
  }
};
