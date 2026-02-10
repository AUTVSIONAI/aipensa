import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import AppError from "../errors/AppError";
import authConfig from "../config/auth";
import User from "../models/User";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}

const isAuthCompany = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  // 1. Check Static Token (API Integration)
  const companyToken = process.env.COMPANY_TOKEN;
  if (companyToken && token === companyToken) {
    return next();
  }

  // 2. Check JWT (Super Admin Access)
  try {
    const decoded = verify(token, authConfig.secret) as TokenPayload;
    const { id } = decoded;

    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    // Only Super Admins can access company management routes via JWT
    if (user.super) {
      req.user = {
        id: user.id,
        profile: user.profile,
        companyId: user.companyId
      };
      return next();
    }
    
    // If not super, deny access (or check specific permissions if needed later)
    throw new AppError("ERR_FORBIDDEN", 403);

  } catch (err) {
    // If both checks fail, return 401
    throw new AppError(
      "ERR_SESSION_EXPIRED", 
      401
    );
  }
};

export default isAuthCompany;
