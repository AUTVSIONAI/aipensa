import sequelize from "../database";

export const ensureCompaniesSettingsColumns = async () => {
  const qi = sequelize.getQueryInterface();
  try {
    const tableInfo = await qi.describeTable("CompaniesSettings");

    if (!tableInfo["closeTicketOnTransfer"]) {
      await qi.addColumn("CompaniesSettings", "closeTicketOnTransfer", {
        type: "BOOLEAN",
        allowNull: true,
        defaultValue: false
      });
    }

    if (!tableInfo["DirectTicketsToWallets"]) {
      await qi.addColumn("CompaniesSettings", "DirectTicketsToWallets", {
        type: "BOOLEAN",
        allowNull: true,
        defaultValue: false
      });
    }

    if (!tableInfo["notificameHub"]) {
      await qi.addColumn("CompaniesSettings", "notificameHub", {
        type: "TEXT",
        allowNull: true
      });
    }

    if (!tableInfo["transferMessage"]) {
      await qi.addColumn("CompaniesSettings", "transferMessage", {
        type: "TEXT",
        allowNull: true
      });
    }

    if (!tableInfo["AcceptCallWhatsappMessage"]) {
      await qi.addColumn("CompaniesSettings", "AcceptCallWhatsappMessage", {
        type: "TEXT",
        allowNull: true
      });
    }

    if (!tableInfo["sendQueuePositionMessage"]) {
      await qi.addColumn("CompaniesSettings", "sendQueuePositionMessage", {
        type: "TEXT",
        allowNull: true
      });
    }

    if (!tableInfo["enableAutoStatus"]) {
      await qi.addColumn("CompaniesSettings", "enableAutoStatus", {
        type: "VARCHAR(255)",
        allowNull: true,
        defaultValue: "disabled"
      });
    }
  } catch (err) {
    // silencioso para não travar o boot; logs mínimos
    // eslint-disable-next-line no-console
    console.error(
      "[ensureCompaniesSettingsColumns] Falha ao garantir colunas:",
      err
    );
  }
};
