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

export const getFbConfig = async (companyId?: number): Promise<FbConfig> => {
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
      }
    }

    // Se temos token mas não temos adAccountId, tentar buscar automaticamente
    if (accessToken && !adAccountId) {
      try {
        const resp = await axios.get(`https://graph.facebook.com/${GRAPH_VERSION}/me/adaccounts`, {
          params: { access_token: accessToken, fields: "account_id,id,name" }
        });
        if (resp.data?.data?.length > 0) {
          adAccountId = resp.data.data[0].account_id;
        }
      } catch (err) {
        console.error("[MarketingService] Erro ao buscar Ad Accounts:", err.message);
      }
    }
  }

  accessToken = accessToken || process.env.FACEBOOK_ACCESS_TOKEN || null;
  businessId = businessId || process.env.FACEBOOK_BUSINESS_ID || null;
  adAccountId = adAccountId || process.env.FACEBOOK_AD_ACCOUNT_ID || null;

  return { accessToken, businessId, adAccountId };
};

export const getMarketingInsights = async (companyId: number, datePreset: string = "last_7d") => {
  const { accessToken, adAccountId } = await getFbConfig(companyId);
  
  if (!accessToken || !adAccountId) {
    throw new Error("Configuração incompleta (Token ou Ad Account ID ausente)");
  }

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
  
  return resp.data;
};

export const getMarketingCampaigns = async (companyId: number, status: string = "ACTIVE") => {
    const { accessToken, adAccountId } = await getFbConfig(companyId);
    
    if (!accessToken || !adAccountId) {
      throw new Error("Configuração incompleta (Token ou Ad Account ID ausente)");
    }
  
    const params = {
      access_token: accessToken,
      effective_status: [status],
      fields: "id,name,status,objective,daily_budget,lifetime_budget"
    };
  
    const resp = await axios.get(
      `https://graph.facebook.com/${GRAPH_VERSION}/act_${adAccountId}/campaigns`,
      { params }
    );
    
    return resp.data;
};

export const createMarketingCampaign = async (companyId: number, campaignData: any) => {
    // Placeholder para criação via AI
    // Implementar conforme necessidade
    return { status: "Not implemented yet" };
};
