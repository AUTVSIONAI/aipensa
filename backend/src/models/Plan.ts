import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default
} from "sequelize-typescript";

@Table
class Plan extends Model<Plan> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @Column
  users: number;

  @Column
  connections: number;

  @Column
  queues: number;

  @Column
  amount: string;

  @Column
  useWhatsapp: boolean;

  @Column
  useFacebook: boolean;

  @Column
  useInstagram: boolean;

  @Column
  useCampaigns: boolean;

  @Column
  useSchedules: boolean;

  @Column
  useInternalChat: boolean;

  @Column
  useExternalApi: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  useKanban: boolean;

  @Column
  trial: boolean;

  @Column
  trialDays: number;

  @Column
  recurrence: string;

  @Column
  useOpenAi: boolean;

  @Column
  useIntegrations: boolean;

  @Default(true)
  @Column
  isPublic: boolean;

  @Column
  useMarketing: boolean;

  @Column
  useMetaAds: boolean;

  @Default(false)
  @Column
  useAgentAi: boolean;

  @Default(false)
  @Column
  useVoiceCommands: boolean;

  @Default(false)
  @Column
  useAutoPosts: boolean;

  @Default(false)
  @Column
  useDmComments: boolean;

  @Default(false)
  @Column
  useProReports: boolean;

  @Default(0)
  @Column
  limitVoiceMinutes: number;

  @Default(0)
  @Column
  limitPosts: number;

  @Default(500)
  @Column
  limitConversations: number;
}

export default Plan;
