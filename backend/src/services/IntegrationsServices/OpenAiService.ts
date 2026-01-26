import { MessageUpsertType, proto, WASocket } from "@whiskeysockets/baileys";
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
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import TicketTraking from "../../models/TicketTraking";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import Whatsapp from "../../models/Whatsapp";
import CreateScheduleService from "../ScheduleServices/CreateService";
import { zonedTimeToUtc } from "date-fns-tz";
import Tag from "../../models/Tag";

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



interface IOpenAi {
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
  const model = openAiSettings.model || "gpt-3.5-turbo";
  console.log(`[callOpenAI] Calling with model: ${model}`);

  
  const chat = await openai.chat.completions.create({
    model: model,
    messages: messagesOpenAi,
    max_tokens: openAiSettings.maxTokens,
    temperature: openAiSettings.temperature
  });

  return chat.choices[0].message?.content;
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
  const conversationMessages = messagesOpenAi.filter(msg => msg.role !== "system");
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

import { getMarketingInsights, getMarketingCampaigns } from "../MarketingServices/MarketingToolService";
import { getCatalog, getProductById, sendProduct } from "../WbotServices/CatalogService";
import { getConnectedPages, publishToFacebook, publishToInstagram } from "../FacebookServices/SocialMediaService";

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
        console.log(`[OpenAiService] Sending product ${productId} to ${msg.key.remoteJid}`);
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
      if (!await verifyAdminPermission(contact)) {
        return response.replace(match[0], "").trim() + "\n\n⛔ *Acesso Negado*: Esta ação requer permissão de administrador (Tag: ADMIN).";
      }

      const jsonContent = match[1].trim();
      console.log("[OpenAiService] Marketing JSON Content:", jsonContent);
      
      const actionData = JSON.parse(jsonContent);
      const { action, period, status } = actionData;
      
      let result = "";

