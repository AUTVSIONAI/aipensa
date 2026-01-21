import { QueryInterface, DataTypes, Sequelize } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS "Messages_id_seq" START WITH 1;
    `);

    await queryInterface.changeColumn("Messages", "id", {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.literal(
        "nextval('\"Messages_id_seq\"'::regclass)"
      )
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`
      DROP SEQUENCE IF EXISTS "Messages_id_seq";
    `);

    await queryInterface.changeColumn("Messages", "id", {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    });
  }
};
