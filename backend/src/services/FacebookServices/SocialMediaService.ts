import axios from "axios";
import Setting from "../../models/Setting";
import Whatsapp from "../../models/Whatsapp";
import { Op } from "sequelize";

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

  // Prioridade: Tentar encontrar nas conexões (Whatsapps table)
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
      accessToken = whatsapp.tokenMeta || whatsapp.facebookUserToken;
    }
  }

  // Fallback: Setting table
  if (!accessToken && companyId) {
    const at = await Setting.findOne({ where: { companyId, key: "facebook_access_token" } });
    accessToken = at?.value || null;
  }

  if (companyId) {
     const bid = await Setting.findOne({ where: { companyId, key: "facebook_business_id" } });
     const act = await Setting.findOne({ where: { companyId, key: "facebook_ad_account_id" } });
     if (!businessId) businessId = bid?.value || null;
     if (!adAccountId) adAccountId = act?.value || null;
  }

  if (accessToken && !adAccountId) {
      try {
        const resp = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/me/adaccounts`, {
          params: { access_token: accessToken, fields: "account_id" }
        });
        if (resp.data?.data?.length > 0) {
          adAccountId = resp.data.data[0].account_id;
        }
      } catch (err) {
        console.error("[SocialMediaService] Error fetching ad accounts:", err.message);
      }
  }

  if (adAccountId) adAccountId = adAccountId.replace(/^act_/, "");
  
  return { accessToken, businessId, adAccountId };
};

export const publishToFacebook = async (
  companyId: number, 
  pageId: string, 
  message: string, 
  imageUrl?: string, 
  scheduledTime?: string
): Promise<any> => {
  const { accessToken } = await getFbConfig(companyId);
  if (!accessToken) throw new Error("ERR_NO_TOKEN: Facebook Token not found");

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
};

export const publishToInstagram = async (
  companyId: number,
  instagramId: string,
  imageUrl: string,
  caption: string
): Promise<any> => {
  const { accessToken } = await getFbConfig(companyId);
  if (!accessToken) throw new Error("ERR_NO_TOKEN: Facebook Token not found");

  // 1. Create Container
  const containerParams: any = {
    access_token: accessToken,
    image_url: imageUrl,
    caption: caption
  };

  const createContainer = await axios.post(
    `https://graph.facebook.com/${GRAPH_VERSION}/${instagramId}/media`,
    null, 
    { params: containerParams }
  );
  
  const creationId = createContainer.data.id;

  // 2. Publish Container
  const publishParams: any = {
    access_token: accessToken,
    creation_id: creationId
  };

  const publishResp = await axios.post(
    `https://graph.facebook.com/${GRAPH_VERSION}/${instagramId}/media_publish`,
    null,
    { params: publishParams }
  );
  
  return publishResp.data;
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
  } catch (e) {
    console.error("[SocialMediaService] Error fetching pages:", e.message);
    return [];
  }
};
