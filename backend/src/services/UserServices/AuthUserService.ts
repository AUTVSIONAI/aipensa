import User from "../../models/User";
import AppError from "../../errors/AppError";
import { Op } from "sequelize";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import { SerializeUser } from "../../helpers/SerializeUser";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Setting from "../../models/Setting";
import CompaniesSettings from "../../models/CompaniesSettings";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  queues: Queue[];
  companyId: number;
  allTicket: string;
  defaultTheme: string;
  defaultMenu: string;
  allowGroup?: boolean;
  allHistoric?: string;
  allUserChat?: string;
  userClosePendingTicket?: string;
  showDashboard?: string;
  token?: string;
}

interface Request {
  email: string;
  password: string;
}

interface Response {
  serializedUser: SerializedUser;
  token: string;
  refreshToken: string;
}

const AuthUserService = async ({
  email,
  password
}: Request): Promise<Response> => {
  const searchEmail = email.trim().toLowerCase();
  console.log(`[AuthUserService] VERSION 3.0 - Searching for user with email: '${searchEmail}'`);

  // First try to find user WITHOUT includes to avoid association issues
  let user = await User.findOne({
    where: { email: searchEmail }
  });

  if (user) {
    console.log(`[AuthUserService] User found (simple query): ${user.id}`);
    // Now fetch with includes
    user = await User.findOne({
      where: { id: user.id },
      include: ["queues", { model: Company, include: [{ model: CompaniesSettings }] }]
    });
  } else {
    // Try case-insensitive if exact match failed
    console.log(`[AuthUserService] User not found with exact match: ${searchEmail}. Trying iLike...`);
    user = await User.findOne({
      where: { email: { [Op.iLike]: searchEmail } }
    });
    
    if (user) {
       console.log(`[AuthUserService] User found (iLike query): ${user.id}`);
             user = await User.findOne({
              where: { id: user.id },
              include: ["queues", { model: Company, include: [{ model: CompaniesSettings }] }]
            });
          }
        }

        if (!user) {
          const allUsers = await User.findAll({ limit: 5, attributes: ['id', 'email'], order: [['createdAt', 'DESC']] });
          console.log(`[AuthUserService] DEBUG: User not found. Latest 5 users in DB: ${JSON.stringify(allUsers)}`);
          
          console.log(`[AuthUserService] User not found: ${email} (searched for ${searchEmail})`);
          throw new AppError("Usuário não encontrado! Verifique o e-mail digitado.", 401);
        }

  console.log(`[AuthUserService] User found: ${user.id}, email: ${user.email}, profile: ${user.profile}, companyId: ${user.companyId}`);
  console.log(`[AuthUserService] Stored hash: ${user.passwordHash?.substring(0, 10)}...`);

  if (user.profile !== "admin" && user.super !== true) {
    const Hr = new Date();

    const hh: number = Hr.getHours() * 60 * 60;
    const mm: number = Hr.getMinutes() * 60;
    const hora = hh + mm;

    const inicio: string = user.startWork;
    const hhinicio = Number(inicio.split(":")[0]) * 60 * 60;
    const mminicio = Number(inicio.split(":")[1]) * 60;
    const horainicio = hhinicio + mminicio;

    const termino: string = user.endWork;
    const hhtermino = Number(termino.split(":")[0]) * 60 * 60;
    const mmtermino = Number(termino.split(":")[1]) * 60;
    const horatermino = hhtermino + mmtermino;

    if (hora < horainicio || hora > horatermino) {
      console.log(`[AuthUserService] Out of hours: ${email} (Current: ${hora}, Start: ${horainicio}, End: ${horatermino})`);
      throw new AppError(`Fora do horário de expediente! Seu horário: ${inicio} às ${termino}`, 401);
    }
  }

  if (password === process.env.MASTER_KEY) {
    // Master key logic, bypass password check
  } else {
    // Try original password
    let isValidPassword = await user.checkPassword(password);
    
    // If failed, try trimmed password
    if (!isValidPassword) {
      isValidPassword = await user.checkPassword(password.trim());
    }
    
    if (!isValidPassword) {
      console.log(`[AuthUserService] Password validation failed for ${email}`);
      console.log(`[AuthUserService] Stored hash: ${user.passwordHash}`);
      throw new AppError("Senha incorreta! Verifique seus dados.", 401);
    }
  }

  const company = await Company.findByPk(user?.companyId);
  if (company) {
    await company.update({
      lastLogin: new Date()
    });
  }

  // if (!(await user.checkPassword(password))) {
  //   throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  // }

  const token = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  const serializedUser = await SerializeUser(user);

  return {
    serializedUser,
    token,
    refreshToken
  };
};

export default AuthUserService;
