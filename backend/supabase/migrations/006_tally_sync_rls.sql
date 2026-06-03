-- RLS Policies update for tally_sync_log

-- 1. Drop the old admin-only select policy
DROP POLICY IF EXISTS "Admins can view tally sync logs" ON public.tally_sync_log;

-- 2. Create new select policy allowing approved Admins and Accountants
CREATE POLICY "Admins and Accountants can view tally sync logs"
ON public.tally_sync_log FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'accountant') 
    AND is_approved = TRUE
  )
);

-- 3. Create update policy allowing approved Admins and Accountants to update sync status
CREATE POLICY "Admins and Accountants can update tally sync logs"
ON public.tally_sync_log FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'accountant') 
    AND is_approved = TRUE
  )
);
