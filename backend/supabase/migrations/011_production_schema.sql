-- 011_production_schema.sql
-- Phase 3: Production & Batching

-- 1. Production Orders
CREATE TABLE IF NOT EXISTS public.production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  bom_id UUID NOT NULL REFERENCES public.bill_of_materials(id) ON DELETE RESTRICT,
  planned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_quantity DECIMAL(10, 3) NOT NULL,
  status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  completed_date DATE,
  produced_quantity DECIMAL(10, 3),
  supervisor_id UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Batches
CREATE TABLE IF NOT EXISTS public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code VARCHAR(100) UNIQUE NOT NULL,
  production_order_id UUID REFERENCES public.production_orders(id) ON DELETE SET NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  manufacturing_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  quantity DECIMAL(10, 3) NOT NULL,
  status VARCHAR(50) DEFAULT 'quarantine' CHECK (status IN ('quarantine', 'passed', 'rejected', 'consumed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Quality Control (QC) Reports
CREATE TABLE IF NOT EXISTS public.qc_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number VARCHAR(100) UNIQUE NOT NULL,
  batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  inspector_id UUID NOT NULL REFERENCES auth.users(id),
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('passed', 'rejected', 'conditional')),
  parameters JSONB, -- store dynamic test results
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- RLS Policies
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qc_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view production orders" ON public.production_orders FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Production managers can manage production orders" ON public.production_orders FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'production_manager']));

CREATE POLICY "Approved users can view batches" ON public.batches FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Production managers and store keepers can manage batches" ON public.batches FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'production_manager', 'store_keeper']));

CREATE POLICY "Approved users can view QC reports" ON public.qc_reports FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Production managers can manage QC" ON public.qc_reports FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'production_manager']));
