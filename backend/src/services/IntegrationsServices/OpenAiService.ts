import {
  MessageUpsertType,
  proto,
  WASocket,
  generateWAMessageFromContent
} from "@whiskeysockets/baileys";
import {
  convertTextToSpeechAndSaveToFile,
  getBodyMessage,
  keepOnlySpecifiedChars,
  transferQueue,
  verifyMediaMessage,
  verifyMessage
} from "../WbotServices/wbotMessageListener";

import { isNil, isNull } from "lodash";
import axios from "axios";
import fs from "fs";
import path, { join } from "path";

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import TicketTraking from "../../models/TicketTraking";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import Whatsapp from "../../models/Whatsapp";
import CreateScheduleService from "../ScheduleServices/CreateService";
import { zonedTimeToUtc } from "date-fns-tz";
import Tag from "../../models/Tag";
import {
  checkPlanLimit,
  incrementUsage,
  checkPlanFeature
} from "../UsageTrackingServices/UsageTrackingService";

type Session = WASocket & {
  id?: number;
};

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

interface IMe {
  name: string;
  id: string;
}

export interface IOpenAi {
  name: string;
  prompt: string;
  voice: string;
  voiceKey: string;
  voiceRegion: string;
  maxTokens: number;
  temperature: number;
  apiKey: string;
  queueId: number;
  maxMessages: number;
  provider?: string;
  model?: string;
}

const deleteFileSync = (path: string): void => {
  try {
    fs.unlinkSync(path);
  } catch (error) {
    console.error("Erro ao deletar o arquivo:", error);
  }
};

const sanitizeName = (name: string): string => {
  let sanitized = name.split(" ")[0];
  sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");
  return sanitized.substring(0, 60);
};

const verifyAdminPermission = async (contact: Contact): Promise<boolean> => {
  try {
    const contactWithTags = await Contact.findByPk(contact.id, {
      include: [{ model: Tag, as: "tags" }]
    });

    if (!contactWithTags || !contactWithTags.tags) return false;

    // Check for "ADMIN" or "admin" tag
    return contactWithTags.tags.some(t => t.name.toUpperCase() === "ADMIN");
  } catch (e) {
    console.error("Error verifying admin permission:", e);
    return false;
  }
};

// Função para chamar OpenAI
const callOpenAI = async (
  openai: OpenAI,
  messagesOpenAi: any[],
  openAiSettings: IOpenAi
) => {
  // Lista de modelos de fallback para OpenRouter (focando em gratuitos/baratos)
  const FALLBACK_MODELS = [
    "google/gemini-2.0-flash-exp:free",
    "google/gemini-2.0-flash-lite-preview-02-05:free",
    "mistralai/mistral-7b-instruct:free",
    "huggingfaceh4/zephyr-7b-beta:free",
    "meta-llama/llama-3-8b-instruct:free",
    "openai/gpt-3.5-turbo" // Último recurso (pago)
  ];

  let model = openAiSettings.model || "gpt-3.5-turbo";

  // Se for OpenRouter, prepara lista de tentativas
  let modelsToTry = [model];
  if (openai.baseURL.includes("openrouter")) {
    // Adiciona fallbacks, evitando duplicatas do modelo principal
    const additionalModels = FALLBACK_MODELS.filter(m => m !== model);
    modelsToTry = [...modelsToTry, ...additionalModels];
  }

  console.log(`[callOpenAI] Models to try: ${JSON.stringify(modelsToTry)}`);

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    try {
      console.log(
        `[callOpenAI] Attempting with model: ${currentModel} (Attempt ${
          i + 1
        }/${modelsToTry.length})`
      );

      const chat = await openai.chat.completions.create({
        model: currentModel,
        messages: messagesOpenAi,
        max_tokens: openAiSettings.maxTokens,
        temperature: openAiSettings.temperature
      });

      return chat.choices[0].message?.content;
    } catch (error) {
      console.error(
        `[callOpenAI] Error with model ${currentModel}:`,
        error.message
      );

      // Se for o último modelo, lança o erro
      if (i === modelsToTry.length - 1) {
        throw error;
      }

      // Se o erro for 402 (Pagamento/Créditos), força busca por modelo free na próxima iteração
      if (error.status === 402) {
        console.log(
          "[callOpenAI] 402 detected (Insufficient Credits). Switching to free models."
        );
      }

      // Continua para o próximo modelo
      console.log(`[callOpenAI] Switching to next fallback model...`);
    }
  }
};

