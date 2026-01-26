import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Atualiza todos os planos existentes para ter useMarketing = true
    // Isso garante que usuários existentes tenham acesso ao novo módulo após a migração
    return queryInterface.sequelize.query(
      `UPDATE "Plans" SET "useMarketing" = true WHERE "useMarketing" IS FALSE OR "useMarketing" IS NULL`
    );
  },

  down: async (queryInterface: QueryInterface) => {
    // Não faz nada no rollback para evitar desativar o recurso acidentalmente
    return Promise.resolve();
  }
};
