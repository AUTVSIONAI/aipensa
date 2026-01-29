import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("CompaniesSettings");

    if (!tableInfo["closeTicketOnTransfer"]) {
      await queryInterface.addColumn(
        "CompaniesSettings",
        "closeTicketOnTransfer",
        {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: true
        }
      );
    }

    if (!tableInfo["DirectTicketsToWallets"]) {
      await queryInterface.addColumn(
        "CompaniesSettings",
        "DirectTicketsToWallets",
        {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: true
        }
      );
    }

    if (!tableInfo["notificameHub"]) {
      await queryInterface.addColumn("CompaniesSettings", "notificameHub", {
        type: DataTypes.TEXT,
        allowNull: true
      });
    }

    if (!tableInfo["transferMessage"]) {
      await queryInterface.addColumn("CompaniesSettings", "transferMessage", {
        type: DataTypes.TEXT,
        allowNull: true
      });
    }

    if (!tableInfo["AcceptCallWhatsappMessage"]) {
      await queryInterface.addColumn(
        "CompaniesSettings",
        "AcceptCallWhatsappMessage",
        {
          type: DataTypes.TEXT,
          allowNull: true
        }
      );
    }

    if (!tableInfo["sendQueuePositionMessage"]) {
      await queryInterface.addColumn(
        "CompaniesSettings",
        "sendQueuePositionMessage",
        {
          type: DataTypes.TEXT,
          allowNull: true
        }
      );
    }
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("CompaniesSettings", "closeTicketOnTransfer"),
      queryInterface.removeColumn(
        "CompaniesSettings",
        "DirectTicketsToWallets"
      ),
      queryInterface.removeColumn("CompaniesSettings", "notificameHub"),
      queryInterface.removeColumn("CompaniesSettings", "transferMessage"),
      queryInterface.removeColumn(
        "CompaniesSettings",
        "AcceptCallWhatsappMessage"
      ),
      queryInterface.removeColumn(
        "CompaniesSettings",
        "sendQueuePositionMessage"
      )
    ]);
  }
};
