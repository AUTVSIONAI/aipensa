import { getIO } from "../../libs/socket";
import logger from "../../utils/logger";
import Message from "../../models/Message";

interface MessageData {
  contactId: number;
  body: string;
  ticketId: number;
  fromMe: boolean;
  companyId: number;
  fileName?: string;
  mediaType?: string;
  originalName?: string;
  ack?: number;
}

const CreateMessageService = async (
  messageData: MessageData
): Promise<Message> => {
  const {
    contactId,
    body,
    ticketId,
    fromMe,
    companyId,
    fileName,
    mediaType,
    originalName,
    ack
  } = messageData;

  if ((!body || body === "") && (!fileName || fileName === "")) {
    return;
  }

  const data: any = {
    contactId,
    body,
    ticketId,
    fromMe,
    companyId,
    ack
  };

  if (fileName) {
    data.mediaUrl = fileName;
    data.mediaType = mediaType === "photo" ? "image" : mediaType;
    data.body = data.mediaUrl;
  }

  try {
    logger.info("CreateMessageService: creating message");
    const newMessage = await Message.create(data);
    logger.info(`CreateMessageService: message created id=${newMessage.id}`);
    await newMessage.reload({
      include: [
        {
          association: "ticket",
          include: [
            {
              association: "contact"
            },
            {
              association: "user"
            },
            {
              association: "queue"
            },
            {
              association: "tags"
            },
            {
              association: "whatsapp"
            }
          ]
        }
      ]
    });

    const io = getIO();

    io.of(String(companyId)).emit(`company-${companyId}-appMessage`, {
      action: "create",
      message: newMessage,
      ticket: newMessage.ticket,
      contact: newMessage.ticket.contact
    });

    return newMessage;
  } catch (error) {
    console.log(error);
  }
};

export default CreateMessageService;