      if (action === "get_insights") {
        const insights = await getMarketingInsights(ticket.companyId, period || "last_7d");
        
        // Formatar insights para texto amigável
        const data = insights.data[0];
        if (data) {
          result = `📊 *Resumo de Insights (${period || "Últimos 7 dias"})*\n\n` +
                   `👁️ Impressões: ${data.impressions}\n` +
                   `👥 Alcance: ${data.reach}\n` +
                   `👆 Cliques: ${data.clicks}\n` +
                   `💰 Gasto: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.spend)}\n` +
                   `📉 CPM: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.cpm)}\n` +
                   `🖱️ CTR: ${parseFloat(data.ctr).toFixed(2)}%`;
        } else {
          result = "Não encontrei dados de insights para este período.";
        }
      } else if (action === "get_campaigns") {
        const campaigns = await getMarketingCampaigns(ticket.companyId, status || "ACTIVE");
        
        if (campaigns.data && campaigns.data.length > 0) {
          result = `📢 *Campanhas Ativas*\n\n`;
          campaigns.data.forEach((camp: any) => {
             result += `🔹 *${camp.name}*\n` +
                       `   Status: ${camp.status}\n` +
                       `   Objetivo: ${camp.objective}\n` +
                       `   Orçamento: ${camp.daily_budget ? `Diário: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(camp.daily_budget/100)}` : `Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(camp.lifetime_budget/100)}`}\n\n`;
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
      return response.replace(match[0], "").trim() + "\n\n(Erro ao processar solicitação de marketing)";
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
            const parsedDate = zonedTimeToUtc(sendAt, 'America/Sao_Paulo');
            
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
      if (!await verifyAdminPermission(contact)) {
        return response.replace(match[0], "").trim() + "\n\n⛔ *Acesso Negado*: Esta ação requer permissão de administrador (Tag: ADMIN).";
      }

      const jsonContent = match[1].trim();
      console.log("[OpenAiService] Social Media JSON:", jsonContent);
      
      const postData = JSON.parse(jsonContent);
      const { platform, message, image } = postData;
      
      if (!platform || !message) {
        return response.replace(match[0], "").trim() + "\n\n(Erro: Plataforma ou mensagem ausente para postagem)";
      }

      // Get pages to find ID
      const pages = await getConnectedPages(ticket.companyId);
      if (pages.length === 0) {
        return response.replace(match[0], "").trim() + "\n\n(Erro: Nenhuma página/conta conectada encontrada)";
      }

      let result = "";

      if (platform === "facebook") {
        // Use first page
        const page = pages[0];
        await publishToFacebook(ticket.companyId, page.id, message, image);
        result = `Postado com sucesso no Facebook da página ${page.name}!`;
      } else if (platform === "instagram") {
        // Find page with instagram_business_account
        const pageWithInsta = pages.find(p => p.instagram_business_account);
        if (!pageWithInsta) {
           return response.replace(match[0], "").trim() + "\n\n(Erro: Nenhuma conta de Instagram conectada à página)";
        }
        if (!image) {
           return response.replace(match[0], "").trim() + "\n\n(Erro: Imagem é obrigatória para Instagram)";
        }
        await publishToInstagram(ticket.companyId, pageWithInsta.instagram_business_account.id, image, message);
        result = `Postado com sucesso no Instagram @${pageWithInsta.instagram_business_account.username}!`;
      } else {
        result = "(Erro: Plataforma desconhecida)";
      }

      return response.replace(match[0], "").trim() + "\n\n✅ " + result;

    } catch (e) {
      console.error("Erro ao postar em social media via AI:", e);
      return response.replace(match[0], "").trim() + "\n\n❌ Erro ao realizar postagem: " + e.message;
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
  // REGRA PARA DESABILITAR O BOT PARA ALGUM CONTATO
  if (contact.disableBot) {
    return;
  }

  const bodyMessage = getBodyMessage(msg);
  if (!bodyMessage) return;

  if (!openAiSettings) return;
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

  if (provider === "gemini") {
    // Configurar Gemini
    console.log("Initializing Gemini Service", openAiSettings.apiKey?.substring(0, 10) + "...");
    aiClient = new GoogleGenerativeAI(openAiSettings.apiKey);
  } else if (provider === "openrouter") {
      // Configurar OpenRouter
      console.log("Initializing OpenRouter Service", openAiSettings.apiKey?.substring(0, 10) + "...");
      aiClient = new OpenAI({
        apiKey: openAiSettings.apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": process.env.FRONTEND_URL || "https://aipensa.com", // Optional, for including your app on openrouter.ai rankings.
          "X-Title": "AIPENSA.COM", // Optional. Shows in rankings on openrouter.ai.
        }
      });
    } else if (provider === "external") {
      // Configurar Integração Externa (DireitaI / Outros)
      // Não precisa inicializar cliente, usaremos axios diretamente
      console.log("Using External Provider for Ticket:", ticket.id);
    } else {
      // Configurar OpenAI (padrão)
      console.log("Initializing OpenAI Service", openAiSettings.apiKey?.substring(0, 10) + "...");
      aiClient = new OpenAI({
        apiKey: openAiSettings.apiKey
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
      const products = await getCatalog(wbot, ownerJid);
      if (products && products.length > 0) {
        catalogContext = "\n\n🛍️ CATÁLOGO DE PRODUTOS DISPONÍVEIS:\n";
        products.forEach(p => {
            const price = (p.price / 1000).toLocaleString('pt-BR', { style: 'currency', currency: p.currency || 'BRL' });
            catalogContext += `- ID: ${p.id} | ${p.name} | ${price}\n`;
            if (p.description) catalogContext += `  Desc: ${p.description.substring(0, 100)}${p.description.length > 100 ? '...' : ''}\n`;
        });
        catalogContext += "\nINSTRUÇÕES DE VENDA:\n" +
                          "- Se o cliente demonstrar interesse em um produto específico, você pode enviar o cartão do produto.\n" +
                          "- Para enviar o cartão, use a tag [SEND_PRODUCT: ID_DO_PRODUTO] no final da sua resposta.\n" +
                          "- Exemplo: 'Aqui está o nosso hambúrguer especial! [SEND_PRODUCT: 12345]'\n" + 
                          "- Não invente produtos que não estejam nesta lista.\n";
      }
    }
  } catch (e) {
    console.error("[OpenAiService] Error fetching catalog:", e);
  }

  const promptSystem = `Nas respostas utilize o nome ${sanitizeName(
    contact.name || "Amigo(a)"
  )} para identificar o cliente.\nData e Hora atual: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}\nSua resposta deve usar no máximo ${
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
  - Para publicar: Use a tag [POST_FEED] { "platform": "facebook", "message": "Texto do post", "image": "URL_da_imagem" } [/POST_FEED]
  - Plataformas: "facebook" ou "instagram".
  - Se o usuário pedir para postar um produto do catálogo, pegue a URL da imagem do produto e a descrição, e use esta tag.
  - Imagem é OBRIGATÓRIA para Instagram. Opcional para Facebook.

  NÃO invente dados. Se o usuário perguntar sobre campanhas ou desempenho, use essas tags e aguarde a resposta do sistema.

  ${catalogContext}

  ${openAiSettings.prompt}\n`;

  let messagesOpenAi = [];

  if (msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage) {
    console.log(`Processing text/image message with ${provider}`);
    messagesOpenAi = [];
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

    if (msg.message?.imageMessage) {
       const mediaUrl = mediaSent!.mediaUrl!.split("/").pop();
       const filePath = `${publicFolder}/${mediaUrl}`;
       const imageBuffer = fs.readFileSync(filePath);
       const base64Image = imageBuffer.toString('base64');
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
        const integrationUrl = openAiSettings.model || "https://api.direitai.com/v1/agent/chat";
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
           response = `Ação: Transferir para o setor de atendimento ${response ? '\n' + response : ''}`;
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
      // Fallback: enviar mensagem de erro
      await wbot.sendMessage(msg.key.remoteJid!, {
        text: "Desculpe, ocorreu um erro temporário. Tente novamente em alguns instantes."
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
      const transcriptionApiKey =
        openAiSettings.voiceKey && openAiSettings.voiceKey.trim() !== ""
          ? openAiSettings.voiceKey
          : openAiSettings.apiKey;

      const transcriptionClient = new OpenAI({
        apiKey: transcriptionApiKey
      });

      const transcription = await transcriptionClient.audio.transcriptions.create({
        model: "whisper-1",
        file: file
      });
      transcriptionText = transcription.text;

      messagesOpenAi = [];
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
      messagesOpenAi.push({ role: "user", content: transcriptionText });

      let response: string | undefined;

      // Chamar o provedor correto para resposta
      if (provider === "gemini") {
        response = await callGemini(aiClient, messagesOpenAi, openAiSettings);
      } else if (provider === "external") {
        const integrationUrl = openAiSettings.model || "https://api.direitai.com/v1/agent/chat";
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
           response = `Ação: Transferir para o setor de atendimento ${response ? '\n' + response : ''}`;
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
        response = await handleScheduleAction(response, ticket, contact);
        response = await handleCatalogAction(response, wbot, msg);
      }
      const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
      try {
        await convertTextToSpeechAndSaveToFile(
          keepOnlySpecifiedChars(response!),
          `${publicFolder}/${fileNameWithOutExtension}`,
          openAiSettings.voiceKey,
          openAiSettings.voiceRegion,
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
