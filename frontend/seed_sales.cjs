const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

async function runSeed() {
  try {
    await client.connect();
    console.log('Connected to database. Seeding Sales Orders...');

    // 1. Get Customers
    const custRes = await client.query('SELECT id, name FROM public.customers');
    if (custRes.rows.length === 0) {
      console.log('No customers found. Skipping.');
      return;
    }
    const customers = custRes.rows;

    // 2. Get Sales Rep (Any User)
    const userRes = await client.query('SELECT id FROM auth.users LIMIT 1');
    const salesRepId = userRes.rows.length > 0 ? userRes.rows[0].id : null;

    // 3. Get Products (Finished Goods)
    const prodRes = await client.query("SELECT id, name, unit_price FROM public.products WHERE category IN ('Flour', 'Semolina', 'Snacks', 'Bran', 'oil') LIMIT 10");
    if (prodRes.rows.length === 0) {
      console.log('No finished goods found. Skipping.');
      return;
    }
    const products = prodRes.rows;

    // 4. Generate Sales Orders
    for (const customer of customers) {
      // 2-5 orders per customer
      const numOrders = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < numOrders; i++) {
        const orderNum = `SO-2026-${Math.floor(Math.random() * 90000) + 10000}`;
        const daysAgo = Math.floor(Math.random() * 60); // past 60 days
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - daysAgo);

        // statuses
        const statuses = ['pending', 'processing', 'shipped', 'delivered'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // insert order (total_amount updated later)
        const soInsert = await client.query(`
          INSERT INTO public.sales_orders (
            order_number, customer_id, sales_rep_id, status, order_date, notes
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [
          orderNum, customer.id, salesRepId, status, orderDate.toISOString(), 'Seeded sales order'
        ]);
        
        const soId = soInsert.rows[0].id;
        let totalAmount = 0;

        // generate items
        const numItems = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < numItems; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const qty = Math.floor(Math.random() * 50) + 10;
          const unitPrice = product.unit_price || (Math.random() * 500 + 100);
          const totalPrice = qty * unitPrice;

          await client.query(`
            INSERT INTO public.sales_order_items (
              sales_order_id, product_id, quantity, unit_price, total_price
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            soId, product.id, qty, unitPrice, totalPrice
          ]);

          totalAmount += totalPrice;
        }

        // update order total
        await client.query(`
          UPDATE public.sales_orders SET total_amount = $1 WHERE id = $2
        `, [totalAmount, soId]);
      }
    }

    console.log('Sales Orders seeded successfully.');

  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await client.end();
  }
}

runSeed();
