#!/usr/bin/env node
// Usage: node create_supabase_user.js email password "Full Name"
// Requires Node 18+ for global fetch or run with a fetch polyfill.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const [,, email, password, fullName] = process.argv;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment. See .env.example');
  process.exit(1);
}
if (!email || !password) {
  console.error('Usage: node create_supabase_user.js email password "Full Name"');
  process.exit(1);
}

const url = SUPABASE_URL.replace(/\/$/, '') + '/auth/v1/admin/users';

const body = {
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName || '' }
};

(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Failed to create user:', data);
      process.exit(1);
    }

    console.log('User created:', data);
  } catch (err) {
    console.error('Error creating user:', err);
    process.exit(1);
  }
})();
