const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

async function seed() {
  try {
    await client.connect();
    console.log('Connected to database to seed expenses data...');

    const range = (n) => Array.from({ length: n }, (_, i) => i + 1);

    const categories = ['transport', 'salary', 'maintenance', 'utility', 'miscellaneous'];
    const statuses = ['pending', 'approved', 'rejected', 'approved', 'approved'];

    // Get an auth user ID
    const { rows: users } = await client.query('SELECT id FROM auth.users LIMIT 1');
    const userId = users.length > 0 ? users[0].id : null;

    console.log('Seeding Expenses...');
    for (let i of range(15)) {
      const cat = categories[i % categories.length];
      const stat = statuses[i % statuses.length];
      
      await client.query(`
        INSERT INTO public.expenses (category, amount, description, expense_date, status, approved_by)
        VALUES ($1, $2, $3, CURRENT_DATE - INTERVAL '` + (i * 2) + ` days', $4, $5)
      `, [
        cat,
        Math.floor(Math.random() * 5000) + 500,
        `Regular ${cat} expense #` + i,
        stat,
        stat === 'approved' ? userId : null
      ]);
    }

    console.log('Expenses data seeded successfully!');

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.end();
  }
}

seed();
