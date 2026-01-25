import Whatsapp from "../../models/Whatsapp";
import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import { getProfile, sendText, replyComment } from "./graphAPI";
import OpenAI from "openai";
import { handleOpenAi } from "../IntegrationsServices/OpenAiService";

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
    console.log(`[FacebookFeedListener] Evento recebido: ${field}`, JSON.stringify(value, null, 2));

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

        console.log(`[FacebookFeedListener] Processando comentário de ${senderName}: ${messageText}`);

        // 1. Criar ou Atualizar Contato (Lead)
        const contact = await verifyContact({ id: senderId, name: senderName }, channel, companyId);

        // 2. Integração "Superagent" (IA + Gatilhos)
        // Se houver uma integração de IA configurada para esta conexão (whatsapp.queues -> chatbot?)
        // Por enquanto, vamos simular uma verificação básica de "Gatilho"
        
        // Exemplo de Gatilho Simples: "preço", "valor", "comprar"
        const triggerWords = ["preço", "valor", "comprar", "eu quero", "info"];
        const lowerMessage = messageText?.toLowerCase() || "";
        
        const hasTrigger = triggerWords.some(w => lowerMessage.includes(w));

        if (hasTrigger) {
            console.log(`[FacebookFeedListener] Gatilho detectado! Iniciando automação.`);
            
            // Ação 1: Responder o comentário (Público)
            await replyComment(commentId, `Olá @${senderName}! 👋 Enviei as informações no seu direct! 🚀`, whatsapp.facebookUserToken);
            
            // Ação 2: Enviar DM (Privado) -> Inicia Ticket
            // Verificar se já existe ticket aberto? Se não, abrir.
            
            // @ts-ignore
            const ticket = await FindOrCreateTicketService(contact, whatsapp, 0, companyId);
            
            if (ticket) {
                // Enviar mensagem de boas vindas na DM
                await sendText(
                    contact.number, 
                    `Olá ${senderName}! Vi seu comentário sobre "${messageText}". Como posso ajudar com sua compra?`, 
                    whatsapp.facebookUserToken
                );
                
                // Se tiver IA configurada no Ticket/Fila, deixar a IA assumir a partir daqui
                // A IA será acionada quando o cliente responder a essa DM (via handleMessage padrão)
            }
        }
    }

  } catch (error) {
    console.error("[FacebookFeedListener] Error:", error);
  }
};
