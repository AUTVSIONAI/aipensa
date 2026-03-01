import * as fsp from "fs/promises";
import path from "path";
import * as fs from "fs";
import logger from "../utils/logger";
// const filePath = 'caminho/do/seu/arquivo.txt';

export async function addLogs({ fileName, text, forceNewFile = false }) {
  const logs = path.resolve(__dirname, "..", "..", "logs");
  const filePath = path.resolve(logs, fileName);

  try {
    if (!fs.existsSync(logs)) {
      fs.mkdirSync(logs);
    }
  } catch (error) {}

  try {
    if (forceNewFile) {
      await fsp.writeFile(filePath, `${text} \n`);
      logger.info("[addLogs] New log file created");
    } else await fsp.appendFile(filePath, `${text} \n`);
    logger.info("[addLogs] Text appended to log file");
  } catch (err) {
    if (err.code === "ENOENT") {
      // O arquivo não existe, então cria e adiciona o texto
      await fsp.writeFile(filePath, `${text} \n`);
      logger.info("[addLogs] New log file created (ENOENT fallback)");
    } else {
      logger.error(err, "Erro ao manipular o arquivo de log");
    }
  }
}
