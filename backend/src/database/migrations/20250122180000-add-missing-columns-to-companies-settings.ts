import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("CompaniesSettings");

    if (!tableInfo["closeTicketOnTransfer"]) {
      await queryInterface.addColumn("CompaniesSettings", "closeTicketOnTransfer", {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      });
    }
    if (!tableInfo["DirectTicketsToWallets"]) {
      await queryInterface.addColumn("CompaniesSettings", "DirectTicketsToWallets", {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      });
    }
    if (!tableInfo["notificameHub"]) {
      await queryInterface.addColumn("CompaniesSettings", "notificameHub", {
        type: DataTypes.TEXT
      });
    }
    if (!tableInfo["transferMessage"]) {
      await queryInterface.addColumn("CompaniesSettings", "transferMessage", {
        type: DataTypes.TEXT
      });
    }
    if (!tableInfo["AcceptCallWhatsappMessage"]) {
      await queryInterface.addColumn("CompaniesSettings", "AcceptCallWhatsappMessage", {
        type: DataTypes.TEXT
      });
    }
    if (!tableInfo["sendQueuePositionMessage"]) {
      await queryInterface.addColumn("CompaniesSettings", "sendQueuePositionMessage", {
        type: DataTypes.TEXT
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("CompaniesSettings");

    if (tableInfo["closeTicketOnTransfer"]) {
        await queryInterface.removeColumn("CompaniesSettings", "closeTicketOnTransfer");
    }
    if (tableInfo["DirectTicketsToWallets"]) {
        await queryInterface.removeColumn("CompaniesSettings", "DirectTicketsToWallets");
    }
    if (tableInfo["notificameHub"]) {
        await queryInterface.removeColumn("CompaniesSettings", "notificameHub");
    }
    if (tableInfo["transferMessage"]) {
        await queryInterface.removeColumn("CompaniesSettings", "transferMessage");
    }
    if (tableInfo["AcceptCallWhatsappMessage"]) {
        await queryInterface.removeColumn("CompaniesSettings", "AcceptCallWhatsappMessage");
    }
    if (tableInfo["sendQueuePositionMessage"]) {
        await queryInterface.removeColumn("CompaniesSettings", "sendQueuePositionMessage");
    }
  }
};
