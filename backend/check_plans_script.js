require('ts-node/register');
const { Sequelize } = require('sequelize');
const config = require('./src/config/database');

// Adjust config if it is using process.env which might not be loaded if we don't use dotenv
require('dotenv').config({ path: '.env' });

// The config file usually exports an object or uses process.env. 
// Let's verify if we need to manually construct the config if the file depends on loaded env vars.
const dbConfig = {
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'whaticket',
  port: process.env.DB_PORT || 3306,
};

console.log('DB Config:', dbConfig);

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  logging: false
});

async function checkPlans() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    const [results, metadata] = await sequelize.query("SELECT * FROM Plans");
    console.log('Plans found:', JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

checkPlans();
