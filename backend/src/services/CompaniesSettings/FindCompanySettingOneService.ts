/**
 * @TercioSantos-0 |
 * serviço/todas as configurações de 1 empresa |
 * @param:companyId
 */
import sequelize from "../../database";
import AppError from "../../errors/AppError";

const ALLOWED_COLUMNS = [
  "hoursCloseTicketsAuto",
  "chatBotType",
  "acceptCallWhatsapp",
  "userRandom",
  "sendGreetingMessageOneQueues",
  "sendSignMessage",
  "sendFarewellWaitingTicket",
  "userRating",
  "sendGreetingAccepted",
  "CheckMsgIsGroup",
  "sendQueuePosition",
  "scheduleType",
  "acceptAudioMessageContact",
  "sendMsgTransfTicket",
  "enableLGPD",
  "requiredTag",
  "lgpdDeleteMessage",
  "lgpdHideNumber",
  "lgpdConsent",
  "lgpdLink",
  "lgpdMessage",
  "closeTicketOnTransfer",
  "DirectTicketsToWallets",
  "notificameHub",
  "transferMessage",
  "AcceptCallWhatsappMessage",
  "sendQueuePositionMessage",
  "enableAutoStatus"
];

type Params = {
  companyId: any;
  column: string;
};

const FindCompanySettingOneService = async ({
  companyId,
  column
}: Params): Promise<any> => {
  if (!ALLOWED_COLUMNS.includes(column)) {
    throw new AppError("ERR_INVALID_COLUMN", 400);
  }

  const [results, metadata] = await sequelize.query(
    `SELECT "${column}" FROM "CompaniesSettings" WHERE "companyId" = :companyId`,
    { replacements: { companyId } }
  );
  return results;
};

export default FindCompanySettingOneService;
