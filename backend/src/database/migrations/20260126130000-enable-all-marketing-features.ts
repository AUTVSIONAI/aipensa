import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Enable all marketing and advanced features for all plans
    // This ensures admins and users have full access as requested
    return queryInterface.sequelize.query(
      `UPDATE "Plans" SET 
        "useMarketing" = true,
        "useProReports" = true,
        "useMetaAds" = true,
        "useAgentAi" = true,
        "useAutoPosts" = true,
        "useDmComments" = true,
        "limitPosts" = 999999,
        "limitVoiceMinutes" = 999999,
        "limitConversations" = 999999
       WHERE "id" IS NOT NULL`
    );
  },

  down: async (queryInterface: QueryInterface) => {
    // No-op to avoid breaking changes on rollback
    return Promise.resolve();
  }
};
