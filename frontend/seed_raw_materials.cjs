const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

async function seedRawMaterials() {
  try {
    await client.connect();
    
    const rawMaterials = [
      {
        sku: 'RM-WHEAT-01',
        name: 'Raw Wheat Grain',
        category: 'Raw Material',
        unit: 'kg',
        current_stock: 5000,
        reorder_level: 1000,
        unit_price: 25.00,
        product_type: 'raw_material'
      },
      {
        sku: 'RM-SUGAR-01',
        name: 'Refined Sugar',
        category: 'Raw Material',
        unit: 'kg',
        current_stock: 200,
        reorder_level: 50,
        unit_price: 45.00,
        product_type: 'raw_material'
      },
      {
        sku: 'RM-WATER-01',
        name: 'Filtered Water',
        category: 'Raw Material',
        unit: 'L',
        current_stock: 10000,
        reorder_level: 1000,
        unit_price: 0.10,
        product_type: 'raw_material'
      }
    ];

    for (const rm of rawMaterials) {
      await client.query(`
        INSERT INTO public.products (sku, name, category, unit, current_stock, reorder_level, unit_price, product_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (sku) DO NOTHING;
      `, [rm.sku, rm.name, rm.category, rm.unit, rm.current_stock, rm.reorder_level, rm.unit_price, rm.product_type]);
    }

    console.log('Successfully seeded Raw Materials!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.end();
  }
}

seedRawMaterials();
