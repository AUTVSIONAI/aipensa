import { Table, Column, CreatedAt, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from "sequelize-typescript";
import MetaIntegration from "./MetaIntegration";

@Table({ tableName: "MetaPages" })
class MetaPage extends Model<MetaPage> {
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
  page_id: string;

  @Column(DataType.TEXT)
  page_name: string;

  @Column(DataType.TEXT)
  page_access_token: string;

  @Column(DataType.TEXT)
  ig_business_id: string;

  @CreatedAt
  createdAt: Date;
}

export default MetaPage;