import {
  WAMessage,
  AnyMessageContent,
  WAPresence
} from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import fs from "fs";
import { exec } from "child_process";
import path from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import AppError from "../../errors/AppError";
import logger from "../../utils/logger";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import mime from "mime-types";
import Contact from "../../models/Contact";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

interface RequestFlow {
  media: string;
  ticket: Ticket;
  body?: string;
  isFlow?: boolean;
  isRecord?: boolean;
}

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const processAudio = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.ogg`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i "${audio}" -c:a libopus -b:a 32k -ar 48000 -ac 1 "${outputAudio}" -y`,
      (error, _stdout, _stderr) => {
        if (error) {
          console.error("Erro no processamento de áudio PTT:", error);
          reject(error);
        } else {
          console.log("Áudio PTT processado com sucesso:", outputAudio);
          resolve(outputAudio);
        }
      }
    );
  });
};

const processAudioFile = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.m4a`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i "${audio}" -c:a aac -b:a 128k -ar 44100 -ac 2 -f mp4 "${outputAudio}" -y`,
      (error, _stdout, _stderr) => {
        if (error) {
          console.error("Erro no processamento de arquivo de áudio:", error);
          reject(error);
        } else {
          console.log("Arquivo de áudio processado com sucesso:", outputAudio);
          resolve(outputAudio);
        }
      }
    );
  });
};

const nameFileDiscovery = (pathMedia: string) => {
  const spliting = pathMedia.split("/");
  const first = spliting[spliting.length - 1];
  return first.split(".")[0];
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const typeSimulation = async (ticket: Ticket, presence: WAPresence) => {
  const wbot = await GetTicketWbot(ticket);

  let contact = await Contact.findOne({
    where: {
      id: ticket.contactId
    }
  });

  await wbot.sendPresenceUpdate(
    presence,
    `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
  );
  await delay(5000);
  await wbot.sendPresenceUpdate(
    "paused",
    `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`
  );
};

// Função para detectar se é vídeo baseado na extensão
const isVideoFile = (filePath: string): boolean => {
  const videoExtensions = [
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".mkv",
    ".m4v"
  ];
  const ext = path.extname(filePath).toLowerCase();
  return videoExtensions.includes(ext);
};

const SendWhatsAppMediaFlow = async ({
  media,
  ticket,
  body,
  isFlow = false,
  isRecord = false
}: RequestFlow): Promise<WAMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);

    const mimetype = String(mime.lookup(media));
    const pathMedia = media;

    let typeMessage = mimetype.split("/")[0];
    const mediaName = nameFileDiscovery(media);

    // CORREÇÃO: Se o mime-types detectou como 'application' mas o arquivo é vídeo, corrigir
    if (typeMessage === "application" && isVideoFile(media)) {
      typeMessage = "video";
      logger.info("FlowBuilder: file reclassified as video based on extension");
    }

    let options: AnyMessageContent;

    if (typeMessage === "video") {
      logger.info("FlowBuilder: sending video");
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body,
        fileName: mediaName
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      logger.info("FlowBuilder: sending audio");
      if (isRecord) {
        const convert = await processAudio(pathMedia);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/ogg; codecs=opus",
          ptt: true
        };
        // Limpar arquivo temporário após uso
        fs.unlinkSync(convert);
      } else {
        const convert = await processAudioFile(pathMedia);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/mp4", // Para arquivos M4A
          ptt: false
        };
        // Limpar arquivo temporário após uso
        fs.unlinkSync(convert);
      }
    } else if (typeMessage === "document" || typeMessage === "text") {
      logger.info("FlowBuilder: sending document");
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body,
        fileName: mediaName,
        mimetype: mimetype
      };
    } else if (typeMessage === "application") {
      logger.info("FlowBuilder: sending application file");
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body,
        fileName: mediaName,
        mimetype: mimetype
      };
    } else {
      logger.info("FlowBuilder: sending image");
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body
      };
    }

    let contact = await Contact.findOne({
      where: {
        id: ticket.contactId
      }
    });

    logger.info("FlowBuilder: sending media message");

    const sentMessage = await wbot.sendMessage(
      `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        ...options
      }
    );

    await ticket.update({ lastMessage: mediaName });

    return sentMessage;
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err, "ERR_SENDING_WAPP_MSG");
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMediaFlow;
