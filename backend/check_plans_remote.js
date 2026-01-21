const { Sequelize } = require('sequelize');

// The container environment variables should be available here
console.log('Using DB Config:', {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false
  }
);

async function checkPlans() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Check Plans table
    try {
        const [plans] = await sequelize.query('SELECT * FROM "Plans" ORDER BY id');
        console.log('Plans found:', JSON.stringify(plans, null, 2));
    } catch (e) {
        console.log('Error querying Plans:', e.message);
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

checkPlans();
