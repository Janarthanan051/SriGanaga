-- 1. Allow authenticated users to select user_roles (required to resolve policy subquery lockouts)
CREATE POLICY "Allow authenticated users to read roles"
ON public.user_roles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 2. Allow warehouse managers to manage products (add, edit, and delete)
DROP POLICY IF EXISTS "Admins can do anything on products" ON public.products;
CREATE POLICY "Admins and Warehouse Managers can manage products"
ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'warehouse_manager') AND is_approved = TRUE)
);

-- 3. Add management policies for order_items (which previously had RLS enabled but was missing policies)
DROP POLICY IF EXISTS "Admins and Vendor Managers can manage order items" ON public.order_items;
CREATE POLICY "Admins and Vendor Managers can manage order items"
ON public.order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'vendor_manager') AND is_approved = TRUE)
);
