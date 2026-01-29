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
    const number = ticket.contact.number;
    await sendText(number, message, connection.facebookUserToken);
    return res.json({ ok: true });
  } catch (error: any) {
    return res.status(400).json({ error: error?.message });
  }
};
