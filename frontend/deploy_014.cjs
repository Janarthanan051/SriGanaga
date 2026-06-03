const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

async function runDeploy() {
  try {
    await client.connect();
    console.log('Connected to database.');
    
    const sqlPath = path.join(__dirname, '../backend/supabase/migrations/014_sales_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    console.log('014_sales_schema deployed and schema reloaded!');
  } catch (err) {
    console.error('Error deploying migration:', err);
  } finally {
    await client.end();
  }
}

runDeploy();
