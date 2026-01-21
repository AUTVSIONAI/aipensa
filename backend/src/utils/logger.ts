import pino from 'pino';
import moment from 'moment-timezone';

// Função para obter o timestamp com fuso horário
const timezoned = () => {
  return moment().tz('America/Sao_Paulo').format('DD-MM-YYYY HH:mm:ss');
};

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
  timestamp: () => `,"time":"${timezoned()}"`, // Adiciona o timestamp formatado
});

export default logger;
