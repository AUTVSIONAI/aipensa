import { QueryInterface } from "sequelize";
import { hash } from "bcryptjs";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error("ADMIN_PASSWORD environment variable is required for seeding");
    }

    return queryInterface.sequelize.transaction(async t => {
      const userExists = await queryInterface.rawSelect(
        "Users",
        {
          where: {
            id: 1
          }
        },
        ["id"]
      );

      if (!userExists) {
        const passwordHash = await hash(adminPassword, 8);
        return queryInterface.bulkInsert(
          "Users",
          [
            {
              name: "Admin",
              email: "admin@admin.com",
              profile: "admin",
              passwordHash,
              companyId: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              super: true
            }
          ],
          { transaction: t }
        );
      }
    });
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", { id: 1 });
  }
};
