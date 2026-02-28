const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Adjust path to .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Connecting to DB...');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT) || 5433,
});

(async () => {
  try {
    await client.connect();
    console.log('Connected to DB');

    // Check Companies
    const res = await client.query('SELECT count(*) from "Companies"');
    console.log('Total Companies:', res.rows[0].count);
    
    const companies = await client.query('SELECT id, name, "planId", "createdAt" from "Companies" ORDER BY "createdAt" DESC LIMIT 5');
    console.log('Recent Companies:', companies.rows);

    // Check Users
    const users = await client.query('SELECT id, name, email, "companyId", "startWork", "endWork", "createdAt" from "Users" ORDER BY "createdAt" DESC LIMIT 5');
    console.log('Recent Users:', users.rows);

    // Check Settings for API keys
    const res2 = await client.query('SELECT key, value, "companyId" from "Settings" WHERE key IN (\'stripeprivatekey\', \'openAiApiKey\', \'openaikeyaudio\')');
    console.log('Relevant Settings:', res2.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
})();
