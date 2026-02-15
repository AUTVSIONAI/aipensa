import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // 1. MetaIntegrations
    await queryInterface.createTable("MetaIntegrations", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      fb_user_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      meta_user_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      long_lived_user_token: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      token_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 2. MetaPages
    await queryInterface.createTable("MetaPages", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      integrationId: {
        type: DataTypes.UUID,
        references: { model: "MetaIntegrations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      page_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      page_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      page_access_token: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ig_business_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 3. MetaAdsAccounts
    await queryInterface.createTable("MetaAdsAccounts", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      integrationId: {
        type: DataTypes.UUID,
        references: { model: "MetaIntegrations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      ad_account_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 4. AgentTasks
    await queryInterface.createTable("AgentTasks", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      type: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      result: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 5. AgentMessageLogs
    await queryInterface.createTable("AgentMessageLogs", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      taskId: {
        type: DataTypes.UUID,
        references: { model: "AgentTasks", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // 6. MetaAdsCampaigns
    await queryInterface.createTable("MetaAdsCampaigns", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      taskId: {
        type: DataTypes.UUID,
        references: { model: "AgentTasks", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: true
      },
      campaign_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      adset_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      creative_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      ad_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("MetaAdsCampaigns");
    await queryInterface.dropTable("AgentMessageLogs");
    await queryInterface.dropTable("AgentTasks");
    await queryInterface.dropTable("MetaAdsAccounts");
    await queryInterface.dropTable("MetaPages");
    await queryInterface.dropTable("MetaIntegrations");
  }
};
