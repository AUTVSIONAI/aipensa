import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import sequelize from "../../database";
import CompaniesSettings from "../../models/CompaniesSettings";
import Prompt from "../../models/Prompt";
import { Op } from "sequelize";

interface CompanyData {
  name: string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  dueDate?: string;
  recurrence?: string;
  document?: string;
  paymentMethod?: string;
  password?: string;
  companyUserName?: string;
}

const CreateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const {
    name,
    phone,
    password,
    status,
    planId,
    dueDate,
    recurrence,
    document,
    paymentMethod,
    companyUserName
  } = companyData;

  const email = companyData.email?.toLocaleLowerCase();

  const companySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME")
  });

  try {
    await companySchema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (!email || email.trim() === "") {
    throw new AppError("ERR_COMPANY_INVALID_EMAIL", 400);
  }

  const normalizedName = name.trim();
  const existingByName = await Company.findOne({ where: { name: { [Op.iLike]: normalizedName } } });
  if (existingByName) {
    throw new AppError("ERR_COMPANY_NAME_EXISTS", 409);
  }

  // Evitar erro 500 por violação de unicidade de email do usuário
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError("ERR_USER_ALREADY_EXISTS", 409);
  }

  // Opcional: evitar duplicidade de empresa por email
  const existingCompany = await Company.findOne({ where: { email } });
  if (existingCompany) {
    throw new AppError("ERR_COMPANY_ALREADY_EXISTS", 409);
  }

  const planIdNum = planId ?? 1;

  const txResult = await sequelize.transaction(async (t) => {
    const createdCompany = await Company.create({
      name,
      phone,
      email,
      status,
      planId: planIdNum,
      dueDate,
      recurrence,
      document,
      paymentMethod
    }, { transaction: t });

    const user = await User.create({
      name: companyUserName || name,
      email: createdCompany.email,
      password: (password || "mudar123").trim(),
      profile: "admin",
      companyId: createdCompany.id,
      super: false,
      startWork: "00:00",
      endWork: "23:59"
    }, { transaction: t });

    console.log(`[CreateCompanyService] VERSION 3.0 - Company created: ${createdCompany.id}, Email: '${createdCompany.email}'`);
    console.log(`[CreateCompanyService] User created: ${user.id}, Email: '${user.email}', CompanyId: ${user.companyId}`);

    return { company: createdCompany, user };
  });

  const { company: createdCompany } = txResult;

  console.log(`[CreateCompanyService] Creating CompaniesSettings for company ${createdCompany.id}...`);
  try {
    await CompaniesSettings.create({
      companyId: createdCompany.id,
      hoursCloseTicketsAuto: "999999",
      chatBotType: "text",
      acceptCallWhatsapp: "enabled",
      userRandom: "enabled",
      sendGreetingMessageOneQueues: "enabled",
      sendSignMessage: "enabled",
      sendFarewellWaitingTicket: "disabled",
      userRating: "disabled",
      sendGreetingAccepted: "enabled",
      CheckMsgIsGroup: "enabled",
      sendQueuePosition: "disabled",
      scheduleType: "disabled",
      acceptAudioMessageContact: "enabled",
      sendMsgTransfTicket: "disabled",
      enableLGPD: "disabled",
      requiredTag: "disabled",
      lgpdDeleteMessage: "disabled",
      lgpdHideNumber: "disabled",
      lgpdConsent: "disabled",
      lgpdLink: "",
      lgpdMessage: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      closeTicketOnTransfer: false,
      DirectTicketsToWallets: false,
      notificameHub: "",
      transferMessage: "",
      AcceptCallWhatsappMessage: "",
      sendQueuePositionMessage: ""
    });
    console.log(`[CreateCompanyService] CompaniesSettings created successfully.`);
  } catch (err) {
    console.error(`[CreateCompanyService] ERROR creating CompaniesSettings (não bloqueante):`, err);
  }

  try {
    await Prompt.create({
      name: "IA Padrão",
      prompt: "Você é um assistente virtual inteligente e útil.",
      apiKey: "token_here",
      voice: "pt-BR-Wavenet-A",
      provider: "openrouter",
      model: "google/gemini-2.0-flash-lite-preview-02-05:free",
      companyId: createdCompany.id,
      maxTokens: 1000,
      temperature: 1
    });
  } catch (e) {
    console.log("Falha ao criar prompt padrão, continuando...", e);
  }

  // Verify persistence immediately
  try {
    const checkUser = await User.findOne({ where: { email: email } });
    if (checkUser) {
      console.log(`[CreateCompanyService] SUCCESS: User '${email}' found in DB after commit. ID: ${checkUser.id}, CompanyId: ${checkUser.companyId}`);
      // Force password re-hash check
      const valid = await checkUser.checkPassword(password || "mudar123");
      console.log(`[CreateCompanyService] Password check immediately after creation: ${valid ? 'VALID' : 'INVALID'}`);
    } else {
      console.error(`[CreateCompanyService] CRITICAL ERROR: User '${email}' NOT found in DB after commit!`);
    }
  } catch (e) {
    console.error("[CreateCompanyService] Error verifying user:", e);
  }

  return createdCompany;
};

export default CreateCompanyService;
