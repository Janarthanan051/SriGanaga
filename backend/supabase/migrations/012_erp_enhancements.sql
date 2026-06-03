-- 012_erp_enhancements.sql
-- Phase 4: ERP Enhancements for Granular Tracking and HR

-- 1. HR Audit Logs Enhancements
-- Update Payroll for historical ledgers
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS allowances DECIMAL(12, 2) DEFAULT 0.00;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS deductions DECIMAL(12, 2) DEFAULT 0.00;
ALTER TABLE public.payroll ADD COLUMN IF NOT EXISTS generated_date DATE DEFAULT CURRENT_DATE;

-- Update Attendance for leave structures
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS leave_type VARCHAR(50) CHECK (leave_type IN ('sick', 'casual', 'unpaid', 'authorized', 'none')) DEFAULT 'none';
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS authorized_by UUID REFERENCES public.employees(id);

-- 2. Fleet Logistics & Vehicle Assignment
-- Update Logistics table for dynamic mapping and real-time status
ALTER TABLE public.logistics ADD COLUMN IF NOT EXISTS vehicle_status VARCHAR(50) DEFAULT 'idle' CHECK (vehicle_status IN ('idle', 'loading', 'loaded', 'in_transit', 'delivered', 'maintenance'));
ALTER TABLE public.logistics ADD COLUMN IF NOT EXISTS assigned_weight DECIMAL(10, 3) DEFAULT 0.000;
ALTER TABLE public.logistics ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(20) DEFAULT 'kg';
ALTER TABLE public.logistics ADD COLUMN IF NOT EXISTS route_frequency INT DEFAULT 1;
ALTER TABLE public.logistics ADD COLUMN IF NOT EXISTS estimated_arrival TIMESTAMP WITH TIME ZONE;

-- Fleet Vehicles Table (Optional but better for real-time status)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type VARCHAR(100),
  capacity_weight DECIMAL(10, 3),
  status VARCHAR(50) DEFAULT 'idle' CHECK (status IN ('idle', 'in_transit', 'maintenance')),
  current_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Link logistics to vehicle if possible
ALTER TABLE public.logistics ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL;

-- 3. BOM Historical Archiving
CREATE TABLE IF NOT EXISTS public.bom_history_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id UUID NOT NULL REFERENCES public.bill_of_materials(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('created', 'updated', 'materials_allocated', 'production_run')),
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  baseline_valuation DECIMAL(12, 2), -- the estimated cost at the time of the action
  allocated_materials JSONB, -- precise snapshot of materials
  log_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  notes TEXT
);

-- RLS for Vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved users can view vehicles" ON public.vehicles FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Managers can manage vehicles" ON public.vehicles FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'logistics_manager']));

-- RLS for BOM History
ALTER TABLE public.bom_history_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved users can view bom history" ON public.bom_history_logs FOR SELECT USING (public.is_approved_user());
CREATE POLICY "Production can manage bom history" ON public.bom_history_logs FOR ALL USING (public.has_role(ARRAY['admin', 'super_admin', 'owner', 'manager', 'production_manager']));

-- Trigger for Vehicles
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
