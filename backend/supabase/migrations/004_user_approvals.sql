-- 1. Add is_approved column to user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT FALSE;

-- Approve any existing admin users
UPDATE public.user_roles SET is_approved = TRUE WHERE role = 'admin';

-- 2. Update the handle_new_user trigger function to auto-approve admin users or admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role VARCHAR(50);
  approval_status BOOLEAN;
BEGIN
  -- Fetch role from raw_user_meta_data. If not present or not valid, default to 'admin'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'admin');
  
  -- Automatically approve 'admin' role or specific emails starting with admin to prevent lockouts
  IF user_role = 'admin' OR NEW.email LIKE 'admin%' THEN
    approval_status := TRUE;
  ELSE
    approval_status := FALSE;
  END IF;
  
  -- Insert into public.user_roles
  INSERT INTO public.user_roles (user_id, role, is_approved)
  VALUES (NEW.id, user_role, approval_status)
  ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role,
      is_approved = EXCLUDED.is_approved;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Security Definer Function to securely fetch user details for Admin Management Panel
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

-- 4. Security Definer Function to update user roles and approval statuses (Admin only)
CREATE OR REPLACE FUNCTION public.update_user_role_and_approval(
  target_user_id UUID, 
  new_role VARCHAR, 
  new_approval BOOLEAN
)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  -- Verify that the calling user is indeed an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin' AND is_approved = TRUE
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only approved administrators can update user roles.';
  END IF;
  
  -- Insert or update target user role mapping
  INSERT INTO public.user_roles (user_id, role, is_approved)
  VALUES (target_user_id, new_role, new_approval)
  ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role,
      is_approved = EXCLUDED.is_approved;
END;
$$ LANGUAGE plpgsql;
