/**
 * @TercioSantos-0 |
 * serviço/atualizar 1 configuração da empresa |
 * @params:companyId/column(name)/data
 */
import sequelize from "../../database";
import CompaniesSettings from "../../models/CompaniesSettings";
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
  companyId: number;
  column: string;
  data: string;
};

const UpdateCompanySettingsService = async ({
  companyId,
  column,
  data
}: Params): Promise<any> => {
  if (!ALLOWED_COLUMNS.includes(column)) {
    throw new AppError("ERR_INVALID_COLUMN", 400);
  }

  const [results, metadata] = await sequelize.query(
    `UPDATE "CompaniesSettings" SET "${column}" = :data WHERE "companyId" = :companyId`,
    { replacements: { data, companyId } }
  );

  return results;
};

export default UpdateCompanySettingsService;
