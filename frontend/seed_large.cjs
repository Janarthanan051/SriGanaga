const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

async function seed() {
  try {
    await client.connect();
    console.log('Connected to database for large seeding...');

    const range = (n) => Array.from({ length: n }, (_, i) => i + 1);

    const empIds = [];
    for (let i of range(10)) {
      const { rows } = await client.query(`
        INSERT INTO public.employees (employee_id, first_name, last_name, email, phone, department, position, joining_date, salary, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8, 'active')
        ON CONFLICT (email) DO NOTHING RETURNING id;
      `, ["EMP-" + Date.now() + "-" + i, "EmpFirst" + i, "EmpLast" + i, "emp" + i + Date.now() + "@example.com", "98765432" + i.toString().padStart(2, '0'), 'Production', 'Worker', 20000 + (i * 1000)]);
      if (rows.length > 0) empIds.push(rows[0].id);
    }
    
    if (empIds.length < 10) {
      const { rows } = await client.query('SELECT id FROM public.employees LIMIT 10');
      empIds.push(...rows.map(r => r.id));
    }

    const supplierIds = [];
    for (let i of range(10)) {
      const { rows } = await client.query(`
        INSERT INTO public.suppliers (name, contact_person, email, phone, address, materials_supplied)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `, ["Supplier " + i + " Co", "Contact " + i, "supp" + i + Date.now() + "@example.com", "12345678" + i.toString().padStart(2, '0'), "Address " + i, 'Raw Materials']);
      supplierIds.push(rows[0].id);
    }

    const vendorIds = [];
    for (let i of range(10)) {
      const { rows } = await client.query(`
        INSERT INTO public.vendors (name, contact_person, email, phone, address, outstanding_balance, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
        RETURNING id;
      `, ["Vendor " + i + " Ltd", "VContact " + i, "vend" + i + Date.now() + "@example.com", "87654321" + i.toString().padStart(2, '0'), "VAddress " + i, 500 * i]);
      vendorIds.push(rows[0].id);
    }

    const fgIds = [];
    const rmIds = [];
    for (let i of range(10)) {
      const type = i <= 5 ? 'finished_good' : 'raw_material';
      const unit = i <= 5 ? 'box' : 'kg';
      const { rows } = await client.query(`
        INSERT INTO public.products (sku, name, category, unit, unit_price, current_stock, product_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
      `, ["SKU-" + Date.now() + "-" + i, "Product " + i, type === 'finished_good' ? 'Snacks' : 'Ingredients', unit, 100 * i, 1000, type]);
      if (type === 'finished_good') fgIds.push(rows[0].id);
      else rmIds.push(rows[0].id);
    }

    const bomIds = [];
    for (let i of range(10)) {
      const fgId = fgIds[i % fgIds.length];
      const { rows } = await client.query(`
        INSERT INTO public.bill_of_materials (product_id, bom_number, expected_yield, yield_unit)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
      `, [fgId, "BOM-" + Date.now() + "-" + i, 1.0, 'box']);
      bomIds.push(rows[0].id);

      await client.query(`
        INSERT INTO public.bom_items (bom_id, raw_material_id, quantity_required, unit)
        VALUES ($1, $2, $3, $4), ($1, $5, $6, $7)
      `, [
        rows[0].id, 
        rmIds[0 % rmIds.length], 2.5, 'kg',
        rmIds[1 % rmIds.length], 1.5, 'kg'
      ]);
    }

    for (let i of range(10)) {
      const suppId = supplierIds[i % supplierIds.length];
      const rmId = rmIds[i % rmIds.length];
      const poNum = "PO-" + Date.now() + "-" + i;
      const { rows: poRow } = await client.query(`
        INSERT INTO public.purchase_orders (po_number, supplier_id, total_amount, status)
        VALUES ($1, $2, $3, 'issued') RETURNING id;
      `, [poNum, suppId, 5000 + (i * 100)]);
      
      await client.query(`
        INSERT INTO public.purchase_order_items (po_id, product_id, quantity, unit_price, total_price)
        VALUES ($1, $2, 100, 50, 5000)
      `, [poRow[0].id, rmId]);
    }

    for (let i of range(10)) {
      const vendId = vendorIds[i % vendorIds.length];
      const fgId = fgIds[i % fgIds.length];
      const ordNum = "ORD-" + Date.now() + "-" + i;
      const { rows: orderRow } = await client.query(`
        INSERT INTO public.orders (order_number, vendor_id, total_amount, status)
        VALUES ($1, $2, $3, 'confirmed') RETURNING id;
      `, [ordNum, vendId, 15000 + (i * 500)]);

      const orderId = orderRow[0].id;
      await client.query(`
        INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, total_price)
        VALUES ($1, $2, 50, 300, 15000)
      `, [orderId, fgId]);

      await client.query(`
        INSERT INTO public.logistics (order_id, vehicle_number, driver_name, status, dispatch_date, vehicle_status, route_frequency)
        VALUES ($1, $2, $3, 'in_transit', CURRENT_DATE, 'in_transit', $4)
      `, [orderId, "DL-1C-50" + i, "Driver " + i, (i % 3) + 1]);
    }

    for (let i = 0; i < empIds.length && i < 10; i++) {
      const empId = empIds[i];
      for (let d = 0; d < 5; d++) {
        await client.query(`
          INSERT INTO public.attendance (employee_id, date, status, leave_type)
          VALUES ($1, CURRENT_DATE - INTERVAL '` + d + ` days', 'present', 'none')
          ON CONFLICT DO NOTHING;
        `, [empId]);
      }
      
      await client.query(`
        INSERT INTO public.payroll (employee_id, month, year, days_present, basic_salary, net_salary, payment_status, allowances, deductions)
        VALUES ($1, '06', EXTRACT(YEAR FROM CURRENT_DATE), 22, $2, $3, 'paid', 2000, 1000)
        ON CONFLICT DO NOTHING;
      `, [empId, 20000 + (i * 1000), 21000 + (i * 1000)]);
    }

    console.log('Large Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.end();
  }
}

seed();
