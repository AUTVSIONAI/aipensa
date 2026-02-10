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
import GenerateImageService from "../HuggingFaceService/GenerateImageService";
import { Op } from "sequelize";

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

    if (!contactWithTags || !contactWithTags.tags) {
      console.log(`[verifyAdminPermission] Contact ${contact.id} has no tags.`);
      return false;
    }

    const tags = contactWithTags.tags.map(t => t.name);
    console.log(`[verifyAdminPermission] Contact ${contact.id} tags (raw): ${JSON.stringify(tags)}`);

    // Check for "ADMIN" or "admin" tag
    const hasPermission = contactWithTags.tags.some(t => t.name.trim().toUpperCase() === "ADMIN");
    console.log(`[verifyAdminPermission] Contact ${contact.id} has permission: ${hasPermission}`);
    return hasPermission;
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
    "openrouter/free", // Seleciona automaticamente modelos gratuitos disponíveis
    "google/gemini-2.5-flash-image", // Modelo pago (solicitado pelo usuário)
    "google/gemini-2.0-pro-exp-02-05:free", // Versão Pro Experimental (geralmente mais estável)
    "google/gemini-2.0-flash-thinking-exp:free", // Thinking model
    "meta-llama/llama-3.3-70b-instruct:free",
    "deepseek/deepseek-r1:free",
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

      console.log(`[callOpenAI] Success with model: ${currentModel}`);
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
      if (!(await verifyAdminPermission(contact))) {
        return (
          response.replace(match[0], "").trim() +
          "\n\n⛔ Ação restrita: requer tag ADMIN."
        );
      }

      const companySettings = await CompaniesSettings.findOne({
        where: { companyId: ticket.companyId }
      });
      const isAdmin = await verifyAdminPermission(contact);
      if ((!companySettings || companySettings.enableAutoStatus !== "enabled") && !isAdmin) {
        return (
          response.replace(match[0], "").trim() +
          "\n\n⚠️ Recurso desativado nas configurações da empresa."
        );
      }

      // Verifica se o módulo está ativo
      // if (!(await checkPlanFeature(ticket.companyId, "useAutoPosts"))) {
      //   return (
      //     response.replace(match[0], "").trim() +
      //     '\n\n⚠️ *Recurso Bloqueado*: O módulo de Postagem Automática não está ativo no seu plano. Deseja ativar? [UPGRADE_PLAN] { "type": "posts" } [/UPGRADE_PLAN]'
      //   );
      // }

      // Check Plan Limit
      // if (!(await checkPlanLimit(ticket.companyId, "limitPosts", "POST"))) {
      //   return (
      //     response.replace(match[0], "").trim() +
      //     "\n\n⚠️ *Limite Atingido*: Você atingiu o limite de postagens do seu plano. Deseja adicionar mais postagens ao seu pacote?"
      //   );
      // }

      const jsonContent = match[1].trim();
      const postData = JSON.parse(jsonContent);
      
      // Tentar baixar mídia da mensagem atual (que disparou o gatilho)
      let localFilePath: string | null = null;
      if (msg.message?.imageMessage || msg.message?.videoMessage) {
         try {
           const buffer = (await downloadMediaMessage(
             msg,
             "buffer",
             {},
             { logger, reuploadRequest: wbot.updateMediaMessage }
           )) as Buffer;
           
           const publicFolder = path.resolve(__dirname, "..", "..", "..", "public", `company${ticket.companyId}`);
           if (!fs.existsSync(publicFolder)) fs.mkdirSync(publicFolder, { recursive: true });
           
           const ext = msg.message?.videoMessage ? "mp4" : "jpg";
           const fileName = `${ticket.id}_${Date.now()}_status_temp.${ext}`;
           const filePath = path.join(publicFolder, fileName);
           fs.writeFileSync(filePath, buffer);
           localFilePath = filePath;
           console.log(`[handleStatusPostAction] Media saved to: ${localFilePath}`);
         } catch (err) {
           console.error("[handleStatusPostAction] Error downloading media:", err);
         }
      }

      const dataWebhook: any = Object.assign({}, ticket.dataWebhook || {});
      dataWebhook.pendingStatusPost = {
        caption: postData.caption || "",
        source: postData.source || "chat",
        file: postData.file || null,
        media: postData.media || "image",
        localFilePath: localFilePath
      };
      await ticket.update({ dataWebhook });
      return (
        response.replace(match[0], "").trim() +
        "\n\nConfirma publicar este Status? Responda 'sim' ou 'não'."
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

      console.log(`[OpenAiService] Processing Social Media Action: Platform=${platform}, Image=${image}`);

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

const handleLinkAction = async (
  response: string,
  wbot: Session,
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  openAiSettings: IOpenAi
): Promise<string> => {
  const linkRegex = /\[SEND_LINK\]([\s\S]*?)\[\/SEND_LINK\]/;
  const match = response.match(linkRegex);

  if (match && match[1]) {
    try {
      const url = match[1].trim();
      if (msg.key.remoteJid) {
         const sentMessage = await wbot.sendMessage(msg.key.remoteJid, { text: url });
         await verifyMessage(sentMessage!, ticket, contact);

         const publicFolder: string = path.resolve(
           __dirname,
           "..",
           "..",
           "..",
           "public",
           `company${ticket.companyId}`
         );

         const fileNameWithOutExtension = `${ticket.id}_${Date.now()}_link`;
         try {
           const voiceKeyResolved = await (async () => {
             const vKey = (openAiSettings.voiceKey || "").trim();
             if (vKey !== "") return vKey;
             const base = await resolveApiKey("openai", openAiSettings.apiKey);
             if ((openAiSettings.voiceRegion || "").toLowerCase() === "azure") return process.env.AZURE_SPEECH_KEY || base;
             return base;
           })();

           await convertTextToSpeechAndSaveToFile(
             keepOnlySpecifiedChars(`Enviei o link por texto. Confira: ${url}`),
             `${publicFolder}/${fileNameWithOutExtension}`,
             voiceKeyResolved,
             openAiSettings.voiceRegion || "openai",
             openAiSettings.voice,
             "mp3"
           );
           await wbot.sendMessage(msg.key.remoteJid!, {
             audio: { url: `${publicFolder}/${fileNameWithOutExtension}.mp3` },
             mimetype: "audio/mpeg",
             ptt: true
           });
           deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
           deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
         } catch (err) {
           // ignore TTS failures
         }
      }
      return response.replace(match[0], "").trim() + "\n\n✅ Link enviado.";
    } catch (e) {
      console.error("Error sending link via AI:", e);
    }
  }
  return response;
};

// Helper to resolve API Key
async function resolveApiKey(prov?: string, key?: string) {
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
      return setting.value;
    }
    
    // Fallback: check if 'userApiToken' is used for everything in some setups
    if (prov !== "openai") {
       const genericSetting = await Setting.findOne({ where: { companyId: 1, key: "userApiToken" } });
       if (genericSetting?.value) {
          return genericSetting.value;
       }
    }

  } catch(e) { console.error("[OpenAiService] Error fetching global key:", e); }

  if (prov === "openrouter") return process.env.OPENROUTER_API_KEY || "";
  if (prov === "gemini") return process.env.GEMINI_API_KEY || "";
  if (prov === "external") return process.env.EXTERNAL_AGENT_API_KEY || "";
  return process.env.OPENAI_API_KEY || "";
}

