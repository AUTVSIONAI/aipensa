const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Adjust path to .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('DB Config:', {
    user: process.env.DB_USER || 'zapcash_user',
    host: 'localhost', // Force localhost for local check
    database: process.env.DB_NAME || 'zapcash_db',
    port: 5433 // Force 5433 from .env observation
});

const client = new Client({
  user: process.env.DB_USER || 'zapcash_user',
  host: 'localhost',
  database: process.env.DB_NAME || 'zapcash_db',
  password: process.env.DB_PASS || 'zapcash_secure_password',
  port: 5433,
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
