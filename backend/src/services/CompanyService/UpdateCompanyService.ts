import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Setting from "../../models/Setting";
import User from "../../models/User";
import Invoices from "../../models/Invoices";
import Plan from "../../models/Plan";

interface CompanyData {
  name: string;
  id?: number | string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
  document?: string;
  paymentMethod?: string;
  password?: string;
}

const UpdateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {

  const company = await Company.findByPk(companyData.id);
  const {
    name,
    phone,
    email,
    status,
    planId,
    campaignsEnabled,
    dueDate,
    recurrence,
    document,
    paymentMethod,
    password
  } = companyData;

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  const openInvoices = await Invoices.findAll({
    where: {
      status: "open",
      companyId: company.id
    }
  });

  if (openInvoices.length > 1) {
    for (const invoice of openInvoices.slice(1)) {
      await invoice.update({ status: "cancelled" });
    }
  }

  const openInvoice = openInvoices[0];
  if (openInvoice) {
    const invoiceUpdateData: any = {};

    if (dueDate) invoiceUpdateData.dueDate = dueDate;

    if (typeof planId === "number") {
      const plan = await Plan.findByPk(planId);
      if (plan) {
        invoiceUpdateData.value = plan.amount?.replace(",", ".");
        invoiceUpdateData.detail = plan.name;
        invoiceUpdateData.users = plan.users;
        invoiceUpdateData.connections = plan.connections;
        invoiceUpdateData.queues = plan.queues;
      }
    }

    if (Object.keys(invoiceUpdateData).length > 0) {
      await openInvoice.update(invoiceUpdateData);
    }
  }

  if (email) {
    const existUser = await User.findOne({
      where: {
        companyId: company.id,
        email
      }
    });

    if (existUser && existUser.email !== company.email) {
      throw new AppError("Usuário já existe com esse e-mail!", 404);
    }
  }

  const user = await User.findOne({
    where: {
      companyId: company.id,
      email: company.email
    }
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404)
  }
  
  const userUpdateData: any = {};
  if (email) userUpdateData.email = email;
  if (password) userUpdateData.password = password;
  if (Object.keys(userUpdateData).length > 0) {
    await user.update(userUpdateData);
  }


  const companyUpdateData: any = {};
  if (name !== undefined) companyUpdateData.name = name;
  if (phone !== undefined) companyUpdateData.phone = phone;
  if (email !== undefined) companyUpdateData.email = email;
  if (status !== undefined) companyUpdateData.status = status;
  if (planId !== undefined) companyUpdateData.planId = planId;
  if (dueDate !== undefined) companyUpdateData.dueDate = dueDate;
  if (recurrence !== undefined) companyUpdateData.recurrence = recurrence;
  if (document !== undefined) companyUpdateData.document = document;
  if (paymentMethod !== undefined) companyUpdateData.paymentMethod = paymentMethod;

  if (Object.keys(companyUpdateData).length > 0) {
    await company.update(companyUpdateData);
  }

  if (companyData.campaignsEnabled !== undefined) {
    const [setting, created] = await Setting.findOrCreate({
      where: {
        companyId: company.id,
        key: "campaignsEnabled"
      },
      defaults: {
        companyId: company.id,
        key: "campaignsEnabled",
        value: `${campaignsEnabled}`
      }
    });
    if (!created) {
      await setting.update({ value: `${campaignsEnabled}` });
    }
  }

  return company;
};

export default UpdateCompanyService;
