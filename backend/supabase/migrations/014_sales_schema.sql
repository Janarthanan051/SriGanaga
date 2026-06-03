-- 014_sales_schema.sql
-- Phase 5: Sales & Customer Orders

CREATE TABLE IF NOT EXISTS public.sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  sales_rep_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(12, 2) DEFAULT 0.00,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity DECIMAL(10, 3) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- RLS Policies
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view sales orders" ON public.sales_orders FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Sales can manage sales orders" ON public.sales_orders FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'sales_manager']));

CREATE POLICY "Approved users can view sales order items" ON public.sales_order_items FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Sales can manage sales order items" ON public.sales_order_items FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'sales_manager']));

-- Trigger for updated_at
CREATE TRIGGER update_sales_orders_updated_at
BEFORE UPDATE ON public.sales_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Reload schema
NOTIFY pgrst, 'reload schema';
