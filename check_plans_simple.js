const { Sequelize } = require('sequelize');
const config = require('./backend/src/config/database');

const sequelize = new Sequelize(config);

async function checkPlans() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    const [results, metadata] = await sequelize.query("SELECT * FROM Plans");
    console.log('Plans found:', results);
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

checkPlans();
