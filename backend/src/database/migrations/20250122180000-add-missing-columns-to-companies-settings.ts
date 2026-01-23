import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("CompaniesSettings", "closeTicketOnTransfer", {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true
      }),
      queryInterface.addColumn("CompaniesSettings", "DirectTicketsToWallets", {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true
      }),
      queryInterface.addColumn("CompaniesSettings", "notificameHub", {
        type: DataTypes.TEXT,
        allowNull: true
      }),
      queryInterface.addColumn("CompaniesSettings", "transferMessage", {
        type: DataTypes.TEXT,
        allowNull: true
      }),
      queryInterface.addColumn("CompaniesSettings", "AcceptCallWhatsappMessage", {
        type: DataTypes.TEXT,
        allowNull: true
      }),
      queryInterface.addColumn("CompaniesSettings", "sendQueuePositionMessage", {
        type: DataTypes.TEXT,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("CompaniesSettings", "closeTicketOnTransfer"),
      queryInterface.removeColumn("CompaniesSettings", "DirectTicketsToWallets"),
      queryInterface.removeColumn("CompaniesSettings", "notificameHub"),
      queryInterface.removeColumn("CompaniesSettings", "transferMessage"),
      queryInterface.removeColumn("CompaniesSettings", "AcceptCallWhatsappMessage"),
      queryInterface.removeColumn("CompaniesSettings", "sendQueuePositionMessage")
    ]);
  }
};