const handleImageGenerationAction = async (
  response: string,
  ticket: Ticket,
  contact: Contact,
  wbot: Session,
  openAiSettings: IOpenAi
): Promise<string> => {
  let imageRegex = /\[GENERATE_IMAGE\]([\s\S]*?)\[\/GENERATE_IMAGE\]/;
  let match = response.match(imageRegex);

  // Fallback for partial/cut-off tags (e.g. [/G or missing closing)
  if (!match) {
      const partialRegex = /\[GENERATE_IMAGE\]([\s\S]*)/;
      const partialMatch = response.match(partialRegex);
      if (partialMatch && partialMatch[1]) {
          // Try to extract JSON from the rest of the string
          const potentialJson = partialMatch[1].trim();
          // Simple check: does it look like it has a closing brace?
          if (potentialJson.includes("}")) {
              match = partialMatch;
              // We'll try to parse safely below
          }
      }
  }

  if (match && match[1]) {
    try {
      if (!(await verifyAdminPermission(contact))) {
         return response.replace(match[0], "").trim() + "\n\n⛔ *Acesso Negado*: A geração de imagens requer permissão de administrador (Tag: ADMIN).";
      }

      // Clean up the content to ensure valid JSON
      let jsonContent = match[1].trim();
      // Remove any trailing characters after the last } if we are in fallback mode
      const lastBrace = jsonContent.lastIndexOf("}");
      if (lastBrace !== -1) {
          jsonContent = jsonContent.substring(0, lastBrace + 1);
      }

      const { prompt, size } = JSON.parse(jsonContent);

      let imageUrl: string | undefined;
      let usedProvider = "openai";

      // 0. Tentar Hugging Face (Prioridade Definida pelo Usuário)
      try {
        let hfKey = process.env.HUGGINGFACE_API_KEY;
        let hfModel = process.env.HUGGINGFACE_MODEL;

        try {
           const settingKey = await Setting.findOne({ where: { companyId: 1, key: "huggingFaceApiKey" } });
           if (settingKey?.value) hfKey = settingKey.value;
           
           const settingModel = await Setting.findOne({ where: { companyId: 1, key: "huggingFaceModel" } });
           if (settingModel?.value) hfModel = settingModel.value;
        } catch(err) {
           console.error("[handleImageGeneration] Error fetching global HF settings:", err);
        }

        if (hfKey) {
           console.log("[handleImageGeneration] Tentando gerar imagem via Hugging Face...");
           const result = await GenerateImageService({ prompt, apiKey: hfKey, model: hfModel });
           imageUrl = result.url;
           usedProvider = "huggingface";
           console.log("[handleImageGeneration] Sucesso via Hugging Face!");
        }
      } catch (e) {
        console.warn("[handleImageGeneration] Falha no Hugging Face:", e.message);
      }

      // 1. Tentar OpenRouter primeiro (Economia) - Somente se não gerou via HF
      if (!imageUrl) {
        try {
          console.log("[handleImageGeneration] Tentando gerar imagem via OpenRouter...");
          // Move resolveApiKey call inside try or before, but ensure variable scope
          const openRouterKey = await resolveApiKey("openrouter");
        
          if (openRouterKey) {
            try {
                const openaiRouter = new OpenAI({
                    apiKey: openRouterKey,
                    baseURL: "https://openrouter.ai/api/v1",
                    defaultHeaders: {
                        "HTTP-Referer": process.env.FRONTEND_URL || "https://aipensa.com",
                        "X-Title": "AIPENSA.COM"
                    }
                });

                // Tentar modelos do OpenRouter (ex: stabilityai/stable-diffusion-xl-base-1.0 ou auto)
                // Nota: OpenRouter usa endpoint completions para alguns modelos, mas images.generate para outros se suportado.
                // Se falhar, cairá no catch e tentará OpenAI.
                const imageResponse = await openaiRouter.images.generate({
                    model: "google/gemini-2.0-flash-lite-preview-02-05:free", // Tenta Gemini 2.0 Flash Lite Free primeiro
                    prompt: prompt,
                    n: 1,
                    size: size || "1024x1024"
                });
                
                imageUrl = imageResponse.data[0].url;
                usedProvider = "openrouter-gemini";
                console.log("[handleImageGeneration] Sucesso via OpenRouter (Gemini)!");

            } catch (e) {
                 console.warn("[handleImageGeneration] Falha no OpenRouter (Gemini), tentando Stability AI...", e.message);
                 try {
                    const openaiRouter = new OpenAI({
                        apiKey: openRouterKey,
                        baseURL: "https://openrouter.ai/api/v1",
                        defaultHeaders: {
                            "HTTP-Referer": process.env.FRONTEND_URL || "https://aipensa.com",
                            "X-Title": "AIPENSA.COM"
                        }
                    });

                    const imageResponse = await openaiRouter.images.generate({
                        model: "stabilityai/stable-diffusion-xl-base-1.0", 
                        prompt: prompt,
                        n: 1,
                        size: size || "1024x1024"
                    });
                    imageUrl = imageResponse.data[0].url;
                    usedProvider = "openrouter-stability";
                    console.log("[handleImageGeneration] Sucesso via OpenRouter (Stability)!");
                 } catch(err) {
                     console.warn("[handleImageGeneration] Falha no OpenRouter (Stability):", err.message);
                 }
            }
          }
        } catch (e) {
             console.warn("[handleImageGeneration] Erro geral no bloco OpenRouter:", e.message);
        }
      }

      // 2. Fallback para OpenAI (DALL-E 3) se OpenRouter falhou ou não tem chave
      if (!imageUrl) {
          console.log("[handleImageGeneration] Usando OpenAI (DALL-E 3) como fallback...");
          
          // Tentar chave de voz/transcrição primeiro (como solicitado anteriormente)
          let openaiApiKey = openAiSettings.voiceKey;
          
          if (!openaiApiKey || openaiApiKey.trim() === "") {
               // Tentar chave global de voz
               try {
                 const globalVoiceKey = await Setting.findOne({ where: { companyId: 1, key: "openaikeyaudio" } });
                 if (globalVoiceKey?.value) openaiApiKey = globalVoiceKey.value;
               } catch (err) {}
          }

          if (!openaiApiKey || openaiApiKey.trim() === "") {
              openaiApiKey = await resolveApiKey("openai");
          }

          if (!openaiApiKey) {
              throw new Error("Chave da OpenAI não configurada para geração de imagens (Fallback).");
          }

          const openai = new OpenAI({ apiKey: openaiApiKey });
          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: size || "1024x1024"
          });
          imageUrl = imageResponse.data[0].url;
          usedProvider = "openai";
      }

      if (imageUrl) {
        // const providerLabel = usedProvider === "huggingface" ? "Via Hugging Face" : (usedProvider === "openrouter" ? "Via OpenRouter" : "Via DALL-E");
        await wbot.sendMessage(ticket.contact.remoteJid, {
          image: { url: imageUrl },
          caption: `🎨 Imagem gerada com sucesso!\n\nDescrição: ${prompt}\n\nDeseja postar nas redes sociais? Responda com 'Sim' para eu preparar a postagem.`
        });
        
        return response.replace(match[0], "").trim() + "\n\n✅ Imagem gerada e enviada!";
      } else {
        return response.replace(match[0], "").trim() + "\n\n❌ Falha ao gerar imagem.";
      }
    } catch (e) {
      console.error("Erro ao gerar imagem:", e);
      return (
        response.replace(match[0], "").trim() +
        `\n\n❌ Erro ao gerar imagem: ${e.message}`
      );
    }
  }
  return response;
};

