import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";

import Company from "../models/Company";
import Invoices from "../models/Invoices";
import { getIO } from "../libs/socket";
import Setting from "../models/Setting";
import Stripe from "stripe";
import Plan from "../models/Plan";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import * as Sentry from "@sentry/node";
import logger from "../utils/logger";

export const index = async (req: Request, res: Response): Promise<Response> => {
  throw new AppError("Not implemented", 501);
};

export const createSubscription = async (
  req: Request,
  res: Response
): Promise<Response> => {
  let stripeURL;
  let key_STRIPE_PRIVATE = null;

  const buscacompanyId = req.user?.companyId ?? 1;

  const getSettingValue = async (
    key: string,
    companyId: number
  ): Promise<string | null> => {
    let setting = await Setting.findOne({ where: { companyId, key } });
    if (!setting && companyId !== 1) {
      setting = await Setting.findOne({ where: { companyId: 1, key } });
    }
    return setting?.value || null;
  };

  try {
    key_STRIPE_PRIVATE =
      (await getSettingValue("stripeprivatekey", buscacompanyId)) ||
      process.env.STRIPE_PRIVATE ||
      process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_API_KEY ||
      null;
  } catch (error) {
    logger.error("Error retrieving settings:", error);
  }

  const { companyId } = req.user;

  const schema = Yup.object().shape({
    price: Yup.mixed().required(),
    users: Yup.mixed().required(),
    connections: Yup.mixed().required()
  });

  const isValid = await schema.isValid(req.body);
  if (!isValid) {
    throw new AppError("Dados Incorretos - Contate o Suporte!", 400);
  }

  const {
    firstName,
    price,
    users,
    connections,
    address2,
    city,
    state,
    zipcode,
    country,
    plan,
    invoiceId
  } = req.body;

  let valorNumber: number;
  if (typeof price === "number") {
    valorNumber = price;
  } else {
    const priceStr = String(price);
    if (priceStr.includes(".") && !priceStr.includes(",")) {
      valorNumber = parseFloat(priceStr);
    } else {
      valorNumber = Number(priceStr.replace(/\./g, "").replace(",", "."));
    }
  }

  const valorext = valorNumber;

  if (key_STRIPE_PRIVATE) {
    try {
      const stripe = new Stripe(key_STRIPE_PRIVATE, {
        apiVersion: "2022-11-15"
      });

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const successUrl =
        process.env.STRIPE_OK_URL || `${frontendUrl}/financeiro`;
      const cancelUrl =
        process.env.STRIPE_CANCEL_URL || `${frontendUrl}/financeiro`;

      const sessionStripe = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: `#Fatura:${invoiceId}`
              },
              unit_amount: Math.round(Number(valorext) * 100)
            },
            quantity: 1
          }
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl
      });

      const invoicesX = await Invoices.findByPk(invoiceId);
      await invoicesX.update({
        id: invoiceId,
        stripe_id: sessionStripe.id
      });

      stripeURL = sessionStripe.url;
    } catch (error) {
      logger.error("Error creating Stripe session:", error);
    }
  }

  const updateCompany = await Company.findByPk(buscacompanyId);

  if (!updateCompany) {
    throw new AppError("Company not found", 404);
  }

  return res.json({
    valorext,
    stripeURL
  });
};

export const stripewebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let key_STRIPE_PRIVATE =
    process.env.STRIPE_PRIVATE ||
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_API_KEY ||
    null;

  if (!key_STRIPE_PRIVATE) {
    logger.error("Stripe private key not configured");
    return res.status(500).json({ error: "Payment not configured" });
  }

  const stripe = new Stripe(key_STRIPE_PRIVATE, {
    apiVersion: "2022-11-15"
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    logger.error(`Stripe webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const stripe_id = session.id;

    const invoices = await Invoices.findOne({
      where: { stripe_id }
    });

    if (!invoices) {
      logger.warn(`Stripe webhook: no invoice found for session ${stripe_id}`);
      return res.json({ ok: true });
    }

    const invoiceID = invoices.id;
    const companyId = invoices.companyId;
    const company = await Company.findByPk(companyId);

    if (!company) {
      logger.warn(`Stripe webhook: no company found for id ${companyId}`);
      return res.json({ ok: true });
    }

    let newDueDate = new Date(company.dueDate);
    const now = new Date();
    if (newDueDate < now) {
      newDueDate = now;
    }
    newDueDate.setDate(newDueDate.getDate() + 30);
    const date = newDueDate.toISOString().split("T")[0];

    await company.update({ dueDate: date });
    await invoices.update({
      id: invoiceID,
      status: "paid"
    });
    await company.reload();

    const io = getIO();
    const companyUpdate = await Company.findOne({
      where: { id: companyId }
    });

    try {
      const whatsapps = await ListWhatsAppsService({
        companyId
      });
      if (whatsapps.length > 0) {
        whatsapps.forEach(whatsapp => {
          StartWhatsAppSession(whatsapp, companyId);
        });
      }
    } catch (e) {
      Sentry.captureException(e);
    }

    io.emit(`company-${companyId}-payment`, {
      action: "CONCLUIDA",
      company: companyUpdate
    });
  }

  return res.json({ ok: true });
};
