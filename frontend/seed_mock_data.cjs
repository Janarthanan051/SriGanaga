const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function seedData() {
  try {
    await client.connect();
    console.log("Connected to database. Starting massive data seeding...");

    console.log("Adding additional mock data (not clearing to preserve FKs)...");

    // 1. Seed Customers
    console.log("Seeding Customers...");
    const customerNames = ["Anand Sweets", "A2B Restaurants", "Grand Snacks", "Sri Krishna Sweets", "Local Bakery", "Fresh Mart", "Daily Needs", "Super Bazaar", "City Foods", "Metro Traders"];
    let customerIds = [];
    for (let i = 0; i < customerNames.length; i++) {
      const res = await client.query(`
        INSERT INTO public.customers (name, phone, billing_address, status) 
        VALUES ($1, $2, $3, 'active') RETURNING id`, 
        [customerNames[i], `98765432${i.toString().padStart(2, '0')}`, `Address for ${customerNames[i]}`]
      );
      customerIds.push(res.rows[0].id);
    }

    // 2. Seed Vendors
    console.log("Seeding Vendors...");
    const vendorNames = ["Ashirvad Flour Mills", "Sugar Suppliers Inc", "Ghee & Dairy Co", "Spice World", "Packaging Solutions Ltd"];
    let vendorIds = [];
    for (let i = 0; i < vendorNames.length; i++) {
      const res = await client.query(`
        INSERT INTO public.vendors (name, address, contact_person, phone) 
        VALUES ($1, 'Mock Address', 'Manager', $2) RETURNING id`, 
        [vendorNames[i], `88888888${i.toString().padStart(2, '0')}`]
      );
      vendorIds.push(res.rows[0].id);
    }

    // 3. Seed Products (Finished Goods)
    console.log("Seeding Products...");
    const sweets = [
      { name: "Motichoor Laddoo", price: 250, unit: "kg", category: "Sweets" },
      { name: "Kaju Katli", price: 800, unit: "kg", category: "Premium Sweets" },
      { name: "Jalebi", price: 150, unit: "kg", category: "Sweets" },
      { name: "Gulab Jamun", price: 200, unit: "kg", category: "Sweets" },
      { name: "Mysore Pak", price: 300, unit: "kg", category: "Sweets" },
      { name: "Soan Papdi", price: 220, unit: "kg", category: "Sweets" },
      { name: "Bombay Mixture", price: 180, unit: "kg", category: "Snacks" },
      { name: "Aloo Bhujia", price: 160, unit: "kg", category: "Snacks" },
      { name: "Kara Boondi", price: 150, unit: "kg", category: "Snacks" },
      { name: "Ribbon Pakoda", price: 170, unit: "kg", category: "Snacks" },
      { name: "Murukku", price: 160, unit: "kg", category: "Snacks" },
      { name: "Thattai", price: 180, unit: "kg", category: "Snacks" }
    ];
    let productIds = [];
    for (const p of sweets) {
      const res = await client.query(`
        INSERT INTO public.products (name, category, sku, unit, unit_price, product_type) 
        VALUES ($1, $2, $3, $4, $5, 'finished_good') RETURNING id`, 
        [p.name, p.category, `SKU-${Math.floor(Math.random()*10000)}`, p.unit, p.price]
      );
      productIds.push({ id: res.rows[0].id, price: p.price });
    }

    // 4. Seed Sales Orders (Last 30 Days)
    console.log("Seeding Sales Orders...");
    const statuses = ['delivered', 'delivered', 'delivered', 'shipped', 'processing', 'pending'];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    for (let i = 0; i < 150; i++) {
      const orderDate = generateRandomDate(thirtyDaysAgo, now);
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const orderNum = `ORD-SEED-${Math.floor(Math.random() * 99999)}-${i.toString().padStart(4, '0')}`;
      
      const orderRes = await client.query(`
        INSERT INTO public.sales_orders (order_number, customer_id, status, total_amount, order_date, created_at)
        VALUES ($1, $2, $3, 0, $4, $5) RETURNING id`,
        [orderNum, customerId, status, orderDate.toISOString().split('T')[0], orderDate]
      );
      const orderId = orderRes.rows[0].id;
      
      // Items per order
      let totalAmount = 0;
      const numItems = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < numItems; j++) {
        const prod = productIds[Math.floor(Math.random() * productIds.length)];
        const qty = Math.floor(Math.random() * 10) + 1;
        const lineTotal = qty * prod.price;
        totalAmount += lineTotal;
        
        await client.query(`
          INSERT INTO public.sales_order_items (sales_order_id, product_id, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5)`,
          [orderId, prod.id, qty, prod.price, lineTotal]
        );
      }
      
      await client.query(`UPDATE public.sales_orders SET total_amount = $1 WHERE id = $2`, [totalAmount, orderId]);
    }

    // 5. Seed Employees
    console.log("Seeding Employees...");
    let employeeIds = [];
    for (let i = 1; i <= 15; i++) {
      const email = `worker${i}@sriganga.com`;
      const phone = `99999999${i.toString().padStart(2, '0')}`;
      const res = await client.query(`
        INSERT INTO public.employees (employee_id, first_name, last_name, email, phone, joining_date, department, position, salary, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active') RETURNING id`,
        [`EMP-${i.toString().padStart(3, '0')}`, `Worker`, `${i}`, email, phone, new Date().toISOString().split('T')[0], i % 3 === 0 ? 'Logistics' : 'Production', 'Staff', 15000 + (Math.random() * 10000)]
      );
      employeeIds.push(res.rows[0].id);
    }

    // 6. Seed Attendance (Last 7 days for 15 employees = 105 records)
    console.log("Seeding Attendance...");
    for (let d = 0; d < 7; d++) {
      const attDate = new Date(now.getTime() - (d * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      for (const empId of employeeIds) {
        const status = Math.random() > 0.1 ? 'present' : 'absent';
        await client.query(`
          INSERT INTO public.attendance (employee_id, date, status)
          VALUES ($1, $2, $3)`,
          [empId, attDate, status]
        );
      }
    }

    console.log("✅ Seed completed successfully!");

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await client.end();
  }
}

seedData();
