import { QueryInterface, DataTypes } from "sequelize";
// Adicionar a coluna notificameHub na tabela CompaniesSettings

module.exports = {

  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("CompaniesSettings", "notificameHub", {
      type: DataTypes.STRING,
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true
    });
  },

}
