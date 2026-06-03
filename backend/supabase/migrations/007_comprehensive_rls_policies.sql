-- 007_comprehensive_rls_policies.sql
-- Overhaul RLS policies to make all features work across all manager roles.

-- ==========================================
-- I. SECURE HELPER FUNCTIONS (SECURITY DEFINER)
-- ==========================================

CREATE OR REPLACE FUNCTION public.has_role(req_roles VARCHAR[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(req_roles) 
    AND is_approved = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND is_approved = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- II. DROP PREVIOUS CONFLICTING POLICIES
-- ==========================================

-- public.employees
DROP POLICY IF EXISTS "Admins can do anything on employees" ON public.employees;
DROP POLICY IF EXISTS "HR can view all employees" ON public.employees;
DROP POLICY IF EXISTS "HR can update employee info" ON public.employees;

-- public.attendance
DROP POLICY IF EXISTS "Admins can do anything on attendance" ON public.attendance;
DROP POLICY IF EXISTS "HR can manage attendance" ON public.attendance;

-- public.payroll
DROP POLICY IF EXISTS "Admins can do anything on payroll" ON public.payroll;
DROP POLICY IF EXISTS "HR can view payroll" ON public.payroll;
DROP POLICY IF EXISTS "HR can insert payroll" ON public.payroll;
DROP POLICY IF EXISTS "HR can update payroll" ON public.payroll;

-- public.products
DROP POLICY IF EXISTS "Admins can do anything on products" ON public.products;
DROP POLICY IF EXISTS "Warehouse can view products" ON public.products;
DROP POLICY IF EXISTS "Admins and Warehouse Managers can manage products" ON public.products;

-- public.stock_inward
DROP POLICY IF EXISTS "Warehouse can manage stock inward" ON public.stock_inward;

-- public.stock_outward
DROP POLICY IF EXISTS "Warehouse can manage stock outward" ON public.stock_outward;

-- public.vendors
DROP POLICY IF EXISTS "Admins can do anything on vendors" ON public.vendors;
DROP POLICY IF EXISTS "Vendor Manager can manage vendors" ON public.vendors;

-- public.suppliers
DROP POLICY IF EXISTS "Vendor Manager can manage suppliers" ON public.suppliers;

-- public.orders
DROP POLICY IF EXISTS "Admins can do anything on orders" ON public.orders;
DROP POLICY IF EXISTS "Vendor Manager can view orders" ON public.orders;
DROP POLICY IF EXISTS "Vendor Manager can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Vendor Manager can update orders" ON public.orders;

-- public.order_items
DROP POLICY IF EXISTS "Admins and Vendor Managers can manage order items" ON public.order_items;

-- public.logistics
DROP POLICY IF EXISTS "Admins can do anything on logistics" ON public.logistics;
DROP POLICY IF EXISTS "Warehouse can manage logistics" ON public.logistics;

-- public.wastage
DROP POLICY IF EXISTS "Warehouse can manage wastage" ON public.wastage;

-- public.expenses
DROP POLICY IF EXISTS "Admins can do anything on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Accountant can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Accountant can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Accountant can update expenses" ON public.expenses;

-- public.tally_sync_log
DROP POLICY IF EXISTS "Admins can view tally sync logs" ON public.tally_sync_log;
DROP POLICY IF EXISTS "Admins and Accountants can view tally sync logs" ON public.tally_sync_log;
DROP POLICY IF EXISTS "Admins and Accountants can update tally sync logs" ON public.tally_sync_log;
DROP POLICY IF EXISTS "System can insert tally sync logs" ON public.tally_sync_log;

-- public.notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- public.activity_logs
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;

-- public.user_roles
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- ==========================================
-- III. CREATE NEW UNIFIED SECURITY POLICIES
-- ==========================================

-- 1. user_roles
CREATE POLICY "Allow authenticated users to read roles"
ON public.user_roles FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage user roles"
ON public.user_roles FOR ALL USING (public.has_role(ARRAY['admin']));

-- 2. employees
CREATE POLICY "Approved managers can read employee directory"
ON public.employees FOR SELECT USING (public.has_role(ARRAY['admin', 'hr_manager', 'accountant']));

CREATE POLICY "HR and Admins can manage employees"
ON public.employees FOR ALL USING (public.has_role(ARRAY['admin', 'hr_manager']));

-- 3. attendance
CREATE POLICY "HR and Admins can manage attendance"
ON public.attendance FOR ALL USING (public.has_role(ARRAY['admin', 'hr_manager']));

-- 4. payroll
CREATE POLICY "HR, Accountants, and Admins can view payroll"
ON public.payroll FOR SELECT USING (public.has_role(ARRAY['admin', 'hr_manager', 'accountant']));

CREATE POLICY "HR and Admins can manage payroll transactions"
ON public.payroll FOR ALL USING (public.has_role(ARRAY['admin', 'hr_manager']));

-- 5. products
CREATE POLICY "Approved users can view products"
ON public.products FOR SELECT USING (public.is_approved_user());

CREATE POLICY "Warehouse managers and Admins can manage products"
ON public.products FOR ALL USING (public.has_role(ARRAY['admin', 'warehouse_manager']));

-- 6. stock_inward
CREATE POLICY "Approved users can view stock inward records"
ON public.stock_inward FOR SELECT USING (public.is_approved_user());

CREATE POLICY "Warehouse managers and Admins can manage stock inward"
ON public.stock_inward FOR ALL USING (public.has_role(ARRAY['admin', 'warehouse_manager']));

-- 7. stock_outward
CREATE POLICY "Approved users can view stock outward records"
ON public.stock_outward FOR SELECT USING (public.is_approved_user());

CREATE POLICY "Warehouse managers and Admins can manage stock outward"
ON public.stock_outward FOR ALL USING (public.has_role(ARRAY['admin', 'warehouse_manager']));

-- 8. vendors
CREATE POLICY "Approved users can view vendors"
ON public.vendors FOR SELECT USING (public.is_approved_user());

CREATE POLICY "Vendor managers and Admins can manage vendors"
ON public.vendors FOR ALL USING (public.has_role(ARRAY['admin', 'vendor_manager']));

-- 9. suppliers
CREATE POLICY "Approved users can view suppliers"
ON public.suppliers FOR SELECT USING (public.is_approved_user());

CREATE POLICY "Vendor managers and Admins can manage suppliers"
ON public.suppliers FOR ALL USING (public.has_role(ARRAY['admin', 'vendor_manager']));

-- 10. orders
CREATE POLICY "Approved users can view orders"
ON public.orders FOR SELECT USING (public.is_approved_user());

CREATE POLICY "Vendor managers and Admins can manage orders"
ON public.orders FOR ALL USING (public.has_role(ARRAY['admin', 'vendor_manager']));

-- 11. order_items
CREATE POLICY "Approved users can view order items"
ON public.order_items FOR SELECT USING (public.is_approved_user());

CREATE POLICY "Vendor managers and Admins can manage order items"
ON public.order_items FOR ALL USING (public.has_role(ARRAY['admin', 'vendor_manager']));

-- 12. logistics
CREATE POLICY "Approved users can view logistics details"
ON public.logistics FOR SELECT USING (public.is_approved_user());

CREATE POLICY "Warehouse managers and Admins can manage logistics"
ON public.logistics FOR ALL USING (public.has_role(ARRAY['admin', 'warehouse_manager']));

-- 13. wastage
CREATE POLICY "Approved users can view wastage logs"
ON public.wastage FOR SELECT USING (public.is_approved_user());

CREATE POLICY "Warehouse managers and Admins can manage wastage"
ON public.wastage FOR ALL USING (public.has_role(ARRAY['admin', 'warehouse_manager']));

-- 14. expenses
CREATE POLICY "Accountants and Admins can view expenses"
ON public.expenses FOR SELECT USING (public.has_role(ARRAY['admin', 'accountant']));

CREATE POLICY "Accountants and Admins can manage expenses"
ON public.expenses FOR ALL USING (public.has_role(ARRAY['admin', 'accountant']));

-- 15. tally_sync_log
CREATE POLICY "Accountants and Admins can view tally sync logs"
ON public.tally_sync_log FOR SELECT USING (public.has_role(ARRAY['admin', 'accountant']));

CREATE POLICY "Accountants and Admins can update tally sync logs"
ON public.tally_sync_log FOR UPDATE USING (public.has_role(ARRAY['admin', 'accountant']));

CREATE POLICY "System and authenticated users can insert tally sync logs"
ON public.tally_sync_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 16. notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT WITH CHECK (true);

-- 17. activity_logs
CREATE POLICY "Admins can view activity logs"
ON public.activity_logs FOR SELECT USING (public.has_role(ARRAY['admin']));

CREATE POLICY "System can insert activity logs"
ON public.activity_logs FOR INSERT WITH CHECK (true);
