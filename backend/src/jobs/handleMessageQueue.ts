import { getWbot } from "../libs/wbot";
import { handleMessage } from "../services/WbotServices/wbotMessageListener";
import logger from "../utils/logger";

export default {
  key: `${process.env.DB_NAME}-handleMessage`,

  async handle({ data }) {
    try {
      const { message, wbot, companyId } = data;

      if (
        message === undefined ||
        wbot === undefined ||
        companyId === undefined
      ) {
        logger.warn("handleMessageQueue: missing required data (message, wbot, or companyId)");
      }

      const w = getWbot(wbot);

      if (!w) {
        logger.warn("handleMessageQueue: wbot not found");
      }

      try {
        await handleMessage(message, w, companyId);
      } catch (error) {
        logger.error(error, "handleMessageQueue: error handling message");
      }
    } catch (error) {
      logger.error(error, "handleMessageQueue: unexpected error");
    }
  }
};
