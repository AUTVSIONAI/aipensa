import { formatInTimeZone } from "date-fns-tz";
import pino from "pino";

const timezoned = () =>
  formatInTimeZone(new Date(), "America/Sao_Paulo", "dd-MM-yyyy HH:mm:ss");

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
            ignore: "pid,hostname"
          }
        }
      }),
  timestamp: () => `,"time":"${timezoned()}"`
});

export default logger;
