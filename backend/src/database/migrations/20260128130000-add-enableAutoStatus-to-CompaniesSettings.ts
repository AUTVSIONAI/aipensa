import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table: any = await queryInterface.describeTable("CompaniesSettings");
    if (!table.enableAutoStatus) {
      await queryInterface.addColumn("CompaniesSettings", "enableAutoStatus", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "disabled"
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const table: any = await queryInterface.describeTable("CompaniesSettings");
    if (table.enableAutoStatus) {
      await queryInterface.removeColumn("CompaniesSettings", "enableAutoStatus");
    }
  }
};
