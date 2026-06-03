const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:6b9NyulUlmOPzgZh@db.dpajmriuqjrecpnfusyp.supabase.co:5432/postgres'
});

const fixSql = `
DROP FUNCTION IF EXISTS public.get_users_list();

CREATE OR REPLACE FUNCTION public.get_users_list(
  OUT out_id UUID, 
  OUT out_email VARCHAR, 
  OUT out_full_name TEXT, 
  OUT out_role VARCHAR, 
  OUT out_is_approved BOOLEAN, 
  OUT out_created_at TIMESTAMP WITH TIME ZONE
) RETURNS SETOF RECORD
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Safely check admin status
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles r
    WHERE r.user_id = auth.uid() 
      AND r.role = 'admin' 
      AND r.is_approved = TRUE
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Access Denied: Only approved administrators can retrieve the user list.';
  END IF;
  
  RETURN QUERY
  SELECT 
    u.id,
    u.email::VARCHAR,
    COALESCE(u.raw_user_meta_data->>'full_name', '')::TEXT,
    COALESCE(r.role, 'admin')::VARCHAR,
    COALESCE(r.is_approved, FALSE),
    u.created_at
  FROM auth.users u
  LEFT JOIN public.user_roles r ON u.id = r.user_id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

NOTIFY pgrst, 'reload schema';
`;

async function runFix() {
  try {
    await client.connect();
    console.log('Connected to database.');
    await client.query(fixSql);
    console.log('Fix deployed and schema reloaded!');
  } catch (err) {
    console.error('Error deploying fix:', err);
  } finally {
    await client.end();
  }
}

runFix();
