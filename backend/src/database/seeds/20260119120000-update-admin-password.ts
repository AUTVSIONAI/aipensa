import { QueryInterface } from "sequelize";
import { hash } from "bcryptjs";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return;
    }

    const passwordHash = await hash(adminPassword, 8);
    
    // Atualiza a senha do usuário admin@admin.com
    await queryInterface.sequelize.query(
      `UPDATE "Users" SET "passwordHash" = :passwordHash WHERE email = :email`,
      {
        replacements: {
          passwordHash,
          email: "admin@admin.com"
        }
      }
    );
  },

  down: async (queryInterface: QueryInterface) => {
    // Não faz nada no rollback
  }
};
