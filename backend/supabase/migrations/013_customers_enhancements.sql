-- 013_customers_enhancements.sql
-- Add missing columns to customers table for ERP frontend compatibility

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12, 2) DEFAULT 0.00;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted'));

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