// Função para chamar Gemini
const callGemini = async (
  gemini: GoogleGenerativeAI,
  messagesOpenAi: any[],
  openAiSettings: IOpenAi
) => {
  const model = openAiSettings.model || "gemini-1.5-flash";
  const genModel = gemini.getGenerativeModel({ model: model });

  // Converter formato OpenAI para Gemini
  let prompt = "";

  // Adicionar system message
  const systemMessage = messagesOpenAi.find(msg => msg.role === "system");
  if (systemMessage) {
    prompt += `Instruções do Sistema: ${systemMessage.content}\n\n`;
  }

  // Adicionar conversação
  const conversationMessages = messagesOpenAi.filter(
    msg => msg.role !== "system"
  );
  conversationMessages.forEach((msg, index) => {
    if (msg.role === "user") {
      prompt += `Usuário: ${msg.content}\n`;
    } else if (msg.role === "assistant") {
      prompt += `Assistente: ${msg.content}\n`;
    }
  });

  prompt += "Assistente: ";

  const result = await genModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

// Função para transcrever áudio com Gemini
const transcribeWithGemini = async (
  gemini: GoogleGenerativeAI,
  audioBuffer: Buffer
): Promise<string> => {
  // Gemini ainda não suporta transcrição de áudio diretamente
  // Por enquanto, retornar mensagem padrão
  return "Áudio recebido (transcrição não disponível com Gemini)";
};

import {
  getMarketingInsights,
  getMarketingCampaigns
} from "../MarketingServices/MarketingToolService";
import {
  getCatalog,
  getProductById,
  sendProduct
} from "../WbotServices/CatalogService";
import {
  getConnectedPages,
  publishToFacebook,
  publishToInstagram,
  publishVideoToFacebook,
  publishVideoToInstagram
} from "../FacebookServices/SocialMediaService";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import logger from "../../utils/logger";
import CompaniesSettings from "../../models/CompaniesSettings";

const handleCatalogAction = async (
  response: string,
  wbot: Session,
  msg: proto.IWebMessageInfo
): Promise<string> => {
  const productRegex = /\[SEND_PRODUCT: (.+?)\]/;
  const match = response.match(productRegex);

  if (match && match[1]) {
    try {
      const productId = match[1].trim();
      const ownerJid = wbot.user?.id;

      if (ownerJid && msg.key.remoteJid) {
        console.log(
          `[OpenAiService] Sending product ${productId} to ${msg.key.remoteJid}`
        );
        const product = await getProductById(wbot, ownerJid, productId);

        if (product) {
          await sendProduct(wbot, msg.key.remoteJid, ownerJid, product);
        } else {
          console.log(`[OpenAiService] Product ${productId} not found`);
        }
      }
    } catch (e) {
      console.error("Error sending product via AI:", e);
    }
    // Always remove the tag
    return response.replace(match[0], "").trim();
  }
  return response;
};

const handleStatusPostAction = async (
  response: string,
  ticket: Ticket,
  contact: Contact,
  wbot: Session,
  msg: proto.IWebMessageInfo
): Promise<string> => {
  const statusRegex = /\[POST_STATUS\]([\s\S]*?)\[\/POST_STATUS\]/;
  const match = response.match(statusRegex);

  if (match && match[1]) {
    try {
      const companySettings = await CompaniesSettings.findOne({
        where: { companyId: ticket.companyId }
      });
      if (!companySettings || companySettings.enableAutoStatus !== "enabled") {
        return (
          response.replace(match[0], "").trim() +
          "\n\n⚠️ Recurso desativado nas configurações da empresa."
        );
      }

      // Verifica se o módulo está ativo
      if (!(await checkPlanFeature(ticket.companyId, "useAutoPosts"))) {
        return (
          response.replace(match[0], "").trim() +
          '\n\n⚠️ *Recurso Bloqueado*: O módulo de Postagem Automática não está ativo no seu plano. Deseja ativar? [UPGRADE_PLAN] { "type": "posts" } [/UPGRADE_PLAN]'
        );
      }

      // Check Plan Limit
      if (!(await checkPlanLimit(ticket.companyId, "limitPosts", "POST"))) {
        return (
          response.replace(match[0], "").trim() +
          "\n\n⚠️ *Limite Atingido*: Você atingiu o limite de postagens do seu plano. Deseja adicionar mais postagens ao seu pacote?"
        );
      }

      const jsonContent = match[1].trim();
      const postData = JSON.parse(jsonContent);
      const { caption, source, file, media } = postData;

      const statusJid = "status@broadcast";

      let buffer: Buffer | null = null;
      let localFilePath: string | null = null;
      const publicFolder: string = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        "public",
        `company${ticket.companyId}`
      );

      // Fonte: chat (pegar mídia atual, citada ou última)
      if (source === "chat") {
        // 1. Atual
        if (msg.message?.imageMessage || msg.message?.videoMessage) {
          buffer = (await downloadMediaMessage(
            msg,
            "buffer",
            {},
            { logger, reuploadRequest: wbot.updateMediaMessage }
          )) as Buffer;
        }
        // 2. Citada
        else if (
          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
            ?.imageMessage ||
          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
            ?.videoMessage
        ) {
          const quoted = msg.message.extendedTextMessage.contextInfo;
          const pseudoMsg: any = {
            message: quoted.quotedMessage,
            key: {
              remoteJid: msg.key.remoteJid,
              id: quoted.stanzaId
            }
          };
          buffer = (await downloadMediaMessage(
            pseudoMsg,
            "buffer",
            {},
            { logger, reuploadRequest: wbot.updateMediaMessage }
          )) as Buffer;
        }
        // 3. Última do histórico
        else {
          const lastMedia = await Message.findOne({
            where: {
              ticketId: ticket.id,
              fromMe: false,
              mediaType: media === "video" ? "video" : "image"
            },
            order: [["createdAt", "DESC"]]
          });
          if (lastMedia?.mediaUrl) {
            localFilePath = path.resolve(
              publicFolder,
              lastMedia.mediaUrl.split("/").pop() || ""
            );
          }
        }
      }
      // Fonte: arquivos (pasta pública da empresa)
      else if (source === "files" && file) {
        localFilePath = path.resolve(publicFolder, file);
      }

      // Envio do Status
      if (media === "video") {
        if (buffer) {
          await wbot.sendMessage(statusJid, { video: buffer, caption });
        } else if (localFilePath) {
          await wbot.sendMessage(statusJid, {
            video: { url: localFilePath },
            caption
          });
        } else {
          return (
            response.replace(match[0], "").trim() +
            "\n\n(Erro: Nenhum vídeo encontrado para postar no Status)"
          );
        }
      } else {
        if (buffer) {
          await wbot.sendMessage(statusJid, { image: buffer, caption });
        } else if (localFilePath) {
          await wbot.sendMessage(statusJid, {
            image: { url: localFilePath },
            caption
          });
        } else {
          return (
            response.replace(match[0], "").trim() +
            "\n\n(Erro: Nenhuma imagem encontrada para postar no Status)"
          );
        }
      }

      await incrementUsage(ticket.companyId, "limitPosts", 1);
      return (
        response.replace(match[0], "").trim() +
        "\n\n✅ Status postado com sucesso!"
      );
    } catch (e) {
      console.error("Erro ao postar Status no WhatsApp:", e);
      return (
        response.replace(match[0], "").trim() +
        "\n\n❌ Erro ao postar Status no WhatsApp."
      );
    }
  }
  return response;
};

const handlePixAction = async (
  response: string,
  ticket: Ticket,
  contact: Contact,
  wbot: Session
): Promise<string> => {
  const pixRegex = /\[SEND_PIX\]([\s\S]*?)\[\/SEND_PIX\]/;
  const match = response.match(pixRegex);

  if (match && match[1]) {
    try {
      const json = JSON.parse(match[1].trim());
      const {
        key,
        key_type,
        merchant_name,
        amount,
        title
      }: {
        key: string;
        key_type: string;
        merchant_name: string;
        amount: number;
        title?: string;
      } = json;

      const botJid = wbot.user?.id || "";
      const number = `${contact.number}@${
        ticket.isGroup ? "g.us" : "s.whatsapp.net"
      }`;

      const interactiveMsg = {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "review_and_pay",
                    buttonParamsJson: JSON.stringify({
                      reference_id: Math.random().toString(36).slice(2),
                      type: "physical-goods",
                      payment_configuration: "merchant_categorization_code",
                      payment_settings: [
                        {
                          type: "pix_static_code",
                          pix_static_code: {
                            key,
                            merchant_name,
                            key_type
                          }
                        },
                        {
                          type: "cards",
                          cards: { enabled: false }
                        }
                      ],
                      currency: "BRL",
                      total_amount: {
                        value: Math.round((amount || 0) * 100),
                        offset: 100
                      },
                      order: {
                        status: "payment_requested",
                        items: [
                          {
                            retailer_id: "pix-item",
                            name: title || "Pagamento via PIX",
                            amount: {
                              value: Math.round((amount || 0) * 100),
                              offset: 100
                            },
                            quantity: 1
                          }
                        ],
                        subtotal: {
                          value: Math.round((amount || 0) * 100),
                          offset: 100
                        },
                        tax: null,
                        shipping: null,
                        discount: null,
                        order_type: "ORDER"
                      },
                      native_payment_methods: []
                    })
                  }
                ]
              }
            }
          }
        }
      };

      const newMsg = generateWAMessageFromContent(
        number,
        interactiveMsg as any,
        {
          userJid: botJid
        }
      );
      await wbot.relayMessage(number, newMsg.message!, {
        messageId: newMsg.key.id
      });
      await wbot.upsertMessage(newMsg, "notify");

      return (
        response.replace(match[0], "").trim() +
        "\n\n✅ Solicitação de pagamento PIX enviada. Siga as instruções do WhatsApp para concluir."
      );
    } catch (e) {
      console.error("Erro ao enviar PIX via AI:", e);
      return (
        response.replace(match[0], "").trim() +
        "\n\n❌ Erro ao iniciar pagamento PIX."
      );
    }
  }
  return response;
};

