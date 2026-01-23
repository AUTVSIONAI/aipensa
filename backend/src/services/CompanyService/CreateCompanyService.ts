import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import sequelize from "../../database";
import CompaniesSettings from "../../models/CompaniesSettings";
import Prompt from "../../models/Prompt";

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

  const company = await sequelize.transaction(async (t) => {
    const company = await Company.create({
      name,
      phone,
      email,
      status,
      planId,
      dueDate,
      recurrence,
      document,
      paymentMethod
    }, { transaction: t });

    const user = await User.create({
      name: companyUserName || name,
      email: company.email,
      password: (password || "mudar123").trim(),
      profile: "admin",
      companyId: company.id,
      super: false,
      startWork: "00:00",
      endWork: "23:59"
    }, { transaction: t });

    console.log(`[CreateCompanyService] VERSION 3.0 - Company created: ${company.id}, Email: '${company.email}'`);
    console.log(`[CreateCompanyService] User created: ${user.id}, Email: '${user.email}', CompanyId: ${user.companyId}`);

    console.log(`[CreateCompanyService] Creating CompaniesSettings for company ${company.id}...`);
    try {
      await CompaniesSettings.create({
        companyId: company.id,
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
        DirectTicketsToWallets: false
      }, { transaction: t });
      console.log(`[CreateCompanyService] CompaniesSettings created successfully.`);
    } catch (err) {
      console.error(`[CreateCompanyService] CRITICAL ERROR creating CompaniesSettings:`, err);
      throw err; // Re-throw to rollback transaction
    }

    try {
      await Prompt.create({
        name: "IA Padrão",
        prompt: "Você é um assistente virtual inteligente e útil.",
        apiKey: "token_here",
        voice: "pt-BR-Wavenet-A",
        provider: "openrouter",
        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
        companyId: company.id,
        maxTokens: 1000,
        temperature: 1
      }, { transaction: t });
    } catch (e) {
      console.log("Falha ao criar prompt padrão, continuando...", e);
    }

    return company;
  });

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

  return company;
};

export default CreateCompanyService;