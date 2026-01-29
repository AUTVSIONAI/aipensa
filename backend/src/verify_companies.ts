import sequelize from "./database/index";
import Company from "./models/Company";
import Plan from "./models/Plan";
import Setting from "./models/Setting";
import dotenv from "dotenv";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

(async () => {
  try {
    // Wait for connection
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    const companies = await Company.findAll({
      include: [{ model: Plan, as: "plan", required: false }]
    });

    console.log(`Total Companies: ${companies.length}`);
    companies.forEach(c => {
      console.log(
        `ID: ${c.id}, Name: ${c.name}, Plan: ${
          c.plan?.name || "None"
        }, Status: ${c.status}`
      );
    });

    const settings = await Setting.findAll();
    console.log(`Total Settings: ${settings.length}`);
    settings.forEach(s => {
      console.log(
        `Key: ${s.key}, Value: ${s.value}, CompanyId: ${s.companyId}`
      );
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  } finally {
    await sequelize.close();
  }
})();