const handleMarketingAction = async (
  response: string,
  ticket: Ticket,
  contact: Contact
): Promise<string> => {
  // Regex para capturar tags [MARKETING]
  // Exemplo: [MARKETING] { "action": "get_insights", "period": "last_7d" } [/MARKETING]
  const marketingRegex = /\[MARKETING\]([\s\S]*?)\[\/MARKETING\]/;
  const match = response.match(marketingRegex);

  if (match && match[1]) {
    try {
      if (!(await verifyAdminPermission(contact))) {
        return (
          response.replace(match[0], "").trim() +
          "\n\n⛔ *Acesso Negado*: Esta ação requer permissão de administrador (Tag: ADMIN)."
        );
      }

      const jsonContent = match[1].trim();
      console.log("[OpenAiService] Marketing JSON Content:", jsonContent);

      const actionData = JSON.parse(jsonContent);
      const { action, period, status } = actionData;

      let result = "";

      if (action === "get_insights") {
        const insights = await getMarketingInsights(
          ticket.companyId,
          period || "last_7d"
        );

        // Formatar insights para texto amigável
        const data = insights.data[0];
        if (data) {
          result =
            `📊 *Resumo de Insights (${period || "Últimos 7 dias"})*\n\n` +
            `👁️ Impressões: ${data.impressions}\n` +
            `👥 Alcance: ${data.reach}\n` +
            `👆 Cliques: ${data.clicks}\n` +
            `💰 Gasto: ${new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL"
            }).format(data.spend)}\n` +
            `📉 CPM: ${new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL"
            }).format(data.cpm)}\n` +
            `🖱️ CTR: ${parseFloat(data.ctr).toFixed(2)}%`;
        } else {
          result = "Não encontrei dados de insights para este período.";
        }
      } else if (action === "get_campaigns") {
        const campaigns = await getMarketingCampaigns(
          ticket.companyId,
          status || "ACTIVE"
        );

        if (campaigns.data && campaigns.data.length > 0) {
          result = `📢 *Campanhas Ativas*\n\n`;
          campaigns.data.forEach((camp: any) => {
            result +=
              `🔹 *${camp.name}*\n` +
              `   Status: ${camp.status}\n` +
              `   Objetivo: ${camp.objective}\n` +
              `   Orçamento: ${
                camp.daily_budget
                  ? `Diário: ${new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    }).format(camp.daily_budget / 100)}`
                  : `Total: ${new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    }).format(camp.lifetime_budget / 100)}`
              }\n\n`;
          });
        } else {
          result = "Não encontrei campanhas ativas no momento.";
        }
      } else {
        result = "Ação de marketing não reconhecida.";
      }

      // Remover a tag e adicionar o resultado na resposta
      return response.replace(match[0], "").trim() + "\n\n" + result;
    } catch (e) {
      console.error("Erro ao executar ação de Marketing via AI:", e);
      return (
        response.replace(match[0], "").trim() +
        "\n\n(Erro ao processar solicitação de marketing)"
      );
    }
  }
  return response;
};

const handleScheduleAction = async (
  response: string,
  ticket: Ticket,
  contact: Contact
): Promise<string> => {
  // Allow whitespace around content
  const scheduleRegex = /\[AGENDAR\]([\s\S]*?)\[\/AGENDAR\]/;
  const match = response.match(scheduleRegex);

  if (match && match[1]) {
    try {
      const jsonContent = match[1].trim();
      console.log("[OpenAiService] Schedule JSON Content:", jsonContent);

      const scheduleData = JSON.parse(jsonContent);
      const { sendAt, body } = scheduleData;

      if (sendAt && body) {
        // Parse date considering Brazil Timezone
        // If string is ISO without timezone (e.g. 2024-02-21T15:00:00), treat as BRT
        const parsedDate = zonedTimeToUtc(sendAt, "America/Sao_Paulo");

        console.log("[OpenAiService] Scheduling via AI:", {
          original: sendAt,
          parsed: parsedDate,
          body
        });

        await CreateScheduleService({
          body,
          sendAt: parsedDate.toISOString(),
          contactId: contact.id,
          companyId: ticket.companyId,
          userId: ticket.userId || undefined,
          ticketUserId: ticket.userId || undefined
        });

        // Success: remove tag
        return response.replace(match[0], "").trim();
      }
    } catch (e) {
      console.error("Erro ao agendar via AI:", e);
      // Error: remove tag anyway to avoid showing code to user
      return response.replace(match[0], "").trim();
    }
  }
  return response;
};

