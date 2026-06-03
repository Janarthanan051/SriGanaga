-- 3. Security Definer Function to securely fetch user details for Admin Management Panel
CREATE OR REPLACE FUNCTION public.get_admin_users_list()
RETURNS TABLE(
  id UUID, 
  email VARCHAR, 
  full_name TEXT, 
  role VARCHAR, 
  is_approved BOOLEAN, 
  created_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public, auth
AS $$
#variable_conflict use_column
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Safely check admin status without column confusion
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
