import { Table, Column, CreatedAt, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from "sequelize-typescript";
import MetaIntegration from "./MetaIntegration";

@Table({ tableName: "MetaAdsAccounts" })
class MetaAdsAccount extends Model<MetaAdsAccount> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => MetaIntegration)
  @Column(DataType.UUID)
  integrationId: string;

  @BelongsTo(() => MetaIntegration)
  integration: MetaIntegration;

  @Column(DataType.TEXT)
  ad_account_id: string;

  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  currency: string;

  @Column(DataType.TEXT)
  timezone: string;

  @CreatedAt
  createdAt: Date;
}

export default MetaAdsAccount;