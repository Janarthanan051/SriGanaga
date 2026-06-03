const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

async function seed() {
  try {
    await client.connect();
    console.log('Connected to database for seeding...');

    // 1. Seed Suppliers
    const supplier1Id = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    const supplier2Id = 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e';
    await client.query(`
      INSERT INTO public.suppliers (id, name, contact_person, email, phone, materials_supplied, address)
      VALUES 
      ($1, 'AgriCorp Supplies', 'Ramesh Singh', 'ramesh@agricorp.com', '9876543210', 'Raw Wheat, Grains', '123 Agri Lane'),
      ($2, 'PackTech Solutions', 'Sunita Sharma', 'sunita@packtech.com', '9876543211', 'Corrugated Boxes, Plastic Wraps', '456 Pack Street')
      ON CONFLICT (id) DO NOTHING;
    `, [supplier1Id, supplier2Id]);

    // 2. Seed Vendors
    const vendor1Id = 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f';
    const vendor2Id = 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a';
    await client.query(`
      INSERT INTO public.vendors (id, name, contact_person, email, phone, address, outstanding_balance, status)
      VALUES 
      ($1, 'FreshMart Retailers', 'Vijay Kumar', 'vijay@freshmart.com', '9876543212', '789 Fresh Ave', 15000.00, 'active'),
      ($2, 'City Supermarket', 'Anil Gupta', 'anil@citysuper.com', '9876543213', '012 City Road', 0.00, 'active')
      ON CONFLICT (id) DO NOTHING;
    `, [vendor1Id, vendor2Id]);

    // 3. Get first employee ID (for HR data)
    const { rows: employees } = await client.query(`SELECT id FROM public.employees LIMIT 2`);
    const emp1 = employees[0]?.id;
    const emp2 = employees[1]?.id;

    if (emp1) {
      // Seed Attendance
      await client.query(`
        INSERT INTO public.attendance (employee_id, date, status, leave_type)
        VALUES 
        ($1, CURRENT_DATE, 'present', 'none'),
        ($1, CURRENT_DATE - INTERVAL '1 day', 'absent', 'sick')
        ON CONFLICT DO NOTHING
      `, [emp1]);

      // Seed Payroll
      await client.query(`
        INSERT INTO public.payroll (employee_id, month, year, days_present, basic_salary, net_salary, payment_status, allowances, deductions)
        VALUES 
        ($1, '06', EXTRACT(YEAR FROM CURRENT_DATE), 22, 50000, 52000, 'paid', 5000, 3000)
        ON CONFLICT DO NOTHING
      `, [emp1]);
    }

    if (emp2) {
      await client.query(`
        INSERT INTO public.attendance (employee_id, date, status, leave_type)
        VALUES 
        ($1, CURRENT_DATE, 'present', 'none')
        ON CONFLICT DO NOTHING
      `, [emp2]);
      await client.query(`
        INSERT INTO public.payroll (employee_id, month, year, days_present, basic_salary, net_salary, payment_status, allowances, deductions)
        VALUES 
        ($1, '06', EXTRACT(YEAR FROM CURRENT_DATE), 20, 40000, 38000, 'pending', 2000, 4000)
        ON CONFLICT DO NOTHING
      `, [emp2]);
    }

    // 4. Get first product ID (for POs and Orders)
    const { rows: products } = await client.query(`SELECT id FROM public.products LIMIT 2`);
    const prod1 = products[0]?.id;
    
    // 5. Seed Purchase Orders
    if (prod1) {
      const poNum = 'PO-' + Date.now();
      const { rows: poRow } = await client.query(`
        INSERT INTO public.purchase_orders (po_number, supplier_id, total_amount, status)
        VALUES ($1, $2, 25000, 'issued') RETURNING id;
      `, [poNum, supplier1Id]);
      
      const poId = poRow[0].id;
      await client.query(`
        INSERT INTO public.purchase_order_items (po_id, product_id, quantity, unit_price, total_price)
        VALUES ($1, $2, 100, 250, 25000)
      `, [poId, prod1]);

      const ordNum = 'ORD-' + Date.now();
      const { rows: orderRow } = await client.query(`
        INSERT INTO public.orders (order_number, vendor_id, total_amount, status)
        VALUES ($1, $2, 45000, 'pending') RETURNING id;
      `, [ordNum, vendor1Id]);

      const orderId = orderRow[0].id;
      await client.query(`
        INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, total_price)
        VALUES ($1, $2, 50, 900, 45000)
      `, [orderId, prod1]);

      // Seed Logistics
      await client.query(`
        INSERT INTO public.logistics (order_id, vehicle_number, driver_name, status, dispatch_date, vehicle_status, route_frequency)
        VALUES 
        ($1, 'DL-1C-5566', 'Raju', 'in_transit', CURRENT_DATE, 'in_transit', 3)
      `, [orderId]);
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.end();
  }
}

seed();
