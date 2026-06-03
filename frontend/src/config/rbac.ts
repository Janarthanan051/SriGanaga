export const RBAC_PERMISSIONS = {
  admin: [
    'employees.manage',
    'attendance.manage',
    'payroll.manage',
    'inventory.manage',
    'orders.manage',
    'vendors.manage',
    'logistics.manage',
    'expenses.manage',
    'reports.view',
    'settings.manage',
    'users.manage',
  ],
  hr_manager: [
    'employees.view',
    'employees.edit',
    'attendance.view',
    'attendance.manage',
    'payroll.view',
    'payroll.generate',
    'reports.view',
  ],
  warehouse_manager: [
    'inventory.view',
    'inventory.manage',
    'stock.manage',
    'orders.view',
    'logistics.view',
    'logistics.manage',
    'wastage.manage',
  ],
  accountant: [
    'expenses.view',
    'expenses.manage',
    'reports.view',
    'reports.generate',
    'payroll.view',
  ],
  vendor_manager: [
    'vendors.view',
    'vendors.manage',
    'suppliers.view',
    'suppliers.manage',
    'orders.view',
    'orders.manage',
  ],
};

export const PAGE_ACCESS: Record<string, string[]> = {
  admin: [
    'dashboard', 'employees', 'attendance', 'payroll', 'inventory', 'products',
    'stock-inward', 'stock-outward', 'vendors', 'suppliers', 'orders',
    'logistics', 'expenses', 'wastage', 'reports', 'tally-sync', 'settings',
    'customers', 'bill-of-materials', 'purchase-requests', 'goods-receipts', 'warehouse-transfers',
    'production-orders', 'batches', 'qc'
  ],
  super_admin: [
    'dashboard', 'employees', 'attendance', 'payroll', 'inventory', 'products',
    'stock-inward', 'stock-outward', 'vendors', 'suppliers', 'orders',
    'logistics', 'expenses', 'wastage', 'reports', 'tally-sync', 'settings',
    'customers', 'bill-of-materials', 'purchase-requests', 'goods-receipts', 'warehouse-transfers',
    'production-orders', 'batches', 'qc'
  ],
  owner: [
    'dashboard', 'employees', 'attendance', 'payroll', 'inventory', 'products',
    'stock-inward', 'stock-outward', 'vendors', 'suppliers', 'orders',
    'logistics', 'expenses', 'wastage', 'reports', 'tally-sync', 'settings',
    'customers', 'bill-of-materials', 'purchase-requests', 'goods-receipts', 'warehouse-transfers',
    'production-orders', 'batches', 'qc'
  ],
  manager: [
    'dashboard', 'employees', 'attendance', 'inventory', 'products',
    'stock-inward', 'stock-outward', 'vendors', 'suppliers', 'orders',
    'logistics', 'expenses', 'wastage', 'reports', 'customers', 'bill-of-materials',
    'purchase-requests', 'goods-receipts', 'warehouse-transfers',
    'production-orders', 'batches', 'qc'
  ],
  production_manager: [
    'dashboard', 'inventory', 'products', 'stock-inward', 'stock-outward', 
    'wastage', 'bill-of-materials', 'reports', 'purchase-requests',
    'production-orders', 'batches', 'qc'
  ],
  store_keeper: [
    'dashboard', 'inventory', 'products', 'stock-inward', 'stock-outward', 
    'wastage', 'logistics', 'purchase-requests', 'goods-receipts', 'warehouse-transfers'
  ],
  sales_executive: [
    'dashboard', 'customers', 'orders', 'logistics'
  ],
  hr_manager: ['dashboard', 'employees', 'attendance', 'payroll', 'reports'],
  warehouse_manager: [
    'dashboard', 'inventory', 'products', 'stock-inward', 'stock-outward',
    'orders', 'logistics', 'wastage', 'goods-receipts', 'warehouse-transfers'
  ],
  accountant: ['dashboard', 'expenses', 'reports', 'payroll', 'tally-sync', 'orders'],
  vendor_manager: ['dashboard', 'vendors', 'suppliers', 'orders'],
};