const handleSocialMediaAction = async (
  response: string,
  ticket: Ticket,
  contact: Contact
): Promise<string> => {
  const socialRegex = /\[POST_FEED\]([\s\S]*?)\[\/POST_FEED\]/;
  const match = response.match(socialRegex);

  if (match && match[1]) {
    try {
      if (!(await verifyAdminPermission(contact))) {
        return (
          response.replace(match[0], "").trim() +
          "\n\n⛔ *Acesso Negado*: Esta ação requer permissão de administrador (Tag: ADMIN)."
        );
      }

      const jsonContent = match[1].trim();
      console.log("[OpenAiService] Social Media JSON:", jsonContent);

      const postData = JSON.parse(jsonContent);
      const { platform, message, image, scheduledTime } = postData;

      if (!platform || !message) {
        return (
          response.replace(match[0], "").trim() +
          "\n\n(Erro: Plataforma ou mensagem ausente para postagem)"
        );
      }

      // Get pages to find ID
      const pages = await getConnectedPages(ticket.companyId);
      if (pages.length === 0) {
        return (
          response.replace(match[0], "").trim() +
          "\n\n(Erro: Nenhuma página/conta conectada encontrada)"
        );
      }

      let result = "";

      if (platform === "facebook") {
        // Use first page
        const page = pages[0];
        await publishToFacebook(
          ticket.companyId,
          page.id,
          message,
          image,
          scheduledTime
        );
        if (scheduledTime) {
          result = `Agendado com sucesso no Facebook (${page.name}) para ${scheduledTime}!`;
        } else {
          result = `Postado com sucesso no Facebook da página ${page.name}!`;
        }
      } else if (platform === "instagram") {
        if (scheduledTime) {
          try {
            const parsedDate = zonedTimeToUtc(
              scheduledTime,
              "America/Sao_Paulo"
            );
            const payload = {
              platform: "instagram",
              message,
              image
            };
            await CreateScheduleService({
              body: `__SOCIAL_POST__${JSON.stringify(payload)}`,
              sendAt: parsedDate.toISOString(),
              contactId: contact.id,
              companyId: ticket.companyId,
              userId: ticket.userId || undefined,
              ticketUserId: ticket.userId || undefined
            });
            result = `Agendado com sucesso no Instagram para ${scheduledTime}!`;
          } catch (e) {
            console.error("Erro ao agendar Instagram:", e);
            return (
              response.replace(match[0], "").trim() +
              "\n\n❌ Erro ao agendar postagem no Instagram."
            );
          }
        } else {
          const pageWithInsta = pages.find(p => p.instagram_business_account);
          if (!pageWithInsta) {
            return (
              response.replace(match[0], "").trim() +
              "\n\n(Erro: Nenhuma conta de Instagram conectada à página)"
            );
          }
          if (!image) {
            return (
              response.replace(match[0], "").trim() +
              "\n\n(Erro: Imagem é obrigatória para Instagram)"
            );
          }
          await publishToInstagram(
            ticket.companyId,
            pageWithInsta.instagram_business_account.id,
            image,
            message
          );
          result = `Postado com sucesso no Instagram @${pageWithInsta.instagram_business_account.username}!`;
        }
      } else {
        result = "(Erro: Plataforma desconhecida)";
      }

      return response.replace(match[0], "").trim() + "\n\n✅ " + result;
    } catch (e) {
      console.error("Erro ao postar em social media via AI:", e);
      return (
        response.replace(match[0], "").trim() +
        "\n\n❌ Erro ao realizar postagem: " +
        e.message
      );
    }
  }
  return response;
};

const executeVideoPost = async (
  ticket: Ticket,
  platform: string,
  url: string,
  caption: string,
  response: string,
  tag: string
) => {
  const pages = await getConnectedPages(ticket.companyId);
  if (pages.length === 0)
    return (
      response.replace(tag, "").trim() + "\n\n(Erro: Nenhuma página conectada)"
    );

  let result = "";
  try {
    if (platform === "facebook") {
      const page = pages[0];
      await publishVideoToFacebook(ticket.companyId, page.id, url, caption);
      result = `Vídeo postado no Facebook (${page.name})!`;
    } else if (platform === "instagram") {
      const pageWithInsta = pages.find(p => p.instagram_business_account);
      if (!pageWithInsta)
        return (
          response.replace(tag, "").trim() +
          "\n\n(Erro: Instagram não conectado)"
        );
      await publishVideoToInstagram(
        ticket.companyId,
        pageWithInsta.instagram_business_account.id,
        url,
        caption
      );
      result = `Vídeo postado no Instagram (@${pageWithInsta.instagram_business_account.username})!`;
    }

    await incrementUsage(ticket.companyId, "limitPosts", 1);
    return response.replace(tag, "").trim() + "\n\n✅ " + result;
  } catch (e) {
    console.error("Erro no executeVideoPost:", e);
    return (
      response.replace(tag, "").trim() +
      "\n\n❌ Erro ao postar vídeo: " +
      e.message
    );
  }
};

const handleVideoPostAction = async (
  response: string,
  ticket: Ticket,
  contact: Contact,
  wbot: Session,
  msg: proto.IWebMessageInfo
): Promise<string> => {
  const videoRegex = /\[POST_VIDEO\]([\s\S]*?)\[\/POST_VIDEO\]/;
  const match = response.match(videoRegex);

  if (match && match[1]) {
    try {
      if (!(await verifyAdminPermission(contact))) {
        return (
          response.replace(match[0], "").trim() +
          "\n\n⛔ *Acesso Negado*: Esta ação requer permissão de administrador (Tag: ADMIN)."
        );
      }

      // Verifica se o módulo está ativo
      if (!(await checkPlanFeature(ticket.companyId, "useAutoPosts"))) {
        return (
          response.replace(match[0], "").trim() +
          '\n\n⚠️ *Recurso Bloqueado*: O módulo de Postagem Automática não está ativo no seu plano. Deseja ativar? [UPGRADE_PLAN] { "type": "posts" } [/UPGRADE_PLAN]'
        );
      }

      // Check Plan Limit
      if (!(await checkPlanLimit(ticket.companyId, "limitPosts", "POST"))) {
        return (
          response.replace(match[0], "").trim() +
          "\n\n⚠️ *Limite Atingido*: Você atingiu o limite de postagens do seu plano. Deseja adicionar mais postagens ao seu pacote?"
        );
      }

      const jsonContent = match[1].trim();
      const postData = JSON.parse(jsonContent);
      const { platform, caption } = postData;

      // Find Video Message
      let videoMsg = msg;
      let buffer: Buffer | null = null;
      let filename = "";

      // 1. Check current message
      if (videoMsg.message?.videoMessage) {
        buffer = (await downloadMediaMessage(
          videoMsg,
          "buffer",
          {},
          {
            logger,
            reuploadRequest: wbot.updateMediaMessage
          }
        )) as Buffer;
        filename = `video_${new Date().getTime()}.mp4`;
      }
      // 2. Check quoted message
      else if (
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ?.videoMessage
      ) {
        // Need to construct a pseudo WAMessage for downloadMediaMessage or fetch it
        // Creating a minimal object compatible with downloadMediaMessage
        const quoted = msg.message.extendedTextMessage.contextInfo;
        const pseudoMsg: any = {
          message: quoted.quotedMessage,
          key: {
            remoteJid: msg.key.remoteJid,
            id: quoted.stanzaId
          }
        };
        buffer = (await downloadMediaMessage(
          pseudoMsg,
          "buffer",
          {},
          {
            logger,
            reuploadRequest: wbot.updateMediaMessage
          }
        )) as Buffer;
        filename = `video_${new Date().getTime()}.mp4`;
      }
      // 3. Look in history (last video sent by user)
      else {
        const lastVideo = await Message.findOne({
          where: { ticketId: ticket.id, mediaType: "video", fromMe: false },
          order: [["createdAt", "DESC"]]
        });

        if (lastVideo && lastVideo.mediaUrl) {
          filename = lastVideo.mediaUrl.split("/").pop() || "";
          // If local file
          const publicFolder = path.resolve(
            __dirname,
            "..",
            "..",
            "..",
            "public",
            `company${ticket.companyId}`
          );
          const filePath = path.join(publicFolder, filename);

          if (fs.existsSync(filePath)) {
            const publicUrl = `${process.env.BACKEND_URL}/public/company${ticket.companyId}/${filename}`;
            return await executeVideoPost(
              ticket,
              platform,
              publicUrl,
              caption,
              response,
              match[0]
            );
          }
        }
        return (
          response.replace(match[0], "").trim() +
          "\n\n(Erro: Nenhum vídeo encontrado para postar. Por favor, envie o vídeo agora.)"
        );
      }

      if (buffer && filename) {
        const publicFolder = path.resolve(
          __dirname,
          "..",
          "..",
          "..",
          "public",
          `company${ticket.companyId}`
        );
        if (!fs.existsSync(publicFolder))
          fs.mkdirSync(publicFolder, { recursive: true });

        const filePath = path.join(publicFolder, filename);
        fs.writeFileSync(filePath, buffer);

        const publicUrl = `${process.env.BACKEND_URL}/public/company${ticket.companyId}/${filename}`;
        return await executeVideoPost(
          ticket,
          platform,
          publicUrl,
          caption,
          response,
          match[0]
        );
      }
    } catch (e) {
      console.error("Erro ao postar vídeo:", e);
      return (
        response.replace(match[0], "").trim() + `\n\n❌ Erro: ${e.message}`
      );
    }
  }
  return response;
};

