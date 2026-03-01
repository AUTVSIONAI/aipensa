import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import { REDIS_URI_CONNECTION } from "../config/redis";
import logger from "../utils/logger";

let store: RedisStore | undefined;

if (REDIS_URI_CONNECTION) {
  try {
    const redisClient = new Redis(REDIS_URI_CONNECTION);
    store = new RedisStore({
      sendCommand: (...args: string[]) =>
        redisClient.call(args[0], ...args.slice(1)) as any
    });
    logger.info("Rate limiter using Redis store");
  } catch (err) {
    logger.warn("Rate limiter falling back to MemoryStore");
  }
}

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Muitas tentativas. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
  ...(store && { store })
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "Muitas tentativas de recuperação de senha. Tente novamente em 1 hora." },
  standardHeaders: true,
  legacyHeaders: false,
  ...(store && { store })
});

export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { error: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
  ...(store && { store })
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: { error: "Muitos uploads. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
  ...(store && { store })
});

export const clinicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: "Too many requests. Try again in 1 minute." },
  standardHeaders: true,
  legacyHeaders: false,
  ...(store && { store })
});
