import { Table, Column, CreatedAt, UpdatedAt, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import User from "./User";
import MetaPage from "./MetaPage";
import MetaAdsAccount from "./MetaAdsAccount";

@Table({ tableName: "MetaIntegrations" })
class MetaIntegration extends Model<MetaIntegration> {
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
  fb_user_id: string;

  @Column(DataType.TEXT)
  meta_user_id: string;

  @Column(DataType.TEXT)
  email: string;

  @Column(DataType.TEXT)
  long_lived_user_token: string;

  @Column(DataType.DATE)
  token_expires_at: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => MetaPage)
  pages: MetaPage[];

  @HasMany(() => MetaAdsAccount)
  adAccounts: MetaAdsAccount[];
}

export default MetaIntegration;