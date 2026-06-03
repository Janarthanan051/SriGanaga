-- 1. Payroll Calculation Function
CREATE OR REPLACE FUNCTION public.calculate_payroll(emp_id uuid, month_num int, year_num int)
RETURNS numeric AS $$
DECLARE
  days_present   numeric;
  working_days   numeric := 26.0;
  monthly_ctc    numeric;
  net_salary     numeric;
BEGIN
  -- Count present days (present = 1.0, half_day = 0.5, etc.)
  -- Using the formula from the spec, but adjusting for half-days if they are present.
  SELECT COALESCE(SUM(
    CASE 
      WHEN status = 'present' THEN 1.0
      WHEN status = 'half_day' THEN 0.5
      ELSE 0.0
    END
  ), 0) INTO days_present
  FROM public.attendance
  WHERE employee_id = emp_id
    AND EXTRACT(MONTH FROM date) = month_num
    AND EXTRACT(YEAR FROM date) = year_num;

  SELECT salary INTO monthly_ctc
  FROM public.employees WHERE id = emp_id;

  IF monthly_ctc IS NULL THEN
    RETURN 0.00;
  END IF;

  net_salary := (days_present / working_days) * monthly_ctc;
  RETURN ROUND(net_salary, 2);
END;
$$ LANGUAGE plpgsql;

-- 2. Stock Balance Auto-Update Trigger Function
CREATE OR REPLACE FUNCTION public.update_stock_balance()
RETURNS TRIGGER AS $$
DECLARE
  prod_id UUID;
BEGIN
  -- Determine product_id to update (handles INSERT, UPDATE, DELETE)
  IF TG_OP = 'DELETE' THEN
    prod_id := OLD.product_id;
  ELSE
    prod_id := NEW.product_id;
  END IF;

  UPDATE public.products SET
    current_stock = (
      SELECT COALESCE(SUM(quantity), 0) FROM public.stock_inward
      WHERE product_id = prod_id
    ) - (
      SELECT COALESCE(SUM(quantity), 0) FROM public.stock_outward
      WHERE product_id = prod_id
    ) - (
      SELECT COALESCE(SUM(quantity), 0) FROM public.wastage
      WHERE product_id = prod_id
    )
  WHERE id = prod_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for stock_inward
DROP TRIGGER IF EXISTS trg_stock_inward_update ON public.stock_inward;
CREATE TRIGGER trg_stock_inward_update
AFTER INSERT OR UPDATE OR DELETE ON public.stock_inward
FOR EACH ROW EXECUTE FUNCTION public.update_stock_balance();

-- Triggers for stock_outward
DROP TRIGGER IF EXISTS trg_stock_outward_update ON public.stock_outward;
CREATE TRIGGER trg_stock_outward_update
AFTER INSERT OR UPDATE OR DELETE ON public.stock_outward
FOR EACH ROW EXECUTE FUNCTION public.update_stock_balance();

-- Triggers for wastage
DROP TRIGGER IF EXISTS trg_wastage_update ON public.wastage;
CREATE TRIGGER trg_wastage_update
AFTER INSERT OR UPDATE OR DELETE ON public.wastage
FOR EACH ROW EXECUTE FUNCTION public.update_stock_balance();

-- 3. Automatic User Role Assignment from Auth MetaData
-- This trigger handles automatic creation of public.user_roles row when auth.users is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role VARCHAR(50);
BEGIN
  -- Fetch role from raw_user_meta_data. If not present or not valid, default to 'admin'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'admin');
  
  -- Insert into public.user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id) DO UPDATE
  SET role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Sample Seed Data for Testing and Visualization
-- Enable extensions if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Seed Suppliers
INSERT INTO public.suppliers (id, name, contact_person, email, phone, address, city, state, pincode, materials_supplied)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Sri Ganga Wheat Farms', 'Vijay Singh', 'vijay@srigangafarms.com', '9876543210', '12, Agro Market Road', 'Hapur', 'Uttar Pradesh', '245101', 'Wheat, Grains'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Elite Packaging Ltd', 'Manish Mehta', 'sales@elitepackaging.co.in', '9812345678', 'Plot 45, Sector 63', 'Noida', 'Uttar Pradesh', '201301', 'PP Bags, Cartons, Pouch Rolls')
ON CONFLICT (id) DO NOTHING;

