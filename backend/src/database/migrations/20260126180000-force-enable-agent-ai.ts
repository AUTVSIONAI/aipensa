import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Force enable useAgentAi for all plans to ensure AI responds
    await queryInterface.sequelize.query(`
      UPDATE "Plans"
      SET "useAgentAi" = true,
          "useMarketing" = true,
          "useMetaAds" = true,
          "useProReports" = true,
          "useVoiceCommands" = true,
          "useAutoPosts" = true,
          "limitPosts" = 999999,
          "limitVoiceMinutes" = 999999
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    // No reversion needed
  }
};
