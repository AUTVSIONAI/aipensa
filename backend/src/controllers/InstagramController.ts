import { Request, Response } from "express";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import Whatsapp from "../models/Whatsapp";
import { sendText } from "../services/FacebookServices/graphAPI";

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { ticketId, message } = req.body || {};
    const { companyId } = (req as any).user;
    
    console.log(`[InstagramController] Sending DM for ticket ${ticketId}`);

    const ticket = await ShowTicketService(Number(ticketId), companyId);
    if (!ticket) {
      return res.status(404).json({ error: "ticket_not_found" });
    }
    const connection = await Whatsapp.findOne({
      where: { id: ticket.whatsappId, companyId }
    });
    if (!connection) {
      return res.status(404).json({ error: "connection_not_found" });
    }
    
    // Ensure we have a token
    const token = connection.facebookUserToken || connection.tokenMeta;
    if (!token) {
      return res.status(400).json({ error: "token_not_found" });
    }

    const number = ticket.contact.number;
    console.log(`[InstagramController] Sending to ${number} via connection ${connection.name}`);
    
    await sendText(number, message, token);
    return res.json({ ok: true });
  } catch (error: any) {
    console.error("[InstagramController] Error:", error);
    return res.status(400).json({ error: error?.message });
  }
};