const processAiActions = async (
  response: string,
  ticket: Ticket,
  contact: Contact,
  wbot: Session,
  msg: proto.IWebMessageInfo,
  openAiSettings: IOpenAi
): Promise<string> => {
  if (!response) return response;

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

  // Enviar links solicitados
  response = await handleLinkAction(response, wbot, msg, ticket, contact, openAiSettings);

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
     response = await handleImageGenerationAction(response, ticket, contact, wbot, openAiSettings);
  }

  // Processar ações de upgrade
  response = await handleUpgradeAction(response);

  return response;
};

// Helper to sanitize AI response (remove reasoning/Chain-of-Thought)
const sanitizeResponse = (response: string): string => {
  if (!response) return "";
  
  // Remove <think> tags (DeepSeek R1, etc.)
  let sanitized = response.replace(/<think>[\s\S]*?<\/think>/gi, "");
  
  // Remove [THOUGHT] tags
  sanitized = sanitized.replace(/\[THOUGHT\][\s\S]*?\[\/THOUGHT\]/gi, "");
  
  // Remove specific "Okay, the user asked me..." patterns if they appear at the start
  // (Heuristic for models that leak internal monologue without tags)
  const monologueRegex = /^(Okay|Alright|Let me|I need to|The user wants|First, I will|Here is the plan)[\s\S]{0,200}(:|so|then|I will)[\s\S]*?\n\n/i;
  // Use caution with heuristics, only apply if it looks very much like a monologue

  // Remove leaked system prompt instructions
  sanitized = sanitized.replace(/CAPACIDADES DE [A-Z\s]+\(SUPERAGENT\):[\s\S]*?(\n\n|$)/g, "");
  sanitized = sanitized.replace(/INSTRUÇÕES DE VENDA:[\s\S]*?(\n\n|$)/g, "");
  sanitized = sanitized.replace(/STATUS WHATSAPP:[\s\S]*?(\n\n|$)/g, "");
  
  return sanitized.trim();
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
  const isAdmin = await verifyAdminPermission(contact);
  console.log(
    `[handleOpenAi] Company ${ticket.companyId} has useAgentAi: ${hasAgentAi}, isAdmin: ${isAdmin}`
  );
  if (!hasAgentAi && !isAdmin) {
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
    if (!hasVoice && !isAdmin) {
      return;
    }

    // Check Voice Limit
    const hasVoiceLimit = await checkPlanLimit(
      ticket.companyId,
      "limitVoiceMinutes",
      "VOICE_SECONDS"
    );
    console.log(`[handleOpenAi] hasVoiceLimit: ${hasVoiceLimit}`);
    if (!hasVoiceLimit && !isAdmin) {
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

  // FIX: Intercept known broken/offline OpenRouter models to prevent 404/400 errors and latency
  const BROKEN_MODELS = [
    "qwen/qwen-2.5-coder-32b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
    "mistralai/mistral-7b-instruct:free",
    "huggingfaceh4/zephyr-7b-beta:free"
  ];
  
  if (provider === "openrouter" && openAiSettings.model && BROKEN_MODELS.includes(openAiSettings.model)) {
      console.log(`[handleOpenAi] Replacing broken model '${openAiSettings.model}' with 'openrouter/free'`);
      openAiSettings.model = "openrouter/free";
  }

  console.log(`Using AI Provider: ${provider}`);

  const publicFolder: string = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "public",
    `company${ticket.companyId}`
  );

  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const webhookData: any = Object.assign({}, ticket.dataWebhook || {});
  const textNorm = normalize(bodyMessage || "");

  if (webhookData.pendingStatusPost) {
    console.log(`[handleOpenAi] Processing pendingStatusPost for ticket ${ticket.id}. Input: ${textNorm}`);
    const accept =
      /^(s|sim|confirmo|pode postar|ok|manda|enviar)$/i.test(textNorm) ||
      textNorm.includes("confirmar") ||
      textNorm.includes("confirmo");
    const reject =
      /^(n|nao|não|cancela|cancelar)$/i.test(textNorm) ||
      textNorm.includes("cancelar");

    if (accept || reject) {
      if (reject) {
        console.log(`[handleOpenAi] User rejected status post.`);
        delete webhookData.pendingStatusPost;
        await ticket.update({ dataWebhook: webhookData });
        const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          text: "Cancelado."
        });
        await verifyMessage(sentMessage!, ticket, contact);
        return;
      }

      console.log(`[handleOpenAi] User accepted status post. Proceeding...`);
      try {
        const statusJid = "status@broadcast";
        const { caption, source, file, media, localFilePath: storedLocalPath } = webhookData.pendingStatusPost;
        console.log(`[handleOpenAi] Status Post Data:`, webhookData.pendingStatusPost);

        let buffer: Buffer | null = null;
        let localFilePath: string | null = storedLocalPath || null;

        if (source === "chat") {
          // If we already have a stored local path, use it.
          if (!localFilePath) {
             if (msg.message?.imageMessage || msg.message?.videoMessage) {
                buffer = (await downloadMediaMessage(
                  msg,
                  "buffer",
                  {},
                  { logger, reuploadRequest: wbot.updateMediaMessage }
                )) as Buffer;
             } else if (
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage
             ) {
                const quoted = msg.message.extendedTextMessage.contextInfo;
                const pseudoMsg: any = {
                  message: quoted.quotedMessage,
                  key: { remoteJid: msg.key.remoteJid, id: quoted.stanzaId }
                };
                buffer = (await downloadMediaMessage(
                  pseudoMsg,
                  "buffer",
                  {},
                  { logger, reuploadRequest: wbot.updateMediaMessage }
                )) as Buffer;
             } else {
                // Try to find the last media sent by the user
                const lastMedia = await Message.findOne({
                  where: {
                    ticketId: ticket.id,
                    fromMe: false,
                    mediaType: { [Op.in]: ["image", "video"] }
                  },
                  order: [["createdAt", "DESC"]]
                });

                if (lastMedia && lastMedia.mediaUrl) {
                   const publicFolder = path.resolve(__dirname, "..", "..", "..", "public", `company${ticket.companyId}`);
                   const fileName = lastMedia.mediaUrl; 
                   localFilePath = path.join(publicFolder, fileName);
                   if (!fs.existsSync(localFilePath)) {
                      // Fallback: try to verify if mediaUrl is just the filename or full path
                      // In Whaticket, mediaUrl is usually just the filename
                      console.log(`[handleOpenAi] File not found at ${localFilePath}, checking if mediaUrl is absolute...`);
                   }
                   console.log(`[handleOpenAi] Found last media: ${lastMedia.mediaUrl} -> ${localFilePath}`);
                }
             }
          }
        } else if (source === "files" && file) {
          if (file.startsWith("http")) {
             const parts = file.split("/");
             const fileName = parts[parts.length - 1];
             localFilePath = path.resolve(publicFolder, fileName);
          } else {
             localFilePath = path.resolve(publicFolder, file);
          }
          console.log(`[handleOpenAi] Using file source: ${file} -> ${localFilePath}`);
        }

        let savedPath: string | null = null;

        if (media === "video") {
          if (buffer) {
            const name = `${ticket.id}_${Date.now()}.mp4`;
            savedPath = path.resolve(publicFolder, name);
            fs.writeFileSync(savedPath, buffer);
            await wbot.sendMessage(statusJid, {
              video: { url: savedPath },
              caption
            });
          } else if (localFilePath) {
            savedPath = localFilePath;
            await wbot.sendMessage(statusJid, {
              video: { url: localFilePath },
              caption
            });
          } else {
            const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
              text: "(Erro: Nenhum vídeo encontrado para postar no Status)"
            });
            await verifyMessage(sentMessage!, ticket, contact);
            delete webhookData.pendingStatusPost;
            await ticket.update({ dataWebhook: webhookData });
            return;
          }
        } else {
          if (buffer) {
            const name = `${ticket.id}_${Date.now()}.jpg`;
            savedPath = path.resolve(publicFolder, name);
            fs.writeFileSync(savedPath, buffer);
            await wbot.sendMessage(statusJid, {
              image: { url: savedPath },
              caption
            });
          } else if (localFilePath) {
            savedPath = localFilePath;
            await wbot.sendMessage(statusJid, {
              image: { url: localFilePath },
              caption
            });
          } else {
            const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
              text: "(Erro: Nenhuma imagem encontrada para postar no Status)"
            });
            await verifyMessage(sentMessage!, ticket, contact);
            delete webhookData.pendingStatusPost;
            await ticket.update({ dataWebhook: webhookData });
            return;
          }
        }

        await incrementUsage(ticket.companyId, "limitPosts", 1);

        let publicUrl: string | null = null;
        if (savedPath) {
          const fileName = path.basename(savedPath);
          const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
          publicUrl = `${backendUrl}/public/company${ticket.companyId}/${fileName}`;
        }

        webhookData.pendingSocialPost = {
          message: caption || "",
          image: media !== "video" ? publicUrl : null,
          video: media === "video" ? publicUrl : null
        };
        delete webhookData.pendingStatusPost;
        await ticket.update({ dataWebhook: webhookData });

        const ok = await wbot.sendMessage(msg.key.remoteJid!, {
          text:
            "✅ Status publicado. Deseja postar nas redes sociais? Responda 'facebook', 'instagram' ou 'sim'."
        });
        await verifyMessage(ok!, ticket, contact);
        return;
      } catch (e) {
        console.error(`[handleOpenAi] Error posting status:`, e);
        const errMsg = await wbot.sendMessage(msg.key.remoteJid!, {
          text: `❌ Erro ao postar o Status: ${e.message || e}`
        });
        await verifyMessage(errMsg!, ticket, contact);
        delete webhookData.pendingStatusPost;
        await ticket.update({ dataWebhook: webhookData });
        return;
      }
    }
  } else if (webhookData.pendingSocialPost) {
    console.log(`[handleOpenAi] Processing pendingSocialPost. Input: ${textNorm}`);
    const wantsFb = textNorm.includes("facebook");
    const wantsIg = textNorm.includes("instagram");
    const wantsAll =
      /^(s|sim|ok|posta|postar|manda)$/i.test(textNorm) ||
      textNorm.includes("ambas") ||
      textNorm.includes("tudo");

    if (wantsFb || wantsIg || wantsAll) {
      try {
        const pages = await getConnectedPages(ticket.companyId);
        if (pages.length === 0) {
          const sent = await wbot.sendMessage(msg.key.remoteJid!, {
            text: "(Erro: Nenhuma página conectada.)"
          });
          await verifyMessage(sent!, ticket, contact);
        } else {
          const page = pages[0];
          if (wantsFb || wantsAll) {
            if (webhookData.pendingSocialPost.video) {
              await publishVideoToFacebook(
                ticket.companyId,
                page.id,
                webhookData.pendingSocialPost.video,
                webhookData.pendingSocialPost.message
              );
            } else {
              await publishToFacebook(
                ticket.companyId,
                page.id,
                webhookData.pendingSocialPost.message,
                webhookData.pendingSocialPost.image || undefined
              );
            }
          }
          if (wantsIg || wantsAll) {
            const withInsta = pages.find(
              p => p.instagram_business_account && p.instagram_business_account.id
            );
            if (withInsta) {
              if (webhookData.pendingSocialPost.video) {
                await publishVideoToInstagram(
                  ticket.companyId,
                  withInsta.instagram_business_account.id,
                  webhookData.pendingSocialPost.video,
                  webhookData.pendingSocialPost.message
                );
              } else if (webhookData.pendingSocialPost.image) {
                await publishToInstagram(
                  ticket.companyId,
                  withInsta.instagram_business_account.id,
                  webhookData.pendingSocialPost.image,
                  webhookData.pendingSocialPost.message
                );
              }
            } else {
              const sent = await wbot.sendMessage(msg.key.remoteJid!, {
                text: "(Erro: Nenhuma conta de Instagram conectada.)"
              });
              await verifyMessage(sent!, ticket, contact);
            }
          }
          const done = await wbot.sendMessage(msg.key.remoteJid!, {
            text: "✅ Publicação concluída nas redes selecionadas."
          });
          await verifyMessage(done!, ticket, contact);
        }
      } catch (e) {
        const err = await wbot.sendMessage(msg.key.remoteJid!, {
          text: "❌ Erro ao publicar nas redes sociais."
        });
        await verifyMessage(err!, ticket, contact);
      }
      delete webhookData.pendingSocialPost;
      await ticket.update({ dataWebhook: webhookData });
      return;
    }
  } else {
    const wantsCheap =
      textNorm.includes("mais barato") ||
      (textNorm.includes("barato") && textNorm.includes("mais"));
    const wantsLink =
      textNorm.includes("link") || textNorm.includes("url") || textNorm.includes("acesso");
    const mentionsCatalog =
      textNorm.includes("catalogo") ||
      textNorm.includes("catálogo") ||
      textNorm.includes("pacote") ||
      textNorm.includes("produto");

    if (wantsCheap && wantsLink && mentionsCatalog) {
      try {
        const ownerJid = wbot.user?.id;
        if (!ownerJid || !msg.key.remoteJid) throw new Error("whatsapp session not ready");
        const catalog = await getCatalog(wbot, ownerJid);
        let cheapest: any = null;
        catalog?.forEach((p: any) => {
          const price = p.price || p.amount || 0;
          if (!cheapest || price < (cheapest.price || cheapest.amount || 0)) cheapest = p;
        });
        if (cheapest) {
          const phoneNumber = ownerJid.split(":")[0].split("@")[0];
          const link =
            cheapest.url || `https://wa.me/p/${cheapest.id}/${phoneNumber}`;
          const sent = await wbot.sendMessage(msg.key.remoteJid, { text: link });
          await verifyMessage(sent!, ticket, contact);
          return;
        }
      } catch (e) {}
    }
  }

  let aiClient: OpenAI | GoogleGenerativeAI | any;
  // Resolver chave da plataforma quando não informada
  const effectiveApiKey = await resolveApiKey(provider, openAiSettings.apiKey);

  if (!effectiveApiKey) {
     console.error(`[OpenAiService] Error: No API Key found for provider ${provider}`);
     throw new Error(`Chave API não configurada globalmente para ${provider}. Verifique as Configurações.`);
  }
  
  if (provider === "gemini") {
    // Configurar Gemini
    aiClient = new GoogleGenerativeAI(effectiveApiKey);
  } else if (provider === "openrouter") {
    // Configurar OpenRouter
    aiClient = new OpenAI({
      apiKey: effectiveApiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.FRONTEND_URL || "https://aipensa.com", 
        "X-Title": "AIPENSA.COM"
      }
    });
  } else if (provider === "external") {
    console.log("Using External Provider for Ticket:", ticket.id);
  } else {
    // Configurar OpenAI (padrão)
    aiClient = new OpenAI({
      apiKey: effectiveApiKey
    });
  }

  const messages = await Message.findAll({
    where: { ticketId: ticket.id },
    order: [["createdAt", "ASC"]],
    limit: openAiSettings.maxMessages
  });

  // Fetch Catalog for Context (Simplified)
  let catalogContext = "";
  try {
    const ownerJid = wbot.user?.id;
    if (ownerJid) {
      const products = await getCatalog(wbot, ownerJid);
      if (products && products.length > 0) {
        const phoneNumber = ownerJid.split("@")[0].split(":")[0].replace(/\D/g, "");
        const catalogLink = `https://wa.me/c/${phoneNumber}`;
        catalogContext = `\n\n🛍️ LINK GERAL DO CATÁLOGO: ${catalogLink}\n`;
        catalogContext += "🛍️ CATÁLOGO DE PRODUTOS DISPONÍVEIS:\n";
        products.forEach(p => {
          const price = (p.price / 1000).toLocaleString("pt-BR", {
            style: "currency",
            currency: p.currency || "BRL"
          });
          const productLink = p.url || `https://wa.me/p/${p.id}/${phoneNumber}`;
          catalogContext += `- ID: ${p.id} | ${p.name} | ${price}\n  Link: ${productLink}\n`;
          if (p.image) catalogContext += `  Img: ${p.image}\n`;
          if (p.description) catalogContext += `  Desc: ${p.description.substring(0, 100)}${p.description.length > 100 ? "..." : ""}\n`;
        });
        catalogContext += "\nINSTRUÇÕES DE VENDA:\n- Priorize recomendar produtos específicos.\n- Use [SEND_PRODUCT: ID] para enviar cartões.\n- Só envie link geral se pedido.\n";
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
  [MARKETING] { "action": "get_insights", "period": "last_7d" } [/MARKETING]
  [MARKETING] { "action": "get_campaigns", "status": "ACTIVE" } [/MARKETING]
  
  CAPACIDADES DE MÍDIA SOCIAL (SUPERAGENT):
  [POST_FEED] { "platform": "facebook", "message": "Texto", "image": "URL" } [/POST_FEED]
  [POST_VIDEO] { "platform": "facebook", "caption": "Legenda" } [/POST_VIDEO]
  
  STATUS WHATSAPP:
  [POST_STATUS] { "caption": "Legenda", "media": "image|video", "source": "chat|files", "file": "nome.ext" } [/POST_STATUS]

  CAPACIDADES DE PAGAMENTO (SUPERAGENT):
  [SEND_PIX] { "key": "chave", "amount": 199.9, ... } [/SEND_PIX]

  CAPACIDADES DE UPGRADE (SUPERAGENT):
  [UPGRADE_PLAN] { "type": "posts" } [/UPGRADE_PLAN]

  CAPACIDADES DE LINK (SUPERAGENT):
  [SEND_LINK] https://seu-site.com [/SEND_LINK]
  (IMPORTANTE: Ao usar esta tag, adicione sempre uma confirmação verbal amigável no final da resposta, por exemplo: "Aqui está o link que você pediu.")

  IMAGE GENERATION (DALL-E):
  IMPORTANTE: Se o usuário pedir para criar, gerar, desenhar ou fazer uma imagem, você DEVE responder APENAS com esta tag (sem texto adicional antes ou depois se não for necessário).
  [GENERATE_IMAGE] { "prompt": "descrição detalhada da imagem em inglês", "size": "1024x1024" } [/GENERATE_IMAGE]
  
  ${catalogContext}
  
  ${openAiSettings.prompt}\n`;

  let messagesOpenAi = [];
  let inputContent = bodyMessage;
  let transcriptionText = "";

  // 1. Process Input (Text or Audio)
  if (msg.message?.audioMessage) {
    console.log(`Processing audio message with ${provider}`);
    let mediaUrl: string | undefined = mediaSent?.mediaUrl
      ? mediaSent.mediaUrl.split("/").pop()
      : undefined;

    // Fallback lookups for mediaUrl...
    if (!mediaUrl) {
      try {
        const msgRecord = await Message.findOne({ where: { wid: msg.key.id, ticketId: ticket.id } });
        mediaUrl = msgRecord?.mediaUrl?.split("/").pop();
      } catch (e) {}
    }
    if (!mediaUrl) {
      try {
        const lastAudio = await Message.findOne({ where: { ticketId: ticket.id, mediaType: "audio" }, order: [["createdAt", "DESC"]] });
        mediaUrl = lastAudio?.mediaUrl?.split("/").pop();
      } catch (e) {}
    }

    if (!mediaUrl) {
      await wbot.sendMessage(msg.key.remoteJid!, { text: "Desculpe, não consegui localizar o áudio." });
      return;
    }

    const file = fs.createReadStream(`${publicFolder}/${mediaUrl}`) as any;

    try {
      const transcriptionApiKey = await (async () => {
        const voiceKey = (openAiSettings.voiceKey || "").trim();
        if (voiceKey !== "") return voiceKey;
        const openaiKey = await resolveApiKey("openai");
        if (openaiKey) return openaiKey;
        const base = await resolveApiKey(provider, openAiSettings.apiKey);
        if ((openAiSettings.voiceRegion || "").toLowerCase() === "azure") return process.env.AZURE_SPEECH_KEY || base;
        return base;
      })();

      const transcriptionClient = new OpenAI({ apiKey: transcriptionApiKey });
      const transcription = await transcriptionClient.audio.transcriptions.create({
        model: "whisper-1",
        file: file
      });
      transcriptionText = transcription.text;
      inputContent = transcriptionText;
    } catch (error) {
      console.error(`Error transcribing audio:`, error);
      await wbot.sendMessage(msg.key.remoteJid!, { text: "Desculpe, não consegui transcrever o áudio." });
      return;
    }
  }

  // 2. Build History
  messagesOpenAi.push({ role: "system", content: promptSystem });

  for (let i = 0; i < Math.min(openAiSettings.maxMessages, messages.length); i++) {
    const message = messages[i];
    if (message.mediaType === "conversation" || message.mediaType === "extendedTextMessage") {
      if (message.fromMe) {
        messagesOpenAi.push({ role: "assistant", content: message.body });
      } else {
        messagesOpenAi.push({ role: "user", content: message.body });
      }
    }
  }

  // 3. Add Current Message (Text/Audio/Image)
  if (msg.message?.imageMessage) {
      const mediaUrl = mediaSent!.mediaUrl!.split("/").pop();
      const filePath = `${publicFolder}/${mediaUrl}`;
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = msg.message.imageMessage.mimetype || "image/jpeg";

      // Helper to check if model supports vision
      const isVision = (m?: string) => {
        if (!m) return false;
        const lower = m.toLowerCase();
        return lower.includes("vision") || 
               lower.includes("gemini") || 
               lower.includes("claude-3") || 
               lower.includes("gpt-4o") || 
               lower.includes("gpt-4-turbo") ||
               lower.includes("llama-3.2") ||
               lower.includes("vl") || // Vision Language
               lower.includes("flash-image"); // Gemini Flash Image
      };

      if (openAiSettings.provider === "openrouter") {
           // Ensure we use a vision-capable model if the current one is likely text-only
           if (!openAiSettings.model || !isVision(openAiSettings.model) || openAiSettings.model === "openrouter/free") {
                console.log(`[handleOpenAi] Model '${openAiSettings.model}' may not support vision. Switching to requested vision model.`);
                // Fallback to a reliable vision model on OpenRouter (using Paid model as requested)
                openAiSettings.model = "google/gemini-2.0-flash-lite-preview-02-05:free"; // Atualizado para modelo funcional
           }
      } else {
        // Se tem crédito, tentar o modelo mais robusto de visão
         if (!openAiSettings.model || !isVision(openAiSettings.model)) {
             openAiSettings.model = "gpt-4o"; // Fallback padrão OpenAI
         }
      }
      
      messagesOpenAi.push({
        role: "user",
        content: [
          { type: "text", text: inputContent || "Analise esta imagem." },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
        ]
      });
  } else {
    // If OpenRouter and default model, switch to cheap/free model
    if (openAiSettings.provider === "openrouter" && (!openAiSettings.model || openAiSettings.model === "gpt-3.5-turbo")) {
        openAiSettings.model = "openrouter/free";
    }
    messagesOpenAi.push({ role: "user", content: inputContent! });
  }

  // 4. Call AI & Process Response
  try {
    let response: string | undefined;

    if (provider === "gemini") {
      response = await callGemini(aiClient, messagesOpenAi, openAiSettings);
    } else if (provider === "external") {
      const integrationUrl = openAiSettings.model || "https://api.direitai.com/v1/agent/chat";
      const payload = {
        remoteJid: msg.key.remoteJid,
        pushName: contact.name,
        message: inputContent,
        ticketId: ticket.id,
        integrationId: openAiSettings.apiKey,
        history: messagesOpenAi
      };
      const { data } = await axios.post(integrationUrl, payload);
      response = data.response || data.message;
      if (data.action === "transfer") {
        response = `Ação: Transferir para o setor de atendimento ${response ? "\n" + response : ""}`;
      }
    } else {
      response = await callOpenAI(aiClient, messagesOpenAi, openAiSettings);
    }

    // Sanitize Response (remove <think> tags, etc.)
    if (response) {
        response = sanitizeResponse(response);
    }

    if (response?.includes("Ação: Transferir para o setor de atendimento")) {
      await transferQueue(openAiSettings.queueId, ticket, contact);
      response = response.replace("Ação: Transferir para o setor de atendimento", "").trim();
    }

    // Process Actions (Shared Logic)
    if (response) {
      response = await processAiActions(response, ticket, contact, wbot, msg, openAiSettings);
    }

    // 5. Send Response (Text or Audio)
    if (response) {
      if (msg.message?.audioMessage) {
        // TTS Logic for Audio Response
        const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
        try {
          const voiceKeyResolved = await (async () => {
            const vKey = (openAiSettings.voiceKey || "").trim();
            if (vKey !== "") return vKey;
            const base = await resolveApiKey(provider, openAiSettings.apiKey);
            if ((openAiSettings.voiceRegion || "").toLowerCase() === "azure") return process.env.AZURE_SPEECH_KEY || base;
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
          await verifyMediaMessage(sendMessage!, ticket, contact, ticketTraking, false, false, wbot);
          deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.mp3`);
          deleteFileSync(`${publicFolder}/${fileNameWithOutExtension}.wav`);
        } catch (error) {
          // Fallback to text if TTS fails
          const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, { text: `\u200e ${response!}` });
          await verifyMessage(sentMessage!, ticket, contact);
        }
      } else {
        // Send Text Response
        const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, { text: `\u200e ${response!}` });
        await verifyMessage(sentMessage!, ticket, contact);
      }
    }

  } catch (error) {
    console.error(`Error calling ${provider}:`, error);
    await wbot.sendMessage(msg.key.remoteJid!, {
      text: `Desculpe, ocorreu um erro temporário: ${error.message || "Erro desconhecido"}. Tente novamente em alguns instantes.`
    });
  }
  messagesOpenAi = [];
};