-- Seed Vendors
INSERT INTO public.vendors (id, name, contact_person, email, phone, address, city, state, pincode, gst_number, payment_terms, outstanding_balance, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440003', 'Ganga Retailers & Distributors', 'Amit Kumar', 'orders@gangaretailers.com', '9911223344', '104, Mall Road', 'Kanpur', 'Uttar Pradesh', '208001', '09AAAAA1111A1Z1', 'Net 30', 25000.00, 'active'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Shivam Grocery Distributors', 'Shivam Mishra', 'shivam@distributors.com', '9988776655', 'B-12, Transport Nagar', 'Lucknow', 'Uttar Pradesh', '226012', '09BBBBB2222B1Z2', 'Net 15', 12500.00, 'active'),
  ('550e8400-e29b-41d4-a716-446655440200', 'Agarwal Traders', 'Gopal Agarwal', 'gopal@agarwaltraders.com', '9876123450', 'Chowk Area, Gali No. 4', 'Varanasi', 'Uttar Pradesh', '221001', '09CCCCC3333C1Z3', 'COD', 0.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO public.products (id, sku, name, category, unit, batch_number, manufacturing_date, expiry_date, current_stock, reorder_level, unit_price, description)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440005', 'SG-ATTA-10KG', 'Premium Chakki Atta (10kg)', 'Flour', 'Bags', 'B-AT-0526', '2026-05-10', '2026-08-10', 0, 100, 420.00, '100% whole wheat chakki fresh atta, highly nutritious'),
  ('550e8400-e29b-41d4-a716-446655440006', 'SG-MAIDA-50KG', 'Super Fine Maida (50kg)', 'Flour', 'Bags', 'B-MD-0526', '2026-05-12', '2026-09-12', 0, 50, 2100.00, 'Super fine double-refined maida, perfect for bakeries'),
  ('550e8400-e29b-41d4-a716-446655440007', 'SG-SOOJI-01KG', 'Premium Sooji (1kg)', 'Semolina', 'Packets', 'B-SJ-0526', '2026-05-14', '2026-11-14', 0, 200, 50.00, 'Granular, high-protein semolina for healthy snacks'),
  ('550e8400-e29b-41d4-a716-446655440008', 'SG-BRAN-50KG', 'Nutritional Wheat Bran (50kg)', 'Bran', 'Bags', 'B-BR-0526', '2026-05-15', '2026-11-15', 0, 30, 800.00, 'High-fiber animal feed grade wheat bran')
ON CONFLICT (id) DO NOTHING;

-- Seed Employees
INSERT INTO public.employees (id, employee_id, first_name, last_name, email, phone, department, position, joining_date, salary, status, bank_account, bank_name, ifsc_code, aadhar_number, pan_number, address, city, state, pincode)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440009', 'EMP-0001', 'Rahul', 'Sharma', 'rahul@srigangafoods.com', '9822334455', 'Sales & Marketing', 'Sales Manager', '2026-01-01', 45000.00, 'active', '30291049281', 'State Bank of India', 'SBIN0001042', '123456789012', 'ABCDE1234F', 'Flat 402, Ganga Heights', 'Kanpur', 'Uttar Pradesh', '208002'),
  ('550e8400-e29b-41d4-a716-446655440010', 'EMP-0002', 'Rajesh', 'Patel', 'rajesh@srigangafoods.com', '9833445566', 'Operations', 'Mill Supervisor', '2026-01-15', 35000.00, 'active', '40910294817', 'Punjab National Bank', 'PUNB0109200', '234567890123', 'FGHIJ5678K', 'H.No. 45, Gali 2, Shanti Nagar', 'Kanpur', 'Uttar Pradesh', '208005'),
  ('550e8400-e29b-41d4-a716-446655440011', 'EMP-0003', 'Neha', 'Gupta', 'neha@srigangafoods.com', '9844556677', 'Human Resources', 'HR Manager', '2026-02-01', 30000.00, 'active', '10029384756', 'HDFC Bank', 'HDFC0000124', '345678901234', 'KLMNO9012P', 'A-8, Civil Lines', 'Kanpur', 'Uttar Pradesh', '208001'),
  ('550e8400-e29b-41d4-a716-446655440012', 'EMP-0004', 'Suresh', 'Kumar', 'suresh@srigangafoods.com', '9855667788', 'Operations', 'Warehouse Handler', '2026-03-01', 18000.00, 'active', '50291827364', 'Bank of Baroda', 'BARB0CIVILX', '456789012345', 'QRSTU3456V', 'Vill. Kalyanpur, Near Station', 'Kanpur', 'Uttar Pradesh', '208016')
ON CONFLICT (id) DO NOTHING;

-- Seed Attendance for Rahul Sharma (Employee 1) - Present on work days, absent on Sundays (5 Sundays: May 3, 10, 17, 24, 31) and one half-day (May 15)
INSERT INTO public.attendance (employee_id, date, status, notes)
SELECT 
  '550e8400-e29b-41d4-a716-446655440009'::uuid,
  d::date,
  CASE 
    WHEN EXTRACT(ISODOW FROM d) = 7 THEN 'absent'
    WHEN d::date = '2026-05-15'::date THEN 'half_day'
    ELSE 'present'
  END,
  CASE 
    WHEN EXTRACT(ISODOW FROM d) = 7 THEN 'Sunday Holiday'
    WHEN d::date = '2026-05-15'::date THEN 'Personal leave - 0.5 day'
    ELSE 'Regular attendance record'
  END
FROM generate_series('2026-05-01'::date, '2026-05-31'::date, '1 day'::interval) d
ON CONFLICT (employee_id, date) DO NOTHING;

-- Seed Attendance for Rajesh Patel (Employee 2) - Present on work days, absent on Sundays, and absent on May 12, 13 (Sick Leave)
INSERT INTO public.attendance (employee_id, date, status, notes)
SELECT 
  '550e8400-e29b-41d4-a716-446655440010'::uuid,
  d::date,
  CASE 
    WHEN EXTRACT(ISODOW FROM d) = 7 THEN 'absent'
    WHEN d::date IN ('2026-05-12'::date, '2026-05-13'::date) THEN 'absent'
    ELSE 'present'
  END,
  CASE 
    WHEN EXTRACT(ISODOW FROM d) = 7 THEN 'Sunday Holiday'
    WHEN d::date IN ('2026-05-12'::date, '2026-05-13'::date) THEN 'Sick leave'
    ELSE 'Regular attendance record'
  END
FROM generate_series('2026-05-01'::date, '2026-05-31'::date, '1 day'::interval) d
ON CONFLICT (employee_id, date) DO NOTHING;

-- Seed Attendance for Neha Gupta (Employee 3) - Present on work days, absent on Sundays, and on approved leave on May 20
INSERT INTO public.attendance (employee_id, date, status, notes)
SELECT 
  '550e8400-e29b-41d4-a716-446655440011'::uuid,
  d::date,
  CASE 
    WHEN EXTRACT(ISODOW FROM d) = 7 THEN 'absent'
    WHEN d::date = '2026-05-20'::date THEN 'leave'
    ELSE 'present'
  END,
  CASE 
    WHEN EXTRACT(ISODOW FROM d) = 7 THEN 'Sunday Holiday'
    WHEN d::date = '2026-05-20'::date THEN 'Casual Leave Approved'
    ELSE 'Regular attendance record'
  END
FROM generate_series('2026-05-01'::date, '2026-05-31'::date, '1 day'::interval) d
ON CONFLICT (employee_id, date) DO NOTHING;

-- Seed Attendance for Suresh Kumar (Employee 4) - Present on work days, absent on Sundays, and absent on May 22, 23 (Unplanned leaves)
INSERT INTO public.attendance (employee_id, date, status, notes)
SELECT 
  '550e8400-e29b-41d4-a716-446655440012'::uuid,
  d::date,
  CASE 
    WHEN EXTRACT(ISODOW FROM d) = 7 THEN 'absent'
    WHEN d::date IN ('2026-05-22'::date, '2026-05-23'::date) THEN 'absent'
    ELSE 'present'
  END,
  CASE 
    WHEN EXTRACT(ISODOW FROM d) = 7 THEN 'Sunday Holiday'
    WHEN d::date IN ('2026-05-22'::date, '2026-05-23'::date) THEN 'Unplanned Leave - Absent'
    ELSE 'Regular attendance record'
  END
FROM generate_series('2026-05-01'::date, '2026-05-31'::date, '1 day'::interval) d
ON CONFLICT (employee_id, date) DO NOTHING;

-- Seed Stock Inward (Stock levels automatically computed via trigger)
INSERT INTO public.stock_inward (id, product_id, quantity, supplier_id, batch_number, manufacturing_date, expiry_date, received_date, invoice_number, notes)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440005', 500, '550e8400-e29b-41d4-a716-446655440001', 'B-AT-0526', '2026-05-10', '2026-08-10', '2026-05-12', 'INV-SG-2026-001', 'Initial fresh milling batch'),
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440006', 200, '550e8400-e29b-41d4-a716-446655440001', 'B-MD-0526', '2026-05-12', '2026-09-12', '2026-05-14', 'INV-SG-2026-002', 'High-grade baking maida'),
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440007', 1000, '550e8400-e29b-41d4-a716-446655440002', 'B-SJ-0526', '2026-05-14', '2026-11-14', '2026-05-15', 'INV-SG-2026-003', 'Semolina packaging batch'),
  ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440008', 300, '550e8400-e29b-41d4-a716-446655440001', 'B-BR-0526', '2026-05-15', '2026-11-15', '2026-05-16', 'INV-SG-2026-004', 'Animal feed grade bran inward')
ON CONFLICT (id) DO NOTHING;

-- Seed Orders and Items
INSERT INTO public.orders (id, order_number, vendor_id, order_date, delivery_date, status, total_amount, notes)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440030', 'PO-2026-0001', '550e8400-e29b-41d4-a716-446655440003', '2026-05-18', '2026-05-20', 'delivered', 51000.00, 'Direct delivery to retail warehouse'),
  ('550e8400-e29b-41d4-a716-446655440031', 'PO-2026-0002', '550e8400-e29b-41d4-a716-446655440004', '2026-05-20', NULL, 'processing', 29000.00, 'Express delivery requested')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (id, order_id, product_id, quantity, unit_price, total_price)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440005', 100, 420.00, 42000.00), -- 100 bags of Atta
  ('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440007', 180, 50.00, 9000.00),   -- 180 packets of Sooji
  ('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440006', 10, 2100.00, 21000.00),  -- 10 bags of Maida
  ('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440008', 10, 800.00, 8000.00)     -- 10 bags of Bran
ON CONFLICT (id) DO NOTHING;

-- Seed Stock Outward (Dispatched quantities deduct from product stock automatically via trigger)
INSERT INTO public.stock_outward (id, product_id, quantity, order_id, reason, outward_date, notes)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440005', 100, '550e8400-e29b-41d4-a716-446655440030', 'Order Dispatch PO-2026-0001', '2026-05-20', 'Dispatched fully in Good condition'),
  ('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440007', 180, '550e8400-e29b-41d4-a716-446655440030', 'Order Dispatch PO-2026-0001', '2026-05-20', 'Dispatched fully in Good condition')
ON CONFLICT (id) DO NOTHING;

-- Seed Wastage (Deducts from stock automatically via trigger)
INSERT INTO public.wastage (id, product_id, quantity, reason, wastage_date, notes)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440005', 5, 'Bags damaged due to transport humidity', '2026-05-15', 'Milling area leakage issue now fixed'),
  ('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440007', 12, 'Pouch seals defective in batch', '2026-05-18', 'Sent back to packaging line for review')
ON CONFLICT (id) DO NOTHING;

-- Seed Logistics
INSERT INTO public.logistics (id, order_id, vehicle_number, driver_name, driver_phone, dispatch_date, delivery_date, route, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440030', 'UP-78-T-9876', 'Harish Yadav', '9933445522', '2026-05-20', '2026-05-20', 'Kanpur Factory to Mall Road Outlets', 'delivered'),
  ('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440031', 'UP-32-A-1234', 'Manoj Shukla', '9988112233', '2026-05-22', NULL, 'Kanpur to Lucknow Transport Nagar', 'in_transit')
ON CONFLICT (id) DO NOTHING;

-- Seed Expenses
INSERT INTO public.expenses (id, category, amount, description, expense_date, receipt_url, approved_by, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440080', 'transport', 4500.00, 'Diesel charges for UP-78-T-9876 batch dispatch', '2026-05-20', NULL, NULL, 'approved'),
  ('550e8400-e29b-41d4-a716-446655440081', 'utility', 8200.00, 'Electricity bill for Milling Unit 1 (May 2026)', '2026-05-22', NULL, NULL, 'pending'),
  ('550e8400-e29b-41d4-a716-446655440082', 'maintenance', 3200.00, 'Repair of packing machine conveyor belt', '2026-05-24', NULL, NULL, 'approved')
ON CONFLICT (id) DO NOTHING;

-- Seed Payroll for May 2026 dynamically (utilizing the calculate_payroll PostgreSQL function)
INSERT INTO public.payroll (employee_id, month, year, days_present, basic_salary, net_salary, payment_status)
SELECT 
  emp.id,
  '2026-05',
  2026,
  COALESCE((
    SELECT COUNT(*) 
    FROM public.attendance att 
    WHERE att.employee_id = emp.id 
      AND EXTRACT(MONTH FROM att.date) = 5 
      AND EXTRACT(YEAR FROM att.date) = 2026 
      AND att.status IN ('present', 'half_day')
  ), 0),
  emp.salary,
  public.calculate_payroll(emp.id, 5, 2026),
  'paid'
FROM public.employees emp
ON CONFLICT (employee_id, month, year) DO NOTHING;

