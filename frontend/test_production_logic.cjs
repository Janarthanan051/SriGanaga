const { Client } = require('pg');
const assert = require('assert');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

async function runTests() {
  console.log('--- Starting TDD Database Tests for Phase 3 ---');
  try {
    await client.connect();

    // Test Case 1: Check if production_orders table exists
    console.log('Test 1: Check production_orders schema...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'production_orders'
      );
    `);
    const tableExists = tableCheck.rows[0].exists;
    assert.strictEqual(tableExists, true, 'production_orders table should exist');
    console.log('✅ Test 1 Passed');

    // Test Case 2: Check if batches table exists
    console.log('Test 2: Check batches schema...');
    const batchesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'batches'
      );
    `);
    const batchesExists = batchesCheck.rows[0].exists;
    assert.strictEqual(batchesExists, true, 'batches table should exist');
    console.log('✅ Test 2 Passed');

    // Test Case 3: Check if qc_reports table exists
    console.log('Test 3: Check qc_reports schema...');
    const qcCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'qc_reports'
      );
    `);
    const qcExists = qcCheck.rows[0].exists;
    assert.strictEqual(qcExists, true, 'qc_reports table should exist');
    console.log('✅ Test 3 Passed');

    console.log('🎉 All TDD Database Tests Passed!');
  } catch (err) {
    console.error('❌ Test Failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runTests();
