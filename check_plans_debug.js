const { Sequelize } = require('sequelize');
const config = require('./backend/src/config/database');

// Adjust config for raw usage if needed, or just use hardcoded credentials for this script if env vars aren't picked up.
// Assuming env vars are set or we can infer.
require('dotenv').config({ path: './backend/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
  }
);

async function checkPlans() {
  try {
    const plans = await sequelize.query("SELECT * FROM Plans", { type: sequelize.QueryTypes.SELECT });
    console.log("Plans found:", JSON.stringify(plans, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

checkPlans();
