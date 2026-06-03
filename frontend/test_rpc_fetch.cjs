const fs = require('fs');

async function test() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
  const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
  
  if (!urlMatch || !keyMatch) {
    console.error('Missing env vars');
    return;
  }
  
  const url = urlMatch[1].trim();
  const key = keyMatch[1].trim();
  
  try {
    const res = await fetch(`${url}/rest/v1/rpc/get_users_list`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    if (!res.ok) {
      console.log('Status:', res.status);
      const text = await res.text();
      console.log('Error Body:', text);
    } else {
      const data = await res.json();
      console.log('Success, rows:', data.length);
    }
  } catch (err) {
    console.error(err);
  }
}

test();
