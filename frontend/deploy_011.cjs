const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

const migrationSql = fs.readFileSync('../backend/supabase/migrations/011_production_schema.sql', 'utf8');

async function deploy() {
  try {
    await client.connect();
    console.log('Connected to database.');
    await client.query(migrationSql);
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log('Migration 011 deployed and schema reloaded!');
  } catch (err) {
    console.error('Error deploying migration:', err);
  } finally {
    await client.end();
  }
}

deploy();
