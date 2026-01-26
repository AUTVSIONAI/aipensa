import { QueryInterface, DataTypes } from "sequelize";

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.addColumn("Plans", "useAgentAi", {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  });
  await queryInterface.addColumn("Plans", "useVoiceCommands", {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  });
  await queryInterface.addColumn("Plans", "useAutoPosts", {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  });
  await queryInterface.addColumn("Plans", "useDmComments", {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  });
  await queryInterface.addColumn("Plans", "useProReports", {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  });
  await queryInterface.addColumn("Plans", "limitVoiceMinutes", {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  });
  await queryInterface.addColumn("Plans", "limitPosts", {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  });
  await queryInterface.addColumn("Plans", "limitConversations", {
    type: DataTypes.INTEGER,
    defaultValue: 500,
    allowNull: false
  });
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.removeColumn("Plans", "useAgentAi");
  await queryInterface.removeColumn("Plans", "useVoiceCommands");
  await queryInterface.removeColumn("Plans", "useAutoPosts");
  await queryInterface.removeColumn("Plans", "useDmComments");
  await queryInterface.removeColumn("Plans", "useProReports");
  await queryInterface.removeColumn("Plans", "limitVoiceMinutes");
  await queryInterface.removeColumn("Plans", "limitPosts");
  await queryInterface.removeColumn("Plans", "limitConversations");
};
