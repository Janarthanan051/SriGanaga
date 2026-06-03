const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres' }); 
client.connect().then(async () => { 
  try { 
    const res = await client.query("UPDATE auth.users SET email_confirmed_at = now() WHERE email IN ('admin@sriganga.com', 'hr@sriganga.com', 'logistics@sriganga.com', 'employee@sriganga.com') RETURNING email;"); 
    console.log('Confirmed emails:', res.rows.map(r => r.email)); 
  } catch(e) { 
    console.error(e); 
  } finally { 
    client.end(); 
  } 
});
