import axios from "axios";
import MetaIntegration from "../../models/MetaIntegration";
import MetaPage from "../../models/MetaPage";
import MetaAdsAccount from "../../models/MetaAdsAccount";
import { logger } from "../../utils/logger";

const apiVersion = "v19.0";
const baseUrl = `https://graph.facebook.com/${apiVersion}`;

interface TokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface PageData {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
}

interface AdAccountData {
  id: string; // act_123
  account_id: string; // 123
  name: string;
  currency: string;
  timezone_name: string;
}

export const exchangeToLongLivedToken = async (shortToken: string): Promise<TokenExchangeResponse> => {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error("Facebook App ID or Secret not configured");
    }

    const response = await axios.get(`${baseUrl}/oauth/access_token`, {
      params: {
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortToken
      }
    });

    return response.data;
  } catch (error) {
    logger.error("Error exchanging token:", error);
    throw error;
  }
};

export const getUserProfile = async (token: string) => {
  const response = await axios.get(`${baseUrl}/me`, {
    params: {
      fields: "id,name,email",
      access_token: token
    }
  });
  return response.data;
};

export const getPages = async (token: string): Promise<PageData[]> => {
  let pages: PageData[] = [];
  let url = `${baseUrl}/me/accounts?fields=id,name,access_token,instagram_business_account&limit=100`;

  try {
    while (url) {
      const response = await axios.get(url, {
        params: { access_token: token }
      });
      pages = [...pages, ...response.data.data];
      url = response.data.paging?.next;
    }
  } catch (error) {
    logger.error("Error fetching pages:", error);
  }
  return pages;
};

export const getAdAccounts = async (token: string): Promise<AdAccountData[]> => {
  let accounts: AdAccountData[] = [];
  let url = `${baseUrl}/me/adaccounts?fields=id,account_id,name,currency,timezone_name&limit=100`;

  try {
    while (url) {
      const response = await axios.get(url, {
        params: { access_token: token }
      });
      accounts = [...accounts, ...response.data.data];
      url = response.data.paging?.next;
    }
  } catch (error) {
    logger.error("Error fetching ad accounts:", error);
  }
  return accounts;
};

export const saveMetaIntegration = async (
  userId: number,
  shortToken: string
): Promise<MetaIntegration> => {
  // 1. Exchange Token
  const longTokenData = await exchangeToLongLivedToken(shortToken);
  const longToken = longTokenData.access_token;
  const expiresAt = longTokenData.expires_in 
    ? new Date(Date.now() + longTokenData.expires_in * 1000) 
    : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // Default 60 days

  // 2. Get User Profile
  const profile = await getUserProfile(longToken);

  // 3. Save Integration
  let integration = await MetaIntegration.findOne({
    where: { userId, meta_user_id: profile.id }
  });

  if (!integration) {
    integration = await MetaIntegration.create({
      userId,
      fb_user_id: profile.id, // using id as both for simplicity, or check if different
      meta_user_id: profile.id,
      email: profile.email,
      long_lived_user_token: longToken,
      token_expires_at: expiresAt
    });
  } else {
    await integration.update({
      long_lived_user_token: longToken,
      token_expires_at: expiresAt,
      email: profile.email
    });
  }

  // 4. Fetch and Save Pages
  const pages = await getPages(longToken);
  
  // Clear old pages? Or update? Better to update or upsert.
  // For simplicity, we can delete old ones not in the list, or just upsert.
  // Let's iterate.
  for (const page of pages) {
    const existingPage = await MetaPage.findOne({
      where: { integrationId: integration.id, page_id: page.id }
    });

    const pageData = {
      integrationId: integration.id,
      page_id: page.id,
      page_name: page.name,
      page_access_token: page.access_token,
      ig_business_id: page.instagram_business_account?.id || null
    };

    if (existingPage) {
      await existingPage.update(pageData);
    } else {
      await MetaPage.create(pageData);
    }
  }

  // 5. Fetch and Save Ad Accounts
  const adAccounts = await getAdAccounts(longToken);
  for (const acc of adAccounts) {
    const existingAcc = await MetaAdsAccount.findOne({
      where: { integrationId: integration.id, ad_account_id: acc.id }
    });

    const accData = {
      integrationId: integration.id,
      ad_account_id: acc.id,
      name: acc.name,
      currency: acc.currency,
      timezone: acc.timezone_name
    };

    if (existingAcc) {
      await existingAcc.update(accData);
    } else {
      await MetaAdsAccount.create(accData);
    }
  }

  return integration;
};
