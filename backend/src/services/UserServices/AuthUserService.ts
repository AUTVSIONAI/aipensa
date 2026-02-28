import User from "../../models/User";
import AppError from "../../errors/AppError";
import { Op } from "sequelize";
import logger from "../../utils/logger";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import { SerializeUser } from "../../helpers/SerializeUser";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
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
  logger.info(
    `Searching for user with email: '${searchEmail}'`
  );

  // First try to find user WITHOUT includes to avoid association issues
  let user = await User.findOne({
    where: { email: searchEmail }
  });

  if (user) {
    // Fetch with includes
    try {
      user = await User.findOne({
        where: { id: user.id },
        include: [
          "queues",
          { model: Company, include: [{ model: CompaniesSettings }] }
        ]
      });
    } catch (e: any) {
      logger.warn(
        `Failed to load associations for user ${user.id}: ${e?.message}`
      );
    }
  } else {
    // Try case-insensitive if exact match failed
    user = await User.findOne({
      where: { email: { [Op.iLike]: searchEmail } }
    });

    if (user) {
      try {
        user = await User.findOne({
          where: { id: user.id },
          include: [
            "queues",
            { model: Company, include: [{ model: CompaniesSettings }] }
          ]
        });
      } catch (e: any) {
        logger.warn(
          `Failed to load associations for user ${user.id}: ${e?.message}`
        );
      }
    }
  }

  if (!user) {
    logger.info(`Auth failed: user not found for email ${searchEmail}`);
    throw new AppError(
      "Usuário não encontrado! Verifique o e-mail digitado.",
      401
    );
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
      logger.info(`Auth rejected: out of hours for ${searchEmail}`);
      throw new AppError(
        `Fora do horário de expediente! Seu horário: ${inicio} às ${termino}`,
        401
      );
    }
  }

  let isValidPassword = await user.checkPassword(password);

  // If failed, try trimmed password
  if (!isValidPassword) {
    isValidPassword = await user.checkPassword(password.trim());
  }

  if (!isValidPassword) {
    logger.info(`Auth failed: invalid password for ${searchEmail}`);
    throw new AppError("Senha incorreta! Verifique seus dados.", 401);
  }

  const company = await Company.findByPk(user?.companyId);
  if (company) {
    await company.update({
      lastLogin: new Date()
    });
  }

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
