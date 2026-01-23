import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const [flows] = await queryInterface.sequelize.query(
      `SELECT id, name FROM "FlowBuilders" WHERE "company_id" = 1 AND "active" = true`
    );

    const getIdByName = (n: string) => {
      const f = (flows as any[]).find(x => x.name === n);
      return f ? f.id : null;
    };

    const flowIdWelcome = getIdByName("Clínica Médica");
    const flowIdNotPhrase = getIdByName("Restaurante");

    if (flowIdWelcome && flowIdNotPhrase) {
      await queryInterface.bulkInsert("FlowDefaults", [
        {
          companyId: 1,
          userId: 1,
          flowIdWelcome,
          flowIdNotPhrase,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("FlowDefaults", { companyId: 1 });
  }
};

