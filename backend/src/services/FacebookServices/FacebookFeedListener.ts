import Whatsapp from "../../models/Whatsapp";
import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import { getProfile, sendText, replyComment } from "./graphAPI";
import OpenAI from "openai";
import { handleOpenAi } from "../IntegrationsServices/OpenAiService";
import Setting from "../../models/Setting";

interface IChange {
  field: string;
  value: any;
}

const verifyContact = async (
  msgContact: any,
  channel: string,
  companyId: number
): Promise<Contact> => {
  if (!msgContact) {
    return null;
  }

  const contactData = {
    name: msgContact.name || msgContact.username || "Unknown",
    number: msgContact.id,
    profilePicUrl: "",
    isGroup: false,
    companyId,
    channel,
    email: ""
  };

  const contact = await CreateOrUpdateContactService(contactData);
  return contact;
};

export const handleFacebookFeed = async (
  whatsapp: Whatsapp,
  change: IChange,
  channel: string,
  companyId: number
): Promise<void> => {
  try {
    const { field, value } = change;

    // Log para debug
    console.log(
      `[FacebookFeedListener] Evento recebido: ${field}`,
      JSON.stringify(value, null, 2)
    );

    // Emitir socket para atualização em tempo real do painel Marketing
    const io = getIO();
    io.of(String(companyId)).emit(`company-${companyId}-marketing-feed`, {
      action: "new-event",
      field,
      data: value
    });

    // Lógica para Comentários (Instagram/Facebook)
    if (field === "comments" || field === "feed") {
      // Estrutura do Instagram: value = { id, text, from: { id, username }, media: { id }, ... }
      // Estrutura do Facebook pode variar, mas geralmente tem item, verb, sender_id, message

      const commentId = value.id || value.comment_id;
      const messageText = value.text || value.message;
      const senderId = value.from?.id || value.sender_id;
      const senderName = value.from?.username || value.sender_name || "User";
      const mediaId = value.media?.id || value.post_id;
      const parentId = value.parent_id; // Se for resposta a outro comentário

      // Ignorar se for o próprio dono da página
      if (senderId === whatsapp.facebookPageUserId) {
        return;
      }

      console.log(
        `[FacebookFeedListener] Processando comentário de ${senderName}: ${messageText}`
      );

      // 1. Criar ou Atualizar Contato (Lead)
      const contact = await verifyContact(
        { id: senderId, name: senderName },
        channel,
        companyId
      );

      // 2. Gatilhos configuráveis de comentário para capturar leads
      // Buscar lista personalizada nas configurações da empresa, se existir
      let triggerWords = ["preço", "valor", "comprar", "eu quero", "info"];
      try {
        const setting = await Setting.findOne({
          where: { companyId, key: "marketingCommentTriggers" }
        });
        if (setting?.value) {
          const parsed = JSON.parse(setting.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            triggerWords = parsed.map((w: string) => String(w).toLowerCase());
          }
        }
      } catch (err) {
        console.error(
          "[FacebookFeedListener] Erro ao carregar gatilhos personalizados:",
          err
        );
      }

      const lowerMessage = messageText?.toLowerCase() || "";
      const hasTrigger = triggerWords.some(w => lowerMessage.includes(w));

      if (hasTrigger) {
        console.log(
          `[FacebookFeedListener] Gatilho detectado! Iniciando automação.`
        );

        let pdfLink: string | null = null;
        let pdfQuestion: string | null = null;

        try {
          const pdfLinkSetting = await Setting.findOne({
            where: { companyId, key: "marketingPdfLink" }
          });
          const pdfQuestionSetting = await Setting.findOne({
            where: { companyId, key: "marketingPdfQuestion" }
          });

          if (pdfLinkSetting?.value) {
            pdfLink = pdfLinkSetting.value;
          }
          if (pdfQuestionSetting?.value) {
            pdfQuestion = pdfQuestionSetting.value;
          }
        } catch (err) {
          console.error(
            "[FacebookFeedListener] Erro ao carregar configurações de PDF:",
            err
          );
        }

        // Ação 1: Responder o comentário (Público)
        await replyComment(
          commentId,
          `Olá @${senderName}! 👋 Enviei as informações no seu direct! 🚀`,
          whatsapp.facebookUserToken
        );

        // Ação 2: Enviar DM (Privado) -> Inicia Ticket
        // Verificar se já existe ticket aberto? Se não, abrir.
        const ticket = await FindOrCreateTicketService(
          contact,
          whatsapp,
          0,
          companyId
        );

        if (ticket) {
          await ticket.update({
            channel: channel || ticket.channel
          });

          let dmText = `Olá ${senderName}! Vi seu comentário no seu interesse: "${messageText}". Vou te atender aqui no direct para continuar a conversa. 😊`;

          if (pdfLink && pdfQuestion) {
            dmText += `\n\n${pdfQuestion}\n${pdfLink}`;
          } else if (pdfLink) {
            dmText += `\n\nPosso te enviar um PDF rápido com detalhes e valores?\n${pdfLink}`;
          }

          await sendText(contact.number, dmText, whatsapp.facebookUserToken);
        }
      }
    }
  } catch (error) {
    console.error("[FacebookFeedListener] Error:", error);
  }
};
