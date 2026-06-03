import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dpajmriuqjrecpnfusyp.supabase.co';
// Need to find the anon key or service role key in frontend/.env
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error("No anon key found in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFunctions() {
  console.log("Testing user fetch...");
  // Note: we can't easily authenticate as admin here without credentials, but we can see if the function exists
  const { data, error } = await supabase.rpc('get_users_list');
  
  if (error) {
    console.error("Error calling get_users_list:", error);
  } else {
    console.log("Successfully called get_users_list:", data);
  }
}

testFunctions();
