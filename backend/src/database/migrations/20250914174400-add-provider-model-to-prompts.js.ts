import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Prompts", "provider", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "openai"
      }),
      queryInterface.addColumn("Prompts", "model", {
        type: DataTypes.STRING,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Prompts", "provider"),
      queryInterface.removeColumn("Prompts", "model")
    ]);
  }
};