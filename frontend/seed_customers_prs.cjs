const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

async function runSeed() {
  try {
    await client.connect();
    console.log('Connected to database. Starting seed for Customers & PRs...');

    // 1. Seed Customers
    const customers = [
      {
        name: 'Apex Supermarkets Ltd',
        gst_number: '29ABCDE1234F1Z5',
        contact_person: 'Rajesh Kumar',
        phone: '+91-9876543210',
        email: 'rajesh.purchasing@apexsuper.com',
        billing_address: '123 MG Road, Bangalore, KA, 560001',
        shipping_address: 'Warehouse A, Peenya Ind Area, Bangalore, KA, 560058',
        outstanding_balance: 45000.00,
        credit_limit: 100000.00,
        status: 'active'
      },
      {
        name: 'FreshMart Stores',
        gst_number: '33FGHIJ5678K1Z9',
        contact_person: 'Priya Sharma',
        phone: '+91-8765432109',
        email: 'priya@freshmart.in',
        billing_address: '45 Anna Salai, Chennai, TN, 600002',
        shipping_address: '45 Anna Salai, Chennai, TN, 600002',
        outstanding_balance: 12000.50,
        credit_limit: 50000.00,
        status: 'active'
      },
      {
        name: 'Global Foods Wholesalers',
        gst_number: '27KLMNO9012P1Z3',
        contact_person: 'Amit Patel',
        phone: '+91-7654321098',
        email: 'amit.patel@globalfoods.co.in',
        billing_address: '78 Nariman Point, Mumbai, MH, 400021',
        shipping_address: 'APMC Market, Vashi, Navi Mumbai, MH, 400703',
        outstanding_balance: 150000.00,
        credit_limit: 200000.00,
        status: 'active'
      },
      {
        name: 'QuickBite Restaurants',
        gst_number: '07PQRST3456U1Z7',
        contact_person: 'Sanjay Gupta',
        phone: '+91-6543210987',
        email: 'sanjay@quickbite.in',
        billing_address: 'Connaught Place, New Delhi, DL, 110001',
        shipping_address: 'Connaught Place, New Delhi, DL, 110001',
        outstanding_balance: 0.00,
        credit_limit: 25000.00,
        status: 'inactive'
      },
      {
        name: 'Sunrise Bakeries',
        gst_number: '36UVWXY7890Z1Z1',
        contact_person: 'Sneha Reddy',
        phone: '+91-5432109876',
        email: 'sneha.reddy@sunrisebakes.com',
        billing_address: 'Hitec City, Hyderabad, TS, 500081',
        shipping_address: 'Hitec City, Hyderabad, TS, 500081',
        outstanding_balance: 8500.25,
        credit_limit: 30000.00,
        status: 'active'
      }
    ];

    console.log('Seeding Customers...');
    for (const cust of customers) {
      await client.query(`
        INSERT INTO public.customers (
          name, gst_number, contact_person, phone, email, 
          billing_address, shipping_address, outstanding_balance, credit_limit, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING
      `, [
        cust.name, cust.gst_number, cust.contact_person, cust.phone, cust.email,
        cust.billing_address, cust.shipping_address, cust.outstanding_balance, cust.credit_limit, cust.status
      ]);
    }
    console.log('Customers seeded successfully.');

    // 2. Seed Purchase Requests
    console.log('Fetching dependencies for Purchase Requests...');
    
    // Get a user ID for requested_by
    const userRes = await client.query('SELECT id FROM auth.users LIMIT 1');
    if (userRes.rows.length === 0) {
      console.log('No users found to seed purchase requests. Skipping PRs.');
      return;
    }
    const userId = userRes.rows[0].id;

    // Get some products (Raw Materials) for items
    const prodRes = await client.query("SELECT id, name, unit_price FROM public.products WHERE category IN ('Raw Material', 'Packaging') LIMIT 5");
    if (prodRes.rows.length === 0) {
      console.log('No raw materials found to seed purchase request items.');
      return;
    }
    const products = prodRes.rows;

    console.log('Seeding Purchase Requests...');
    
    const prs = [
      { pr_number: 'PR-2026-001', department: 'Production', status: 'approved', daysOff: 5, notes: 'Monthly raw material replenishment' },
      { pr_number: 'PR-2026-002', department: 'Packaging', status: 'pending', daysOff: 10, notes: 'Need more corrugated boxes' },
      { pr_number: 'PR-2026-003', department: 'Maintenance', status: 'rejected', daysOff: 1, notes: 'Spare parts for milling machine' },
      { pr_number: 'PR-2026-004', department: 'Production', status: 'fulfilled', daysOff: -5, notes: 'Emergency wheat grain order' },
      { pr_number: 'PR-2026-005', department: 'R&D', status: 'pending', daysOff: 15, notes: 'Specialty grains for new product line' }
    ];

    for (const pr of prs) {
      // Check if PR exists
      const exists = await client.query('SELECT id FROM public.purchase_requests WHERE pr_number = $1', [pr.pr_number]);
      if (exists.rows.length > 0) continue;

      const reqDate = new Date();
      reqDate.setDate(reqDate.getDate() + pr.daysOff);

      const prInsert = await client.query(`
        INSERT INTO public.purchase_requests (
          pr_number, requested_by, department, status, required_date, notes
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        pr.pr_number, userId, pr.department, pr.status, reqDate.toISOString(), pr.notes
      ]);
      const prId = prInsert.rows[0].id;

      // Insert 1-3 items for each PR
      const numItems = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numItems; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 500) + 50;
        
        await client.query(`
          INSERT INTO public.purchase_request_items (
            pr_id, product_id, quantity, unit
          ) VALUES ($1, $2, $3, $4)
        `, [
          prId, product.id, qty, 'kg'
        ]);
      }
    }
    
    console.log('Purchase Requests seeded successfully.');

  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await client.end();
  }
}

runSeed();
