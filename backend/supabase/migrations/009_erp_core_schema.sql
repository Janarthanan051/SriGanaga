-- 009_erp_core_schema.sql
-- Phase 1: Database Foundation & Master Data for Food Manufacturing ERP

-- 1. Update user_roles constraint
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (
  role IN (
    'admin', 'super_admin', 'owner', 'manager', 'hr_manager', 
    'production_manager', 'store_keeper', 'warehouse_manager', 
    'sales_executive', 'accountant', 'vendor_manager'
  )
);

-- 2. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  gst_number VARCHAR(50),
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  billing_address TEXT,
  shipping_address TEXT,
  outstanding_balance DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Update Products Table for Manufacturing
-- Add product_type to distinguish Raw Materials vs Finished Goods
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) DEFAULT 'finished_good' CHECK (product_type IN ('raw_material', 'finished_good', 'packaging'));
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'kg';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS purchase_cost DECIMAL(10, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS expiry_days INT;

-- 4. Bill of Materials (BOM)
CREATE TABLE IF NOT EXISTS public.bill_of_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  bom_number VARCHAR(100) UNIQUE NOT NULL,
  expected_yield DECIMAL(10, 3) NOT NULL DEFAULT 1.000,
  yield_unit VARCHAR(50) DEFAULT 'kg',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. BOM Items (Raw Materials required)
CREATE TABLE IF NOT EXISTS public.bom_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id UUID NOT NULL REFERENCES public.bill_of_materials(id) ON DELETE CASCADE,
  raw_material_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity_required DECIMAL(10, 3) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- RLS Policies for new tables

-- Customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved users can view customers" ON public.customers FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Sales and Admins can manage customers" ON public.customers FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'sales_executive']));

-- BOM
ALTER TABLE public.bill_of_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved users can view BOM" ON public.bill_of_materials FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Production Managers and Admins can manage BOM" ON public.bill_of_materials FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'production_manager']));

-- BOM Items
ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved users can view BOM items" ON public.bom_items FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Production Managers and Admins can manage BOM items" ON public.bom_items FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'production_manager']));

-- Update existing product RLS to allow new roles
DROP POLICY IF EXISTS "Warehouse managers and Admins can manage products" ON public.products;
CREATE POLICY "Managers can manage products" ON public.products FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'store_keeper', 'warehouse_manager', 'production_manager']));
