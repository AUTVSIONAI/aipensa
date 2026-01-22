import User from "../../models/User";
import AppError from "../../errors/AppError";
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
  console.log(`[AuthUserService] Searching for user with email: '${searchEmail}'`);

  const user = await User.findOne({
    where: { email: { [Op.iLike]: searchEmail } },
    include: ["queues", { model: Company, include: [{ model: CompaniesSettings }] }]
  });

  if (!user) {
    console.log(`[AuthUserService] User not found: ${email}`);
    throw new AppError("Usuário não encontrado! Verifique o e-mail digitado.", 401);
  }

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
  } else if ((await user.checkPassword(password))) {

    const company = await Company.findByPk(user?.companyId);
    await company.update({
      lastLogin: new Date()
    });

  } else {
    console.log(`[AuthUserService] Password check failed for user: ${email}`);
    throw new AppError("Senha incorreta! Verifique suas credenciais.", 401);
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
