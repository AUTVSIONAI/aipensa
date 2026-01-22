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

  const promptSystem = `Nas respostas utilize o nome ${sanitizeName(
    contact.name || "Amigo(a)"
  )} para identificar o cliente.\nSua resposta deve usar no máximo ${
    openAiSettings.maxTokens
  } tokens e cuide para não truncar o final.\nSempre que possível, mencione o nome dele para ser mais personalizado o atendimento e mais educado. Quando a resposta requer uma transferência para o setor de atendimento, comece sua resposta com 'Ação: Transferir para o setor de atendimento'.\n
                ${openAiSettings.prompt}\n`;

  let messagesOpenAi = [];

  if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
    console.log(`Processing text message with ${provider}`);
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
    messagesOpenAi.push({ role: "user", content: bodyMessage! });

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

      if (openAiSettings.voice === "texto") {
        console.log(`Sending text response via ${provider}`);
        const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          text: `\u200e ${response!}`
        });
        await verifyMessage(sentMessage!, ticket, contact);
      } else {
        console.log(`Sending voice response via ${provider}`);
        const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
        convertTextToSpeechAndSaveToFile(
          keepOnlySpecifiedChars(response!),
          `${publicFolder}/${fileNameWithOutExtension}`,
          openAiSettings.voiceKey,
          openAiSettings.voiceRegion,
          openAiSettings.voice,
          "mp3"
        ).then(async () => {
          try {
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
            console.log(`Erro para responder com audio: ${error}`);
          }
        });
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
    const mediaUrl = mediaSent!.mediaUrl!.split("/").pop();
    const file = fs.createReadStream(`${publicFolder}/${mediaUrl}`) as any;

    let transcriptionText: string;

    try {
      let transcriptionClient = aiClient;
      
      // Check if we should use a separate key/provider for transcription (via Voice settings)
      if (openAiSettings.voiceRegion === "openrouter" || openAiSettings.voiceRegion === "openai") {
        const baseUrl = openAiSettings.voiceRegion === "openrouter" 
          ? "https://openrouter.ai/api/v1" 
          : undefined;
          
        console.log(`Using ${openAiSettings.voiceRegion} for transcription with voiceKey`);
        transcriptionClient = new OpenAI({
          apiKey: openAiSettings.voiceKey,
          baseURL: baseUrl
        });
      } else if (provider === "gemini") {
        // Fallback for Gemini: try to use the main API key as OpenAI key (legacy behavior)
        // or if voiceKey is set, it would have been caught above if voiceRegion was set.
        console.log("Using fallback OpenAI for Gemini transcription");
        transcriptionClient = new OpenAI({ apiKey: openAiSettings.apiKey });
      }

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

      if (openAiSettings.voice === "texto") {
        const sentMessage = await wbot.sendMessage(msg.key.remoteJid!, {
          text: `\u200e ${response!}`
        });
        await verifyMessage(sentMessage!, ticket, contact);
      } else {
        const fileNameWithOutExtension = `${ticket.id}_${Date.now()}`;
        convertTextToSpeechAndSaveToFile(
          keepOnlySpecifiedChars(response!),
          `${publicFolder}/${fileNameWithOutExtension}`,
          openAiSettings.voiceKey,
          openAiSettings.voiceRegion,
          openAiSettings.voice,
          "mp3"
        ).then(async () => {
          try {
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
            console.log(`Erro para responder com audio: ${error}`);
          }
        });
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