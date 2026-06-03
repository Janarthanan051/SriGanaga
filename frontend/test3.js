async function testRpc() {
  const url = 'https://dpajmriuqjrecpnfusyp.supabase.co/rest/v1/rpc/get_admin_users_list';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYWptcml1cWpyZWNwbmZ1c3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTg4NDgsImV4cCI6MjA5NTg3NDg0OH0.OHSi6G9UxRFnE7_hKotnY3klklEfZGxR0V8A6EHInpI';
  
  console.log('Calling RPC via REST...');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testRpc();
