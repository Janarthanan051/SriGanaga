import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import ws from 'ws';

// Load env variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Polyfill fetch and WebSocket globally so Supabase JS doesn't complain
if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws as any;
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Key. Make sure .env is configured correctly in the backend folder.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const roles = [
  'admin', 'super_admin', 'owner', 'manager', 'hr_manager', 
  'warehouse_manager', 'accountant', 'vendor_manager', 
  'production_manager', 'store_keeper', 'sales_executive'
];

async function seedUsers() {
  console.log('Seeding role-based demo users...');

  for (const role of roles) {
    const email = `${role}@sriganga.com`;
    const password = `${role.replace('_', '')}@123`;
    const fullName = role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Demo';

    try {
      // 1. Create the user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: role,
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`User ${email} already exists. Skipping creation...`);
          
          // Let's ensure the user role table is synced anyway, but we need the user ID
          const { data: searchData, error: searchError } = await supabase.auth.admin.listUsers();
          if(!searchError && searchData?.users) {
              const existingUser = searchData.users.find(u => u.email === email);
              if (existingUser) {
                  // Ensure they are approved in the user_roles table
                  const { error: roleError } = await supabase
                    .from('user_roles')
                    .upsert({ user_id: existingUser.id, role: role, is_approved: true }, { onConflict: 'user_id' });
                    
                  if (roleError) console.error(`Error upserting role for existing ${email}:`, roleError);
              }
          }
          
          continue;
        }
        console.error(`Error creating ${email}:`, authError.message);
        continue;
      }

      console.log(`Successfully created user: ${email} | Password: ${password}`);

      // 2. Ensure they are approved in user_roles
      if (authData.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert([
            { user_id: authData.user.id, role: role, is_approved: true }
          ]);

        if (roleError) {
            console.error(`Created user ${email} but failed to insert into user_roles:`, roleError.message);
        } else {
            console.log(`  -> Role '${role}' approved in user_roles table.`);
        }
      }
    } catch (e) {
      console.error(`Unexpected error for ${email}:`, e);
    }
  }

  console.log('\n✅ Demo users seeding completed!');
  console.log('Login credentials format:');
  console.log('Email: [role]@sriganga.com');
  console.log('Password: [role(no underscores)]@123');
}

seedUsers();
