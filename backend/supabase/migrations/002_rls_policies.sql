-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_inward ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_outward ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wastage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_sync_log ENABLE ROW LEVEL SECURITY;

-- ADMIN POLICIES - Full Access
CREATE POLICY "Admins can do anything on employees"
ON public.employees FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can do anything on products"
ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can do anything on attendance"
ON public.attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can do anything on payroll"
ON public.payroll FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can do anything on vendors"
ON public.vendors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can do anything on orders"
ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can do anything on logistics"
ON public.logistics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can do anything on expenses"
ON public.expenses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- HR MANAGER POLICIES
CREATE POLICY "HR can view all employees"
ON public.employees FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "HR can update employee info"
ON public.employees FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "HR can manage attendance"
ON public.attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "HR can view payroll"
ON public.payroll FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "HR can insert payroll"
ON public.payroll FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "HR can update payroll"
ON public.payroll FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

-- WAREHOUSE MANAGER POLICIES
CREATE POLICY "Warehouse can view products"
ON public.products FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'warehouse_manager'))
);

CREATE POLICY "Warehouse can manage stock inward"
ON public.stock_inward FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'warehouse_manager'))
);

CREATE POLICY "Warehouse can manage stock outward"
ON public.stock_outward FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'warehouse_manager'))
);

CREATE POLICY "Warehouse can manage logistics"
ON public.logistics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'warehouse_manager'))
);

CREATE POLICY "Warehouse can manage wastage"
ON public.wastage FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'warehouse_manager'))
);

-- ACCOUNTANT POLICIES
CREATE POLICY "Accountant can view expenses"
ON public.expenses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'accountant'))
);

CREATE POLICY "Accountant can insert expenses"
ON public.expenses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'accountant'))
);

CREATE POLICY "Accountant can update expenses"
ON public.expenses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'accountant'))
);

-- VENDOR MANAGER POLICIES
CREATE POLICY "Vendor Manager can manage vendors"
ON public.vendors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'vendor_manager'))
);

CREATE POLICY "Vendor Manager can manage suppliers"
ON public.suppliers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'vendor_manager'))
);

CREATE POLICY "Vendor Manager can view orders"
ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'vendor_manager'))
);

CREATE POLICY "Vendor Manager can insert orders"
ON public.orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'vendor_manager'))
);

CREATE POLICY "Vendor Manager can update orders"
ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'vendor_manager'))
);

-- NOTIFICATIONS - Users can view their own
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT USING (
  auth.uid() = user_id
);

-- ACTIVITY LOGS - Admin only
CREATE POLICY "Admins can view activity logs"
ON public.activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can insert activity logs"
ON public.activity_logs FOR INSERT WITH CHECK (true);

-- TALLY SYNC - Admin only
CREATE POLICY "Admins can view tally sync logs"
ON public.tally_sync_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can insert tally sync logs"
ON public.tally_sync_log FOR INSERT WITH CHECK (true);
