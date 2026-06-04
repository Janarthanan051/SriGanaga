const { Client } = require('pg');

const pgClient = new Client({
  connectionString: 'postgresql://postgres.dpajmriuqjrecpnfusyp:6b9NyulUlmOPzgZh@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres'
});

const USERS = [
  { email: 'admin@sriganga.com', password: 'Admin@123', role: 'admin' },
  { email: 'super_admin@sriganga.com', password: 'superadmin@123', role: 'super_admin' },
  { email: 'owner@sriganga.com', password: 'owner@123', role: 'owner' },
  { email: 'manager@sriganga.com', password: 'manager@123', role: 'manager' },
  { email: 'hr_manager@sriganga.com', password: 'hrmanager@123', role: 'hr_manager' },
  { email: 'warehouse_manager@sriganga.com', password: 'warehousemanager@123', role: 'warehouse_manager' },
  { email: 'accountant@sriganga.com', password: 'accountant@123', role: 'accountant' },
  { email: 'vendor_manager@sriganga.com', password: 'vendormanager@123', role: 'vendor_manager' },
  { email: 'production_manager@sriganga.com', password: 'productionmanager@123', role: 'production_manager' },
  { email: 'store_keeper@sriganga.com', password: 'storekeeper@123', role: 'store_keeper' },
  { email: 'sales_executive@sriganga.com', password: 'salesexecutive@123', role: 'sales_executive' }
];

async function fixUsers() {
  try {
    await pgClient.connect();
    console.log('Connected to DB');

    // Make sure pgcrypto is enabled (it should be in Supabase)
    await pgClient.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    
    // First, fix the CHECK constraint to allow ALL roles
    try {
        await pgClient.query('ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check');
        const allRoles = USERS.map(u => "'" + u.role + "'").join(', ');
        await pgClient.query("ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN (" + allRoles + ", 'logistics_manager', 'employee'))");
        console.log('Relaxed role constraint successfully');
    } catch(err) {
        console.error('Failed to update constraint:', err.message);
    }

    for (const u of USERS) {
      // Upsert into auth.users (matching by email is tricky without ID, so let's do an UPDATE, then if rowcount=0, INSERT)
      const res = await pgClient.query("UPDATE auth.users SET encrypted_password = crypt($1, gen_salt('bf')), email_confirmed_at = now() WHERE email = $2 RETURNING id", [u.password, u.email]);
      
      let userId;
      if (res.rows.length > 0) {
        userId = res.rows[0].id;
        console.log('Updated password for existing user ' + u.email);
      } else {
        const ins = await pgClient.query(`
          INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
          VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $1, crypt($2, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', $3, now(), now())
          RETURNING id;
        `, [u.email, u.password, JSON.stringify({role: u.role})]);
        userId = ins.rows[0].id;
        console.log('Created new user ' + u.email);
      }

      // Ensure user_roles has them approved
      await pgClient.query('INSERT INTO public.user_roles (user_id, role, is_approved) VALUES ($1, $2, true) ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, is_approved = true', [userId, u.role]);
    }

    console.log('All done');
  } catch(e) {
    console.error('Fatal error:', e);
  } finally {
    await pgClient.end();
  }
}
fixUsers();
