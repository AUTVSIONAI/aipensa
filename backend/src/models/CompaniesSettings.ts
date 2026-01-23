import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Default
} from "sequelize-typescript";
import Company from "./Company";

@Table({ tableName: "CompaniesSettings" })
class CompaniesSettings extends Model<CompaniesSettings> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  hoursCloseTicketsAuto: string;

  @Column
  chatBotType: string;

  @Column
  acceptCallWhatsapp: string;

  @Column
  userRandom: string;

  @Column
  sendGreetingMessageOneQueues: string;

  @Column
  sendSignMessage: string;

  @Column
  sendFarewellWaitingTicket: string;

  @Column
  userRating: string;

  @Column
  sendGreetingAccepted: string;

  @Column
  CheckMsgIsGroup: string;

  @Column
  sendQueuePosition: string;

  @Column
  scheduleType: string;

  @Column
  acceptAudioMessageContact: string;

  @Column
  sendMsgTransfTicket: string;

  @Column
  enableLGPD: string;

  @Column
  requiredTag: string;

  @Column
  lgpdDeleteMessage: string;

  @Column
  lgpdHideNumber: string;

  @Column
  lgpdConsent: string;

  @Column
  lgpdLink: string;

  @Column
  lgpdMessage: string;

  @Default(false)
  @Column
  closeTicketOnTransfer: boolean;

  @Default(false)
  @Column
  DirectTicketsToWallets: boolean;

  @Column
  notificameHub: string;

  @Column
  transferMessage: string;

  @Column
  AcceptCallWhatsappMessage: string;

  @Column
  sendQueuePositionMessage: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CompaniesSettings;
