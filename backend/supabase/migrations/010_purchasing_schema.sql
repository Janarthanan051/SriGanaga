-- 010_purchasing_schema.sql
-- Phase 2: Inventory & Purchasing (Store Keeper)

-- 1. Purchase Requests
CREATE TABLE IF NOT EXISTS public.purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_number VARCHAR(100) UNIQUE NOT NULL,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  department VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
  required_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.purchase_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_id UUID NOT NULL REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity DECIMAL(10, 3) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Purchase Orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(100) UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  pr_id UUID REFERENCES public.purchase_requests(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'partially_received', 'completed', 'cancelled')),
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  expected_delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity DECIMAL(10, 3) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Goods Receipts (GRN)
CREATE TABLE IF NOT EXISTS public.goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_number VARCHAR(100) UNIQUE NOT NULL,
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE RESTRICT,
  received_by UUID NOT NULL REFERENCES auth.users(id),
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'received' CHECK (status IN ('received', 'inspected', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.goods_receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_id UUID NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  po_item_id UUID NOT NULL REFERENCES public.purchase_order_items(id) ON DELETE RESTRICT,
  quantity_received DECIMAL(10, 3) NOT NULL,
  quantity_accepted DECIMAL(10, 3) NOT NULL DEFAULT 0,
  quantity_rejected DECIMAL(10, 3) NOT NULL DEFAULT 0,
  batch_number VARCHAR(100),
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Warehouse Transfers
CREATE TABLE IF NOT EXISTS public.warehouse_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number VARCHAR(100) UNIQUE NOT NULL,
  source_warehouse VARCHAR(100) NOT NULL,
  destination_warehouse VARCHAR(100) NOT NULL,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE TABLE IF NOT EXISTS public.warehouse_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES public.warehouse_transfers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity DECIMAL(10, 3) NOT NULL,
  batch_number VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- RLS Policies
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_transfer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view purchasing data" ON public.purchase_requests FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Managers and store keepers can manage purchase requests" ON public.purchase_requests FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'production_manager', 'store_keeper']));

CREATE POLICY "Approved users can view POs" ON public.purchase_orders FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Admins and managers can manage POs" ON public.purchase_orders FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'accountant']));

CREATE POLICY "Approved users can view GRNs" ON public.goods_receipts FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Store keepers can manage GRNs" ON public.goods_receipts FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'store_keeper', 'warehouse_manager']));

CREATE POLICY "Approved users can view warehouse transfers" ON public.warehouse_transfers FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Store keepers can manage warehouse transfers" ON public.warehouse_transfers FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'store_keeper', 'warehouse_manager']));

CREATE POLICY "Sub items read" ON public.purchase_request_items FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Sub items write" ON public.purchase_request_items FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'production_manager', 'store_keeper']));

CREATE POLICY "PO items read" ON public.purchase_order_items FOR SELECT USING (public.is_approved_user());
CREATE POLICY "PO items write" ON public.purchase_order_items FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'accountant']));

CREATE POLICY "GRN items read" ON public.goods_receipt_items FOR SELECT USING (public.is_approved_user());
CREATE POLICY "GRN items write" ON public.goods_receipt_items FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'store_keeper', 'warehouse_manager']));

CREATE POLICY "Transfer items read" ON public.warehouse_transfer_items FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Transfer items write" ON public.warehouse_transfer_items FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'store_keeper', 'warehouse_manager']));
