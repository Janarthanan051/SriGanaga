import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dpajmriuqjrecpnfusyp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYWptcml1cWpyZWNwbmZ1c3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTg4NDgsImV4cCI6MjA5NTg3NDg0OH0.OHSi6G9UxRFnE7_hKotnY3klklEfZGxR0V8A6EHInpI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  console.log('Calling get_users_list...');
  const { data, error } = await supabase.rpc('get_users_list');
  console.log('Data:', data);
  if (error) {
    console.error('Error:', error);
  }
}

testRpc();
