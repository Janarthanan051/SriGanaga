const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

async function seed() {
  try {
    await client.connect();
    console.log('Connected to database to seed inventory data...');

    const range = (n) => Array.from({ length: n }, (_, i) => i + 1);

    // Get an auth user ID
    const { rows: users } = await client.query('SELECT id FROM auth.users LIMIT 1');
    const userId = users.length > 0 ? users[0].id : null;

    // 1. Seed MORE Products
    console.log('Seeding extra Products...');
    const extraProducts = [];
    for (let i of range(5)) {
      const { rows } = await client.query(`
        INSERT INTO public.products (sku, name, category, unit, unit_price, current_stock, product_type)
        VALUES ($1, $2, $3, $4, $5, $6, 'packaging')
        RETURNING id;
      `, ["SKU-PKG-" + Date.now() + "-" + i, "Packaging Material " + i, "Boxes", "box", 25 * i, 5000]);
      extraProducts.push(rows[0].id);
    }

    // Prepare data
    const { rows: allProducts } = await client.query('SELECT id FROM public.products LIMIT 10');
    const { rows: suppliers } = await client.query('SELECT id FROM public.suppliers LIMIT 5');
    const { rows: orders } = await client.query('SELECT id FROM public.orders LIMIT 5');
    const { rows: pos } = await client.query('SELECT id FROM public.purchase_orders LIMIT 5');

    // 2. Seed Stock Inward
    console.log('Seeding Stock Inward...');
    for (let i of range(10)) {
      if (allProducts.length === 0 || suppliers.length === 0) break;
      await client.query(`
        INSERT INTO public.stock_inward (product_id, quantity, supplier_id, batch_number, received_date, invoice_number, notes)
        VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '` + i + ` days', $5, 'Bulk delivery')
      `, [
        allProducts[i % allProducts.length].id, 
        200 + (i * 50), 
        suppliers[i % suppliers.length].id, 
        "INW-BATCH-" + Date.now() + "-" + i, 
        "INV-" + Date.now() + "-" + i
      ]);
    }

    // 3. Seed Stock Outward
    console.log('Seeding Stock Outward...');
    for (let i of range(10)) {
      if (allProducts.length === 0) break;
      await client.query(`
        INSERT INTO public.stock_outward (product_id, quantity, order_id, reason, outward_date, notes)
        VALUES ($1, $2, $3, 'sales_dispatch', CURRENT_DATE - INTERVAL '` + i + ` days', 'Dispatched to customer')
      `, [
        allProducts[i % allProducts.length].id, 
        50 + (i * 10), 
        orders.length > 0 ? orders[i % orders.length].id : null
      ]);
    }

    // 4. Seed MORE GRNs & Warehouse Transfers (just in case they need more visibility)
    if (userId) {
      console.log('Seeding extra GRNs and Transfers...');
      for (let i of range(5)) {
        if (!pos[i]) break;
        const poId = pos[i].id;
        const { rows: poItems } = await client.query("SELECT id, quantity FROM public.purchase_order_items WHERE po_id = $1 LIMIT 1", [poId]);
        if (poItems.length > 0) {
          const { rows: grn } = await client.query(`
            INSERT INTO public.goods_receipts (grn_number, po_id, received_by, status, notes)
            VALUES ($1, $2, $3, 'received', 'Delivered intact')
            ON CONFLICT (grn_number) DO NOTHING
            RETURNING id;
          `, ["GRN-EXTRA-" + Date.now() + "-" + i, poId, userId]);
          if (grn.length > 0) {
            await client.query(`
              INSERT INTO public.goods_receipt_items (grn_id, po_item_id, quantity_received, quantity_accepted, batch_number)
              VALUES ($1, $2, $3, $3, $4)
            `, [grn[0].id, poItems[0].id, poItems[0].quantity, "BATCH-EXTRA-" + Date.now()]);
          }
        }
      }

      for (let i of range(5)) {
        if (allProducts.length === 0) break;
        const { rows: wt } = await client.query(`
          INSERT INTO public.warehouse_transfers (transfer_number, source_warehouse, destination_warehouse, requested_by, status)
          VALUES ($1, 'Storage B', 'Packaging Line', $2, 'completed')
          ON CONFLICT (transfer_number) DO NOTHING
          RETURNING id;
        `, ["WT-EXTRA-" + Date.now() + "-" + i, userId]);

        if (wt.length > 0) {
          await client.query(`
            INSERT INTO public.warehouse_transfer_items (transfer_id, product_id, quantity, batch_number)
            VALUES ($1, $2, $3, 'BATCH-X-123')
          `, [wt[0].id, allProducts[i % allProducts.length].id, 150]);
        }
      }
    }

    // 5. Seed Wastage
    console.log('Seeding Wastage...');
    for (let i of range(10)) {
      if (allProducts.length === 0) break;
      await client.query(`
        INSERT INTO public.wastage (product_id, quantity, reason, wastage_date, notes)
        VALUES ($1, $2, $3, CURRENT_DATE - INTERVAL '` + i + ` days', 'Recorded during quality inspection')
      `, [
        allProducts[i % allProducts.length].id, 
        5 + i, 
        i % 2 === 0 ? 'damaged_in_transit' : 'expired_batch'
      ]);
    }

    console.log('Inventory data seeded successfully!');

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.end();
  }
}

seed();
