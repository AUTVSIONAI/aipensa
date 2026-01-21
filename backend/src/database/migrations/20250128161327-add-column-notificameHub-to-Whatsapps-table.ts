import { QueryInterface, DataTypes } from "sequelize";
// Adicionar a coluna notificameHub na tabela Whatsapps

module.exports = {

  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Whatsapps", "notificameHub", {
      type: DataTypes.BOOLEAN,
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: false,
      defaultValue: false
    });
  },

}
