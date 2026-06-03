const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const WebSocket = require('ws');

const supabaseUrl = 'https://dpajmriuqjrecpnfusyp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYWptcml1cWpyZWNwbmZ1c3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTg4NDgsImV4cCI6MjA5NTg3NDg0OH0.OHSi6G9UxRFnE7_hKotnY3klklEfZGxR0V8A6EHInpI';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket }
});

const pgClient = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

const DEMO_USERS = [
  { email: 'admin@sriganga.com', password: 'Password123!', role: 'admin' },
  { email: 'hr@sriganga.com', password: 'Password123!', role: 'hr_manager' },
  { email: 'logistics@sriganga.com', password: 'Password123!', role: 'logistics_manager' },
  { email: 'employee@sriganga.com', password: 'Password123!', role: 'employee' }
];

async function seed() {
  try {
    await pgClient.connect();
    console.log('Connected to database...');

    // Drop the existing constraint and add the new one with employee and logistics_manager
    console.log('Updating user_roles CHECK constraint...');
    try {
      await pgClient.query(`
        -- Find bad rows
        DELETE FROM public.user_roles WHERE role NOT IN ('admin', 'hr_manager', 'warehouse_manager', 'accountant', 'vendor_manager', 'employee', 'logistics_manager');
        ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
        ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
        CHECK (role IN ('admin', 'hr_manager', 'warehouse_manager', 'accountant', 'vendor_manager', 'employee', 'logistics_manager'));
      `);
      console.log('Constraint updated successfully.');
    } catch (e) {
      console.error('Error updating constraint:', e);
    }

    for (const user of DEMO_USERS) {
      console.log(`Processing ${user.email}...`);
      
      // 1. Sign up user via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            role: user.role
          }
        }
      });

      if (error && error.message !== 'User already registered') {
        console.error(`Error creating ${user.email} (${error.message}), attempting fallback to existing user...`);
      }
      
      let userId;
      if (data?.user) {
        userId = data.user.id;
      } else {
        // If already registered or rate limited, fetch ID from auth.users via pgClient
        const { rows } = await pgClient.query('SELECT id FROM auth.users WHERE email = $1', [user.email]);
        if (rows.length > 0) {
          userId = rows[0].id;
          // Update user metadata to set role
          await pgClient.query(`
            UPDATE auth.users 
            SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', $1::jsonb)
            WHERE id = $2
          `, [JSON.stringify(user.role), userId]);
        } else {
            console.error(`User ${user.email} not found in DB!`);
        }
      }

      if (userId) {
        // 2. Set is_approved = true and specific role in user_roles
        await pgClient.query(`
          INSERT INTO public.user_roles (user_id, role, is_approved)
          VALUES ($1, $2, true)
          ON CONFLICT (user_id) 
          DO UPDATE SET role = EXCLUDED.role, is_approved = true
        `, [userId, user.role]);
        console.log(`Approved and set role '${user.role}' for ${user.email}`);
      }
    }

    for (const u of [
      {email: 'logistics@sriganga.com', role: 'logistics_manager'}, 
      {email: 'employee@sriganga.com', role: 'employee'}
    ]) {
      try {
        const res = await pgClient.query(`
          INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
          VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $1, crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', $2, now(), now())
          RETURNING id;
        `, [u.email, JSON.stringify({role: u.role})]);
        
        if (res.rows.length > 0) {
          console.log('Successfully created via SQL: ' + u.email + ' with id ' + res.rows[0].id);
          // Insert role just in case trigger didn't handle it
          await pgClient.query('INSERT INTO public.user_roles (user_id, role, is_approved) VALUES ($1, $2, true) ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, is_approved = true', [res.rows[0].id, u.role]);
        } else {
          // Exists, let's just make sure it's approved
          const { rows } = await pgClient.query('SELECT id FROM auth.users WHERE email = $1', [u.email]);
          if(rows.length > 0) {
            await pgClient.query('INSERT INTO public.user_roles (user_id, role, is_approved) VALUES ($1, $2, true) ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, is_approved = true', [rows[0].id, u.role]);
          }
        }
      } catch (err) {
        console.error('SQL fallback failed for', u.email, err.message);
      }
    }

    console.log('RBAC Demo Seeding Completed Successfully.');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await pgClient.end();
  }
}

seed();
