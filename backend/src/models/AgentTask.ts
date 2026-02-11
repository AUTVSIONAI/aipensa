import { Table, Column, CreatedAt, UpdatedAt, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import User from "./User";
import AgentMessageLog from "./AgentMessageLog";
import MetaAdsCampaign from "./MetaAdsCampaign";

@Table({ tableName: "AgentTasks" })
class AgentTask extends Model<AgentTask> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column(DataType.TEXT)
  type: string; // instagram_post, instagram_comment, ads_campaign, whatsapp_status

  @Column(DataType.TEXT)
  status: string; // pending, awaiting_confirmation, running, completed, failed, cancelled

  @Column(DataType.JSONB)
  payload: any;

  @Column(DataType.JSONB)
  result: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => AgentMessageLog)
  logs: AgentMessageLog[];
  
  @HasMany(() => MetaAdsCampaign)
  campaigns: MetaAdsCampaign[];
}

export default AgentTask;