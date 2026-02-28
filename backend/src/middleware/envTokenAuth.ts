import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

import AppError from "../errors/AppError";

type TokenPayload = {
  token: string | undefined;
};

const envTokenAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { token: bodyToken } = req.body as TokenPayload;
    const { token: queryToken } = req.query as TokenPayload;

    logger.info("envTokenAuth: validating token");

    if (queryToken === process.env.ENV_TOKEN) {
      return next();
    }

    if (bodyToken === process.env.ENV_TOKEN) {
      return next();
    }
  } catch (e) {
    logger.error("envTokenAuth: token validation error");
  }

  throw new AppError("Token inválido", 403);
};

export default envTokenAuth;
