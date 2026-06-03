// Environment variables
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// API configuration
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date formats
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm:ss';
export const MONTH_FORMAT = 'YYYY-MM';

// Currency
export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

// Storage buckets
export const STORAGE_BUCKETS = {
  PAYSLIPS: 'payslips',
  INVOICES: 'invoices',
  RECEIPTS: 'receipts',
  REPORTS: 'reports',
  DOCUMENTS: 'documents',
};

// Notification events
export const NOTIFICATION_EVENTS = {
  PAYROLL_GENERATED: 'payroll_generated',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_DISPATCHED: 'order_dispatched',
  ATTENDANCE_REMINDER: 'attendance_reminder',
};

// Cache keys
export const CACHE_KEYS = {
  EMPLOYEES: 'employees',
  PRODUCTS: 'products',
  VENDORS: 'vendors',
  ORDERS: 'orders',
};

// UI Constants
export const DEBOUNCE_DELAY = 300;
export const ANIMATION_DURATION = 300;
