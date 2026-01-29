import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

import AuthUserService from "../services/UserServices/AuthUserService";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import FindUserFromToken from "../services/AuthServices/FindUserFromToken";
import User from "../models/User";
import { verify } from "jsonwebtoken";
import authConfig from "../config/auth";
import ShowUserService from "../services/UserServices/ShowUserService";
import { createAccessToken, createRefreshToken } from "../helpers/CreateTokens";

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body || {};
    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res
        .status(400)
        .json({ error: "E-mail e senha são obrigatórios." });
    }
    if (process.env.DEV_FAKE_AUTH === "true") {
      const serializedUser: any = {
        id: 1,
        name: "Admin",
        email: email || "admin@admin",
        companyId: 1,
        company: {
          id: 1,
          name: "Empresa Admin - Não Deletar!",
          dueDate: "2099-12-31T00:00:00.000Z"
        },
        profile: "admin",
        super: true,
        queues: [],
        token: "dev"
      };
      const token = createAccessToken(serializedUser);
      const refreshToken = createRefreshToken(serializedUser);
      SendRefreshToken(res, refreshToken);
      const io = getIO();
      io.of(serializedUser.companyId.toString()).emit(
        `company-${serializedUser.companyId}-auth`,
        {
          action: "update",
          user: {
            id: serializedUser.id,
            email: serializedUser.email,
            companyId: serializedUser.companyId,
            token: serializedUser.token
          }
        }
      );
      return res.status(200).json({ token, user: serializedUser });
    }
    const { token, serializedUser, refreshToken } = await AuthUserService({
      email,
      password
    });
    SendRefreshToken(res, refreshToken);
    const io = getIO();
    io.of(serializedUser.companyId.toString()).emit(
      `company-${serializedUser.companyId}-auth`,
      {
        action: "update",
        user: {
          id: serializedUser.id,
          email: serializedUser.email,
          companyId: serializedUser.companyId,
          token: serializedUser.token
        }
      }
    );
    return res.status(200).json({
      token,
      user: serializedUser
    });
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: "Erro interno ao efetuar login." });
  }
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const tokenCookie: string = req.cookies.jrt;

  if (tokenCookie) {
    const { user, newToken, refreshToken } = await RefreshTokenService(
      res,
      tokenCookie
    );
    SendRefreshToken(res, refreshToken);
    return res.json({ token: newToken, user });
  }

  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const [, accessToken] = authHeader.split(" ");
      const decoded = verify(accessToken, authConfig.secret) as any;
      const { id, companyId } = decoded;
      const user = await ShowUserService(id, companyId);
      const newToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);
      SendRefreshToken(res, refreshToken);
      return res.json({ token: newToken, user });
    } catch (err) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }
  }

  throw new AppError("ERR_SESSION_EXPIRED", 401);
};

export const me = async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.cookies.jrt;
  const user = await FindUserFromToken(token);
  const { id, profile, super: superAdmin } = user;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  return res.json({ id, profile, super: superAdmin });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Try to get user from request, but don't fail if it's not present
  // The goal is just to clear the cookie
  try {
    if (req.user && req.user.id) {
      const { id } = req.user;
      const user = await User.findByPk(id);
      if (user) {
        await user.update({ online: false });
      }
    }
  } catch (err) {
    // If we can't update the user status, we still want to log them out
    console.error("Error updating user status on logout:", err);
  }

  res.clearCookie("jrt");

  return res.send();
};