const handleUpgradeAction = async (response: string) => {
  const upgradeRegex = /\[UPGRADE_PLAN\]([\s\S]*?)\[\/UPGRADE_PLAN\]/;
  const match = response.match(upgradeRegex);
  if (match && match[1]) {
    try {
      const json = JSON.parse(match[1]);
      const type = json.type;

      let link = "https://aipensa.com/upgrade";
      if (type === "posts") link = "https://aipensa.com/checkout/addon-posts";
      if (type === "voice") link = "https://aipensa.com/checkout/addon-voice";
      if (type === "agent") link = "https://aipensa.com/checkout/module-agent";

      return (
        response.replace(match[0], "").trim() +
        `\n\n🚀 *Upgrade*: Para aumentar seu limite ou ativar este recurso, acesse: ${link}\nAssim que o pagamento for confirmado, o recurso será liberado automaticamente.`
      );
    } catch (e) {
      return response.replace(match[0], "").trim();
    }
  }
  return response;
};

// Helper to resolve API Key
const resolveApiKey = async (prov?: string, key?: string) => {
  if (key && key.trim() !== "") return key;

  // Check Global Settings (Company 1)
  try {
    let settingKey = "userApiToken"; // Default for OpenAI
    if (prov === "openrouter") settingKey = "openrouterApiKey";
    if (prov === "gemini") settingKey = "geminiApiKey";
    if (prov === "external") settingKey = "externalAgentApiKey";

    // Try fetching global setting
    const setting = await Setting.findOne({ where: { companyId: 1, key: settingKey } });
    if (setting?.value) {
      console.log(`[OpenAiService] Found global key for ${prov}: ${settingKey}`);
      return setting.value;
    }
    
    // Fallback: check if 'userApiToken' is used for everything in some setups
    // But only if we are not explicitly looking for openai (which already uses userApiToken)
    if (prov !== "openai") {
       const genericSetting = await Setting.findOne({ where: { companyId: 1, key: "userApiToken" } });
       if (genericSetting?.value) {
          console.log(`[OpenAiService] Found generic global key (userApiToken) for ${prov}`);
          return genericSetting.value;
       }
    }

  } catch(e) { console.error("[OpenAiService] Error fetching global key:", e); }

  if (prov === "openrouter") return process.env.OPENROUTER_API_KEY || "";
  if (prov === "gemini") return process.env.GEMINI_API_KEY || "";
  if (prov === "external") return process.env.EXTERNAL_AGENT_API_KEY || "";
  return process.env.OPENAI_API_KEY || "";
};

const handleImageGenerationAction = async (
  response: string,
  ticket: Ticket,
  contact: Contact,
  wbot: Session
): Promise<string> => {
  const imageRegex = /\[GENERATE_IMAGE\]([\s\S]*?)\[\/GENERATE_IMAGE\]/;
  const match = response.match(imageRegex);

  if (match && match[1]) {
    try {
      const jsonContent = match[1].trim();
      const { prompt, size } = JSON.parse(jsonContent);

      const openaiApiKey = await resolveApiKey("openai");
      if (!openaiApiKey) {
          throw new Error("Chave da OpenAI não configurada para geração de imagens.");
      }

      const openai = new OpenAI({
        apiKey: openaiApiKey
      });

      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: size || "1024x1024"
      });

      const imageUrl = imageResponse.data[0].url;

      if (imageUrl) {
        await wbot.sendMessage(ticket.contact.remoteJid, {
          image: { url: imageUrl },
          caption: `🎨 Imagem gerada com sucesso!\n\nDescrição: ${prompt}\n\nDeseja postar nas redes sociais? Responda com 'Sim' para eu preparar a postagem.`
        });
        
        return response.replace(match[0], "").trim() + "\n\n✅ Imagem gerada e enviada!";
      } else {
        return response.replace(match[0], "").trim() + "\n\n❌ Falha ao gerar imagem.";
      }
    } catch (e) {
      console.error("Erro ao gerar imagem DALL-E:", e);
      return (
        response.replace(match[0], "").trim() +
        `\n\n❌ Erro ao gerar imagem: ${e.message}`
      );
    }
  }
  return response;
};

