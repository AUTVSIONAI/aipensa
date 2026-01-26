import axios from "axios";
import FormData from "form-data";
import { createReadStream } from "fs";
import logger from "../../utils/logger";

const getFacebookAppConfig = () => {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("ERR_FACEBOOK_APP_NOT_CONFIGURED");
  }
  return { appId, appSecret };
};

const apiBase = (token: string) =>
  axios.create({
    baseURL: "https://graph.facebook.com/v20.0/",
    params: {
      access_token: token
    }
  });

export const getAccessToken = async (): Promise<string> => {
  const { appId, appSecret } = getFacebookAppConfig();
  const { data } = await axios.get(
    "https://graph.facebook.com/v20.0/oauth/access_token",
    {
      params: {
        client_id: appId,
        client_secret: appSecret,
        grant_type: "client_credentials"
      }
    }
  );
  return data.access_token;
};

export const markSeen = async (id: string, token: string): Promise<void> => {
  await apiBase(token).post(`${id}/messages`, {
    recipient: { id },
    sender_action: "mark_seen"
  });
};

export const showTypingIndicator = async (
  id: string, 
  token: string,
  action: string
): Promise<void> => {
  try {
    const { data } = await apiBase(token).post("me/messages", {
      recipient: { id },
      sender_action: action
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const sendText = async (
  id: string | number,
  text: string,
  token: string
): Promise<void> => {
  try {
    const { data } = await apiBase(token).post("me/messages", {
      recipient: { id },
      message: { text: `${text}` }
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const replyComment = async (
  commentId: string,
  message: string,
  token: string
): Promise<void> => {
  try {
    const { data } = await apiBase(token).post(`${commentId}/replies`, {
      message: message
    });
    return data;
  } catch (error) {
    console.error("Error replying comment:", error?.response?.data || error);
    // Tentar fallback para /comments se /replies falhar (depende se é top-level ou reply)
    try {
        await apiBase(token).post(`${commentId}/comments`, {
            message: message
        });
    } catch (e) {
        console.error("Fallback reply failed:", e?.response?.data);
    }
  }
};

export const sendAttachmentFromUrl = async (
  id: string,
  url: string,
  type: string,
  token: string
): Promise<void> => {
  try {
    const { data } = await apiBase(token).post("me/messages", {
      recipient: { id },
      message: {
        attachment: {
          type,
          payload: { url }
        }
      }
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const sendAttachment = async (
  id: string,
  file: Express.Multer.File,
  type: string,
  token: string
): Promise<void> => {
  const formData = new FormData();
  formData.append("recipient", JSON.stringify({ id }));
  formData.append("message", JSON.stringify({
    attachment: {
      type,
      payload: { is_reusable: true }
    }
  }));

  const fileReaderStream = createReadStream(file.path);
  formData.append("filedata", fileReaderStream);

  try {
    await apiBase(token).post("me/messages", formData, {
      headers: { ...formData.getHeaders() }
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const genText = (text: string): any => {
  return { text };
};

export const getProfile = async (id: string, token: string): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(id);
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("ERR_FETCHING_FB_USER_PROFILE_2");
  }
};

export const getPageProfile = async (
  id: string,
  token: string
): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(
      `${id}/accounts?fields=name,access_token,instagram_business_account{id,username,profile_picture_url,name}`
    );
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("ERR_FETCHING_FB_PAGES");
  }
};

export const profilePsid = async (id: string, token: string): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(`${id}`);
    return data;
  } catch (error) {
    console.log("Error profilePsid first attempt:", error?.message);
    try {
      return await getProfile(id, token);
    } catch (e) {
      console.log("Error profilePsid second attempt (fallback used):", e?.message);
      return {
        id: id,
        name: "Instagram User " + id.substring(0, 4),
        first_name: "Instagram",
        last_name: "User"
      };
    }
  }
};

export const subscribeApp = async (id: string, token: string): Promise<any> => {
  try {
    const { data } = await apiBase(token).post(`${id}/subscribed_apps`, {
      subscribed_fields: [
        "messages",
        "messaging_postbacks",
        "message_deliveries",
        "message_reads",
        "message_echoes"
      ]
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("ERR_SUBSCRIBING_PAGE_TO_MESSAGE_WEBHOOKS");
  }
};

export const unsubscribeApp = async (
  id: string,
  token: string
): Promise<any> => {
  try {
    const { data } = await apiBase(token).delete(`${id}/subscribed_apps`);
    return data;
  } catch (error) {
    throw new Error("ERR_UNSUBSCRIBING_PAGE_TO_MESSAGE_WEBHOOKS");
  }
};

export const getSubscribedApps = async (
  id: string,
  token: string
): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(`${id}/subscribed_apps`);
    return data;
  } catch (error) {
    throw new Error("ERR_GETTING_SUBSCRIBED_APPS");
  }
};

export const getAccessTokenFromPage = async (
  token: string
): Promise<string> => {
  try {
    if (!token) throw new Error("ERR_FETCHING_FB_USER_TOKEN");

    const { appId, appSecret } = getFacebookAppConfig();
    const { data } = await axios.get(
      "https://graph.facebook.com/v20.0/oauth/access_token",
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          grant_type: "fb_exchange_token",
          fb_exchange_token: token
        }
      }
    );
    return data.access_token;
  } catch (error) {
    console.log(error);
    throw new Error("ERR_FETCHING_FB_USER_TOKEN");
  }
};

export const removeApplication = async (
  id: string,
  token: string
): Promise<void> => {
  try {
    await apiBase(token).delete(`${id}/permissions`);
  } catch (error) {
    logger.error("ERR_REMOVING_APP_FROM_PAGE");
  }
};
