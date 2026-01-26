import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";

@Table({ tableName: "UsageTracking" })
class UsageTracking extends Model<UsageTracking> {
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
  type: string; // 'POST', 'VOICE_SECONDS', 'CONVERSATION'

  @Column({ defaultValue: 1 })
  amount: number;

  @Column
  resourceId: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UsageTracking;
