import { Table, Column, CreatedAt, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from "sequelize-typescript";
import AgentTask from "./AgentTask";

@Table({ tableName: "AgentMessagesLog" })
class AgentMessageLog extends Model<AgentMessageLog> {
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
  channel: string; // whatsapp, panel

  @Column(DataType.TEXT)
  message: string;

  @CreatedAt
  createdAt: Date;
}

export default AgentMessageLog;