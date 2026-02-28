import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Users indexes
    await queryInterface.addIndex("Users", ["email"], {
      name: "idx_users_email",
      unique: false
    }).catch(() => {});

    await queryInterface.addIndex("Users", ["companyId"], {
      name: "idx_users_company_id"
    }).catch(() => {});

    // Settings index
    await queryInterface.addIndex("Settings", ["companyId", "key"], {
      name: "idx_settings_company_key"
    }).catch(() => {});

    // Invoices index
    await queryInterface.addIndex("Invoices", ["companyId"], {
      name: "idx_invoices_company_id"
    }).catch(() => {});

    // Whatsapps indexes
    await queryInterface.addIndex("Whatsapps", ["companyId"], {
      name: "idx_whatsapps_company_id"
    }).catch(() => {});

    await queryInterface.addIndex("Whatsapps", ["token"], {
      name: "idx_whatsapps_token"
    }).catch(() => {});

    // CompaniesSettings index
    await queryInterface.addIndex("CompaniesSettings", ["companyId"], {
      name: "idx_companies_settings_company_id"
    }).catch(() => {});
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("Users", "idx_users_email").catch(() => {});
    await queryInterface.removeIndex("Users", "idx_users_company_id").catch(() => {});
    await queryInterface.removeIndex("Settings", "idx_settings_company_key").catch(() => {});
    await queryInterface.removeIndex("Invoices", "idx_invoices_company_id").catch(() => {});
    await queryInterface.removeIndex("Whatsapps", "idx_whatsapps_company_id").catch(() => {});
    await queryInterface.removeIndex("Whatsapps", "idx_whatsapps_token").catch(() => {});
    await queryInterface.removeIndex("CompaniesSettings", "idx_companies_settings_company_id").catch(() => {});
  }
};
