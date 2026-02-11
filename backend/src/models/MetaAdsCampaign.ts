import { Table, Column, CreatedAt, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from "sequelize-typescript";
import AgentTask from "./AgentTask";

@Table({ tableName: "MetaAdsCampaigns" })
class MetaAdsCampaign extends Model<MetaAdsCampaign> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => AgentTask)
  @Column(DataType.UUID)
  taskId: string;

  @BelongsTo(() => AgentTask)
  task: AgentTask;

  @Column(DataType.TEXT)
  campaign_id: string;

  @Column(DataType.TEXT)
  adset_id: string;

  @Column(DataType.TEXT)
  creative_id: string;

  @Column(DataType.TEXT)
  ad_id: string;

  @CreatedAt
  createdAt: Date;
}

export default MetaAdsCampaign;