const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

async function seed() {
  try {
    await client.connect();
    console.log('Connected to database to seed production & inventory data...');

    // 0. Get an auth user ID
    const { rows: users } = await client.query('SELECT id FROM auth.users LIMIT 1');
    if (users.length === 0) throw new Error("No users found in auth.users");
    const userId = users[0].id;

    // Helper
    const range = (n) => Array.from({ length: n }, (_, i) => i + 1);

    // 1. Seed 10 Customers
    console.log('Seeding Customers...');
    for (let i of range(10)) {
      await client.query(`
        INSERT INTO public.customers (name, gst_number, contact_person, phone, email, billing_address, outstanding_balance)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ["Customer " + i, "GST12345" + i, "Contact " + i, "998877665" + i, "cust" + i + "@example.com", "Address " + i, i * 1500]);
    }

    // Prepare data for next steps
    const { rows: products } = await client.query("SELECT id FROM public.products WHERE product_type = 'raw_material' LIMIT 5");
    const { rows: boms } = await client.query("SELECT id, product_id FROM public.bill_of_materials LIMIT 5");
    const { rows: pos } = await client.query("SELECT id FROM public.purchase_orders LIMIT 5");

    // 2. Seed Purchase Requests
    console.log('Seeding Purchase Requests...');
    const prIds = [];
    for (let i of range(10)) {
      const { rows: pr } = await client.query(`
        INSERT INTO public.purchase_requests (pr_number, requested_by, department, status, required_date, notes)
        VALUES ($1, $2, $3, $4, CURRENT_DATE + INTERVAL '7 days', 'Test PR')
        RETURNING id;
      `, ["PR-" + Date.now() + "-" + i, userId, "Production", i % 2 === 0 ? "approved" : "pending"]);
      prIds.push(pr[0].id);

      if (products.length > 0) {
        await client.query(`
          INSERT INTO public.purchase_request_items (pr_id, product_id, quantity, unit)
          VALUES ($1, $2, $3, 'kg')
        `, [pr[0].id, products[i % products.length].id, 100 * i]);
      }
    }

    // 3. Seed Goods Receipts (GRN)
    console.log('Seeding GRNs...');
    for (let i of range(5)) {
      if (!pos[i]) break;
      const poId = pos[i].id;
      // Get a PO item to link to
      const { rows: poItems } = await client.query("SELECT id, quantity FROM public.purchase_order_items WHERE po_id = $1 LIMIT 1", [poId]);
      
      if (poItems.length > 0) {
        const { rows: grn } = await client.query(`
          INSERT INTO public.goods_receipts (grn_number, po_id, received_by, status, notes)
          VALUES ($1, $2, $3, 'received', 'Delivered intact')
          RETURNING id;
        `, ["GRN-" + Date.now() + "-" + i, poId, userId]);

        await client.query(`
          INSERT INTO public.goods_receipt_items (grn_id, po_item_id, quantity_received, quantity_accepted, batch_number)
          VALUES ($1, $2, $3, $3, $4)
        `, [grn[0].id, poItems[0].id, poItems[0].quantity, "BATCH-RM-" + Date.now()]);
      }
    }

    // 4. Seed Warehouse Transfers
    console.log('Seeding Warehouse Transfers...');
    for (let i of range(10)) {
      if (products.length === 0) break;
      const { rows: wt } = await client.query(`
        INSERT INTO public.warehouse_transfers (transfer_number, source_warehouse, destination_warehouse, requested_by, status)
        VALUES ($1, 'Main Warehouse', 'Production Line 1', $2, 'completed')
        RETURNING id;
      `, ["WT-" + Date.now() + "-" + i, userId]);

      await client.query(`
        INSERT INTO public.warehouse_transfer_items (transfer_id, product_id, quantity, batch_number)
        VALUES ($1, $2, $3, 'BATCH-123')
      `, [wt[0].id, products[i % products.length].id, 50]);
    }

    // 5. Seed Production Orders
    console.log('Seeding Production Orders...');
    const prodOrderIds = [];
    for (let i of range(10)) {
      if (boms.length === 0) break;
      const bom = boms[i % boms.length];
      const { rows: po } = await client.query(`
        INSERT INTO public.production_orders (order_number, bom_id, target_quantity, status, supervisor_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `, ["PROD-" + Date.now() + "-" + i, bom.id, 500, i % 2 === 0 ? 'completed' : 'in_progress', userId]);
      prodOrderIds.push({ id: po[0].id, productId: bom.product_id });
    }

    // 6. Seed Batches
    console.log('Seeding Batches...');
    const batchIds = [];
    for (let i = 0; i < prodOrderIds.length; i++) {
      const pOrder = prodOrderIds[i];
      const { rows: batch } = await client.query(`
        INSERT INTO public.batches (batch_code, production_order_id, product_id, manufacturing_date, expiry_date, quantity, status)
        VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE + INTERVAL '180 days', 500, 'quarantine')
        RETURNING id;
      `, ["BATCH-" + Date.now() + "-" + i, pOrder.id, pOrder.productId]);
      batchIds.push(batch[0].id);
    }

    // 7. Seed Quality Control (QC)
    console.log('Seeding QC Reports...');
    for (let i = 0; i < batchIds.length; i++) {
      await client.query(`
        INSERT INTO public.qc_reports (report_number, batch_id, inspector_id, status, parameters, comments)
        VALUES ($1, $2, $3, $4, $5, 'Looks good')
      `, [
        "QC-" + Date.now() + "-" + i, 
        batchIds[i], 
        userId, 
        i % 4 === 0 ? 'rejected' : 'passed', 
        JSON.stringify({ acidity: 0.5, moisture: 12.5 })
      ]);
      
      if (i % 4 !== 0) {
        // Update batch to passed
        await client.query(`UPDATE public.batches SET status = 'passed' WHERE id = $1`, [batchIds[i]]);
      }
    }

    console.log('All sections seeded successfully!');

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.end();
  }
}

seed();
