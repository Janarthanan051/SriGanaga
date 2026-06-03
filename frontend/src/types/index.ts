// Auth Types
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    role?: UserRole;
    is_approved?: boolean;
  };
  created_at: string;
}

export type UserRole = 'admin' | 'super_admin' | 'owner' | 'manager' | 'hr_manager' | 'warehouse_manager' | 'accountant' | 'vendor_manager' | 'production_manager' | 'store_keeper' | 'sales_executive';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Employee Types
export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joining_date: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  bank_account?: string;
  bank_name?: string;
  ifsc_code?: string;
  aadhar_number?: string;
  pan_number?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  created_at: string;
  updated_at: string;
}

// Attendance Types
export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Payroll Types
export interface Payroll {
  id: string;
  employee_id: string;
  month: string;
  year: number;
  days_present: number;
  basic_salary: number;
  net_salary: number;
  payment_status: 'pending' | 'processed' | 'paid';
  payslip_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  product_type?: 'raw_material' | 'finished_good' | 'packaging';
  purchase_cost?: number;
  expiry_days?: number;
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  current_stock: number;
  reorder_level: number;
  unit_price: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Customer Types
export interface Customer {
  id: string;
  name: string;
  gst_number?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  billing_address?: string;
  shipping_address?: string;
  outstanding_balance: number;
  created_at: string;
  updated_at: string;
}

// BOM Types
export interface BillOfMaterials {
  id: string;
  product_id: string;
  bom_number: string;
  expected_yield: number;
  yield_unit: string;
  is_active: boolean;
  created_at: string;
  // Related product
  product?: Product;
  // Related items
  items?: BOMItem[];
}

export interface BOMItem {
  id: string;
  bom_id: string;
  raw_material_id: string;
  quantity_required: number;
  unit: string;
  created_at: string;
  // Related material
  raw_material?: Product;
}

// Stock Types
export interface StockInward {
  id: string;
  product_id: string;
  quantity: number;
  supplier_id?: string;
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  received_date: string;
  invoice_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StockOutward {
  id: string;
  product_id: string;
  quantity: number;
  order_id?: string;
  reason: string;
  outward_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Vendor Types
export interface Vendor {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst_number?: string;
  payment_terms?: string;
  outstanding_balance: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  materials_supplied?: string;
  created_at: string;
  updated_at: string;
}

// Order Types
export interface Order {
  id: string;
  order_number: string;
  vendor_id: string;
  order_date: string;
  delivery_date?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Logistics Types
export interface Logistics {
  id: string;
  order_id: string;
  vehicle_number: string;
  driver_name: string;
  driver_phone: string;
  dispatch_date: string;
  delivery_date?: string;
  route?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Wastage Types
export interface Wastage {
  id: string;
  product_id: string;
  quantity: number;
  reason: string;
  wastage_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Expense Types
export interface Expense {
  id: string;
  category: 'transport' | 'salary' | 'maintenance' | 'utility' | 'miscellaneous';
  amount: number;
  description: string;
  expense_date: string;
  receipt_url?: string;
  approved_by?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: 'payroll' | 'order' | 'attendance' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalProducts: number;
  currentStock: number;
  lowStockAlerts: number;
  pendingOrders: number;
  confirmedOrders: number;
  employeesCount: number;
  attendancePercentage: number;
  payrollProcessed: boolean;
  monthlyExpenses: number;
  wastagePercentage: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Phase 2: Purchasing Types
export interface PurchaseRequest {
  id: string;
  pr_number: string;
  requester_id: string;
  department?: string;
  status: 'pending' | 'approved' | 'rejected' | 'ordered';
  required_date?: string;
  notes?: string;
  created_at: string;
}

export interface PurchaseRequestItem {
  id: string;
  pr_id: string;
  product_id: string;
  quantity: number;
  unit: string;
  product?: Product;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  pr_id?: string;
  status: 'draft' | 'issued' | 'partially_received' | 'completed' | 'cancelled';
  total_amount: number;
  expected_delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GoodsReceipt {
  id: string;
  grn_number: string;
  po_id: string;
  received_by: string;
  receipt_date: string;
  status: 'received' | 'inspected' | 'rejected';
  notes?: string;
  created_at: string;
}

export interface WarehouseTransfer {
  id: string;
  transfer_number: string;
  source_warehouse: string;
  destination_warehouse: string;
  requested_by: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  transfer_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Phase 3: Production Types
export interface ProductionOrder {
  id: string;
  order_number: string;
  bom_id: string;
  planned_date: string;
  target_quantity: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  completed_date?: string;
  produced_quantity?: number;
  supervisor_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  batch_code: string;
  production_order_id?: string;
  product_id: string;
  manufacturing_date: string;
  expiry_date: string;
  quantity: number;
  status: 'quarantine' | 'passed' | 'rejected' | 'consumed';
  created_at: string;
  updated_at: string;
}

export interface QCReport {
  id: string;
  report_number: string;
  batch_id: string;
  inspector_id: string;
  inspection_date: string;
  status: 'passed' | 'rejected' | 'conditional';
  parameters?: Record<string, any>;
  comments?: string;
  created_at: string;
}