export const handleOpenAi = async (
  openAiSettings: IOpenAi,
  msg: proto.IWebMessageInfo,
  wbot: Session,
  ticket: Ticket,
  contact: Contact,
  mediaSent: Message | undefined,
  ticketTraking: TicketTraking
): Promise<void> => {
  console.log(
    `[handleOpenAi] Starting for ticket ${ticket.id} contact ${contact.id}`
  );

  // REGRA PARA DESABILITAR O BOT PARA ALGUM CONTATO
  if (contact.disableBot) {
    console.log(`[handleOpenAi] Bot disabled for contact ${contact.id}`);
    return;
  }

  // Check Agent AI Feature
  const hasAgentAi = await checkPlanFeature(ticket.companyId, "useAgentAi");
  console.log(
    `[handleOpenAi] Company ${ticket.companyId} has useAgentAi: ${hasAgentAi}`
  );
  if (!hasAgentAi) {
    return;
  }

  // Check Voice Commands
  const isAudio = !!msg.message?.audioMessage;
  if (isAudio) {
    const hasVoice = await checkPlanFeature(
      ticket.companyId,
      "useVoiceCommands"
    );
    console.log(`[handleOpenAi] Audio message. hasVoice: ${hasVoice}`);
    if (!hasVoice) {
      return;
    }

    // Check Voice Limit
    const hasVoiceLimit = await checkPlanLimit(
      ticket.companyId,
      "limitVoiceMinutes",
      "VOICE_SECONDS"
    );
    console.log(`[handleOpenAi] hasVoiceLimit: ${hasVoiceLimit}`);
    if (!hasVoiceLimit) {
      return;
    }

    const audioSeconds = msg.message?.audioMessage?.seconds || 0;
    await incrementUsage(
      ticket.companyId,
      "VOICE_SECONDS",
      audioSeconds,
      msg.key.id
    );
  }

  const bodyMessage = getBodyMessage(msg);
  console.log(`[handleOpenAi] Body message: ${bodyMessage}`);
  if (!bodyMessage) return;

  if (!openAiSettings) {
    console.log(`[handleOpenAi] No openAiSettings provided`);
    return;
  }
  if (msg.messageStubType) return;

  // Definir provider padrão se não estiver definido
  const provider = openAiSettings.provider || "openai";

  console.log(`Using AI Provider: ${provider}`);

  const publicFolder: string = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "public",
    `company${ticket.companyId}`
  );

  let aiClient: OpenAI | GoogleGenerativeAI | any;
  // Resolver chave da plataforma quando não informada
  const effectiveApiKey = await resolveApiKey(provider, openAiSettings.apiKey);

  if (!effectiveApiKey) {
     console.error(`[OpenAiService] Error: No API Key found for provider ${provider}`);
     throw new Error(`Chave API não configurada globalmente para ${provider}. Verifique as Configurações.`);
  }
  console.log(
    `[OpenAiService] Provider ${provider} using key: ${
      typeof effectiveApiKey === "string" && effectiveApiKey.length > 6
        ? effectiveApiKey.substring(0, 6) + "****"
        : "invalid"
    }`
  );

  if (provider === "gemini") {
    // Configurar Gemini
    console.log(
      "Initializing Gemini Service",
      effectiveApiKey?.substring(0, 10) + "..."
    );
    aiClient = new GoogleGenerativeAI(effectiveApiKey);
  } else if (provider === "openrouter") {
    // Configurar OpenRouter
    console.log(
      "Initializing OpenRouter Service",
      effectiveApiKey?.substring(0, 10) + "..."
    );
    aiClient = new OpenAI({
      apiKey: effectiveApiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.FRONTEND_URL || "https://aipensa.com", // Optional, for including your app on openrouter.ai rankings.
        "X-Title": "AIPENSA.COM" // Optional. Shows in rankings on openrouter.ai.
      }
    });
  } else if (provider === "external") {
    // Configurar Integração Externa (DireitaI / Outros)
    // Não precisa inicializar cliente, usaremos axios diretamente
    console.log("Using External Provider for Ticket:", ticket.id);
  } else {
    // Configurar OpenAI (padrão)
    console.log(
      "Initializing OpenAI Service",
      effectiveApiKey?.substring(0, 10) + "..."
    );
    aiClient = new OpenAI({
      apiKey: effectiveApiKey
    });
  }

  const messages = await Message.findAll({
    where: { ticketId: ticket.id },
    order: [["createdAt", "ASC"]],
    limit: openAiSettings.maxMessages
  });

  // Fetch Catalog for Context
  let catalogContext = "";
  try {
    const ownerJid = wbot.user?.id;
    if (ownerJid) {
      // Sanitize phone number: remove non-digits, remove suffix
      const phoneNumber = ownerJid
        .split("@")[0]
        .split(":")[0]
        .replace(/\D/g, "");
      const catalogLink = `https://wa.me/c/${phoneNumber}`;

      console.log(
        `[OpenAiService] Fetching catalog for ${ownerJid} (Phone: ${phoneNumber})`
      );
      const products = await getCatalog(wbot, ownerJid);
      console.log(`[OpenAiService] Catalog fetched: ${products.length} items`);

      if (products && products.length > 0) {
        catalogContext = `\n\n🛍️ LINK GERAL DO CATÁLOGO: ${catalogLink}\n`;
        catalogContext += "🛍️ CATÁLOGO DE PRODUTOS DISPONÍVEIS:\n";
        products.forEach(p => {
          const price = (p.price / 1000).toLocaleString("pt-BR", {
            style: "currency",
            currency: p.currency || "BRL"
          });
          // Use provided URL or fallback to product deep link
          // Note: WhatsApp Product Deep Links format: https://wa.me/p/{productId}/{phoneNumber}
          const productLink = p.url || `https://wa.me/p/${p.id}/${phoneNumber}`;

          catalogContext += `- ID: ${p.id} | ${p.name} | ${price}\n`;
          catalogContext += `  Link: ${productLink}\n`;
          // Add image URL if available to context so AI knows it exists
          if (p.image) catalogContext += `  Img: ${p.image}\n`;

          if (p.description)
            catalogContext += `  Desc: ${p.description.substring(0, 100)}${
              p.description.length > 100 ? "..." : ""
            }\n`;
        });
        catalogContext +=
          "\nINSTRUÇÕES DE VENDA:\n" +
          "- Priorize recomendar produtos específicos que atendam à necessidade do cliente.\n" +
          "- Se o cliente pedir o link de um produto, envie o Link específico listado acima ou use a tag [SEND_PRODUCT: ID].\n" +
          "- A tag [SEND_PRODUCT: ID_DO_PRODUTO] envia um cartão interativo do produto. Use-a preferencialmente para destacar o produto.\n" +
          "- Só envie o LINK GERAL DO CATÁLOGO se o cliente pedir explicitamente por 'catálogo completo' ou 'todos os produtos'.\n" +
          "- NÃO envie o link geral e o produto específico na mesma mensagem para evitar duplicação.\n" +
          "- Exemplo: 'Aqui está o pacote ideal para você! [SEND_PRODUCT: 12345]'\n" +
          "- Não invente produtos que não estejam nesta lista.\n";
      } else {
        console.log(
          `[OpenAiService] No products found in catalog for ${ownerJid}`
        );
      }
    }
  } catch (e) {
    console.error("[OpenAiService] Error fetching catalog:", e);
  }

  const promptSystem = `Nas respostas utilize o nome ${sanitizeName(
    contact.name || "Amigo(a)"
  )} para identificar o cliente.\nData e Hora atual: ${new Date().toLocaleString(
    "pt-BR",
    { timeZone: "America/Sao_Paulo" }
  )}\nSua resposta deve usar no máximo ${
    openAiSettings.maxTokens
  } tokens e cuide para não truncar o final.\nSempre que possível, mencione o nome dele para ser mais personalizado o atendimento e mais educado. Quando a resposta requer uma transferência para o setor de atendimento, comece sua resposta com 'Ação: Transferir para o setor de atendimento'.\n
  
  CAPACIDADES DE MARKETING (SUPERAGENT):
  Você pode acessar dados de marketing (Meta/Facebook Ads) usando comandos JSON específicos.
  IMPORTANTE: Estas ações só funcionam se o usuário tiver a tag "ADMIN".
  - Para ver métricas (insights): Use a tag [MARKETING] { "action": "get_insights", "period": "last_7d" } [/MARKETING] (periodos: today, yesterday, last_7d, last_30d)
  - Para listar campanhas: Use a tag [MARKETING] { "action": "get_campaigns", "status": "ACTIVE" } [/MARKETING] (status: ACTIVE, PAUSED)
  
  CAPACIDADES DE MÍDIA SOCIAL (SUPERAGENT):
  Você pode publicar conteúdo no Facebook e Instagram (Feed).
  IMPORTANTE: Esta ação só funciona se o usuário tiver a tag "ADMIN".
  - Para publicar FOTO/TEXTO: Use a tag [POST_FEED] { "platform": "facebook", "message": "Texto do post", "image": "URL_da_imagem" } [/POST_FEED]
  - Para agendar no Facebook: inclua "scheduledTime": "2026-02-01T15:00:00" (ISO/BRT) no JSON de [POST_FEED]
  - Para agendar no Instagram: inclua "scheduledTime" em [POST_FEED]; usamos agendador interno para publicar no horário.
  - Para publicar VÍDEO: Use a tag [POST_VIDEO] { "platform": "facebook", "caption": "Legenda do vídeo" } [/POST_VIDEO].
    - O vídeo será pego automaticamente do anexo atual, da mensagem citada ou do último vídeo enviado.
    - Gere uma legenda criativa, com emojis e hashtags, baseada no contexto.
  - Plataformas: "facebook" ou "instagram".
  - Se o usuário pedir para postar um produto do catálogo, pegue a URL da imagem do produto e a descrição, e use esta tag.
  - Imagem é OBRIGATÓRIA para Instagram. Opcional para Facebook.
  
  STATUS WHATSAPP:
  - Para postar no Status: Use a tag [POST_STATUS] { "caption": "Legenda", "media": "image|video", "source": "chat|files", "file": "nome.ext" } [/POST_STATUS]
  - Se 'source' = "chat": o agente usa a mídia atual/citada/última do histórico.
  - Se 'source' = "files": o agente usa o arquivo salvo na aba Arquivos.

  CAPACIDADES DE PAGAMENTO (SUPERAGENT):
  Você pode solicitar pagamento via PIX nativo do WhatsApp.
  - Para solicitar um pagamento: Use a tag [SEND_PIX] { "key": "chave-pix", "key_type": "cpf|cnpj|email|phone|random", "merchant_name": "Nome da Loja", "amount": 199.9, "title": "Produto/Serviço" } [/SEND_PIX]
  - O cliente verá o fluxo de pagamento nativo e poderá pagar imediatamente.

  CAPACIDADES DE UPGRADE (SUPERAGENT):
  - Se o usuário quiser contratar mais postagens, minutos de voz ou ativar um módulo, use a tag [UPGRADE_PLAN] { "type": "posts" } [/UPGRADE_PLAN].
  - Types disponíveis: "posts", "voice", "agent".
  - Use isso quando o usuário reclamar de limites ou pedir para contratar algo.

  NÃO invente dados. Se o usuário perguntar sobre campanhas ou desempenho, use essas tags e aguarde a resposta do sistema.

  IMAGE GENERATION (DALL-E):
  You can generate images using DALL-E based on the user's prompt.
  IMPORTANT: This action only works if the user has the "ADMIN" tag.
  - To generate an image: Use the tag [GENERATE_IMAGE] { "prompt": "Description of the image", "size": "1024x1024" } [/GENERATE_IMAGE]
  - After generating, ask the user if they want to post it to social media using the [POST_FEED] command.
  
  ${catalogContext}
  
  ${openAiSettings.prompt}\n`;

  let messagesOpenAi = [];

  if (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage
  ) {
    console.log(`Processing text/image message with ${provider}`);
    messagesOpenAi = [];
    messagesOpenAi.push({ role: "system", content: promptSystem });

    for (
      let i = 0;
      i < Math.min(openAiSettings.maxMessages, messages.length);
      i++
    ) {
      const message = messages[i];
      if (
        message.mediaType === "conversation" ||
        message.mediaType === "extendedTextMessage"
      ) {
        if (message.fromMe) {
          messagesOpenAi.push({ role: "assistant", content: message.body });
        } else {
          messagesOpenAi.push({ role: "user", content: message.body });
        }
      }
    }

    if (msg.message?.imageMessage) {
      const mediaUrl = mediaSent!.mediaUrl!.split("/").pop();
      const filePath = `${publicFolder}/${mediaUrl}`;
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = msg.message.imageMessage.mimetype || "image/jpeg";

      messagesOpenAi.push({
        role: "user",
        content: [
          { type: "text", text: bodyMessage || "Analise esta imagem." },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      });
    } else {
      messagesOpenAi.push({ role: "user", content: bodyMessage! });
    }

    let response: string | undefined;

    try {
      // Chamar o provedor correto
      if (provider === "gemini") {
        response = await callGemini(aiClient, messagesOpenAi, openAiSettings);
      } else if (provider === "external") {
        const integrationUrl =
          openAiSettings.model || "https://api.direitai.com/v1/agent/chat";
        const integrationToken = openAiSettings.apiKey;

        const payload = {
          remoteJid: msg.key.remoteJid,
          pushName: contact.name,
          message: bodyMessage,
          ticketId: ticket.id,
          integrationId: integrationToken,
          history: messagesOpenAi // Optional: send history if needed
        };

        const { data } = await axios.post(integrationUrl, payload);
        response = data.response || data.message;

        if (data.action === "transfer") {
          response = `Ação: Transferir para o setor de atendimento ${
            response ? "\n" + response : ""
          }`;
        }
      } else {
        response = await callOpenAI(aiClient, messagesOpenAi, openAiSettings);
      }

      if (response?.includes("Ação: Transferir para o setor de atendimento")) {
        console.log("Transferring to queue", openAiSettings.queueId);
        await transferQueue(openAiSettings.queueId, ticket, contact);
        response = response
          .replace("Ação: Transferir para o setor de atendimento", "")
          .trim();
      }

      if (response) {
        // Processar ações de agendamento
        response = await handleScheduleAction(response, ticket, contact);

        // Processar ações de marketing
        response = await handleMarketingAction(response, ticket, contact);

        // Processar ações de catálogo
        response = await handleCatalogAction(response, wbot, msg);

        // Processar ações de social media
        response = await handleSocialMediaAction(response, ticket, contact);

        // Processar ações de postagem de vídeo
        response = await handleVideoPostAction(
          response,
          ticket,
          contact,
          wbot,
          msg
        );

        // Postar Status do WhatsApp
        response = await handleStatusPostAction(
          response,
          ticket,
          contact,
          wbot,
          msg
        );

      // Processar ações de pagamento PIX
        response = await handlePixAction(response, ticket, contact, wbot);

      // Processar geração de imagem DALL-E
      if (response?.includes("[GENERATE_IMAGE]")) {
         response = await handleImageGenerationAction(response, ticket, contact, wbot);
      }

        // Processar ações de upgrade
        response = await handleUpgradeAction(response);
      }

      // Verifica se a resposta foi processada (schedule ou marketing)
      // Se ainda contiver tags (erro ou não processado), poderíamos limpar ou deixar como está.
      // Vamos assumir que as funções acima já limpam as tags.

      if (response) {
        const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          text: `\u200e ${response!}`
        });
        await verifyMessage(sentMessage!, ticket, contact);
      }
    } catch (error) {
      console.error(`Error calling ${provider}:`, error);
      console.error(
        "OpenAI/OpenRouter Error Details:",
        JSON.stringify(error, Object.getOwnPropertyNames(error))
      );
      // Fallback: enviar mensagem de erro
      await wbot.sendMessage(msg.key.remoteJid!, {
        text: `Desculpe, ocorreu um erro temporário: ${
          error.message || "Erro desconhecido"
        }. Tente novamente em alguns instantes.`
      });
    }
  } else if (msg.message?.audioMessage) {
    console.log(`Processing audio message with ${provider}`);
    let mediaUrl: string | undefined = mediaSent?.mediaUrl
      ? mediaSent.mediaUrl.split("/").pop()
      : undefined;

    if (!mediaUrl) {
      try {
        const msgRecord = await Message.findOne({
          where: { wid: msg.key.id, ticketId: ticket.id }
        });
        mediaUrl = msgRecord?.mediaUrl?.split("/").pop();
      } catch (e) {
        console.log("Fallback lookup by wid failed:", e);
      }
    }

    if (!mediaUrl) {
      try {
        const lastAudio = await Message.findOne({
          where: { ticketId: ticket.id, mediaType: "audio" },
          order: [["createdAt", "DESC"]]
        });
        mediaUrl = lastAudio?.mediaUrl?.split("/").pop();
      } catch (e) {
        console.log("Fallback lookup for last audio failed:", e);
      }
    }

    if (!mediaUrl) {
      console.error("Audio mediaUrl not found for transcription");
      await wbot.sendMessage(msg.key.remoteJid!, {
        text: "Desculpe, não consegui localizar o áudio para processar."
      });
      return;
    }

    const file = fs.createReadStream(`${publicFolder}/${mediaUrl}`) as any;

    let transcriptionText: string;

    try {
      const transcriptionApiKey = await (async () => {
        const voiceKey = (openAiSettings.voiceKey || "").trim();
        if (voiceKey !== "") return voiceKey;
        
        // Prioritize OpenAI key for transcription (Whisper) as requested
        // This ensures we don't use OpenRouter key for direct OpenAI calls unless intended
        const openaiKey = await resolveApiKey("openai");
        if (openaiKey) return openaiKey;

        const base = await resolveApiKey(provider, openAiSettings.apiKey);
        // Se usar Azure para voz, permitir fallback de env
        if ((openAiSettings.voiceRegion || "").toLowerCase() === "azure") {
          return process.env.AZURE_SPEECH_KEY || base;
        }
        return base;
      })();

      const transcriptionClient = new OpenAI({
        apiKey: transcriptionApiKey
      });

      const transcription =
        await transcriptionClient.audio.transcriptions.create({
          model: "whisper-1",
          file: file
        });
      transcriptionText = transcription.text;

      messagesOpenAi = [];
      messagesOpenAi.push({ role: "system", content: promptSystem });

      for (
        let i = 0;
        i < Math.min(openAiSettings.maxMessages, messages.length);
        i++
      ) {
        const message = messages[i];
        if (
          message.mediaType === "conversation" ||
          message.mediaType === "extendedTextMessage"
        ) {
          if (message.fromMe) {
            messagesOpenAi.push({ role: "assistant", content: message.body });
          } else {
            messagesOpenAi.push({ role: "user", content: message.body });
          }
        }
      }
      messagesOpenAi.push({ role: "user", content: transcriptionText });

      let response: string | undefined;

      // Chamar o provedor correto para resposta
      if (provider === "gemini") {
        response = await callGemini(aiClient, messagesOpenAi, openAiSettings);
      } else if (provider === "external") {
        const integrationUrl =
          openAiSettings.model || "https://api.direitai.com/v1/agent/chat";
        const integrationToken = openAiSettings.apiKey;

        const payload = {
          remoteJid: msg.key.remoteJid,
          pushName: contact.name,
          message: transcriptionText, // Send transcription as message
          ticketId: ticket.id,
          integrationId: integrationToken,
          history: messagesOpenAi
        };

        const { data } = await axios.post(integrationUrl, payload);
        response = data.response || data.message;

        if (data.action === "transfer") {
          response = `Ação: Transferir para o setor de atendimento ${
            response ? "\n" + response : ""
          }`;
        }
      } else {
        response = await callOpenAI(aiClient, messagesOpenAi, openAiSettings);
      }

      if (response?.includes("Ação: Transferir para o setor de atendimento")) {
        await transferQueue(openAiSettings.queueId, ticket, contact);
        response = response
          .replace("Ação: Transferir para o setor de atendimento", "")
          .trim();
      }

      if (response) {
        // Processar ações de agendamento
        response = await handleScheduleAction(response, ticket, contact);

        // Processar ações de marketing
        response = await handleMarketingAction(response, ticket, contact);

        // Processar ações de catálogo
        response = await handleCatalogAction(response, wbot, msg);

        // Processar ações de social media
        response = await handleSocialMediaAction(response, ticket, contact);

        // Processar ações de postagem de vídeo
        response = await handleVideoPostAction(
          response,
          ticket,
          contact,
          wbot,
          msg
        );

        // Postar Status do WhatsApp
        response = await handleStatusPostAction(
          response,
          ticket,
          contact,
          wbot,
          msg
        );

        // Processar ações de pagamento PIX
        response = await handlePixAction(response, ticket, contact, wbot);

        // Processar ações de upgrade
        response = await handleUpgradeAction(response);
      }
      const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
      try {
        const voiceKeyResolved = await (async () => {
          const vKey = (openAiSettings.voiceKey || "").trim();
          if (vKey !== "") return vKey;
          const base = await resolveApiKey(provider, openAiSettings.apiKey);
          if ((openAiSettings.voiceRegion || "").toLowerCase() === "azure") {
            return process.env.AZURE_SPEECH_KEY || base;
          }
          return base;
        })();

        await convertTextToSpeechAndSaveToFile(
          keepOnlySpecifiedChars(response!),
          `${publicFolder}/${fileNameWithOutExtension}`,
          voiceKeyResolved,
          openAiSettings.voiceRegion || "openai",
          openAiSettings.voice,
          "mp3"
        );
        const sendMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          audio: { url: `${publicFolder}/${fileNameWithOutExtension}.mp3` },
          mimetype: "audio/mpeg",
          ptt: true
        });
        await verifyMediaMessage(
          sendMessage!,
          ticket,
          contact,
          ticketTraking,
          false,
          false,
          wbot
        );
        deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
        deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
      } catch (error) {
        const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          text: `\u200e ${response!}`
        });
        await verifyMessage(sentMessage!, ticket, contact);
      }
    } catch (error) {
      console.error(`Error processing audio with ${provider}:`, error);
      await wbot.sendMessage(msg.key.remoteJid!, {
        text: "Desculpe, não consegui processar o áudio. Tente enviar uma mensagem de texto."
      });
    }
  }
  messagesOpenAi = [];
};
