import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import { Provider } from 'react-redux';
import { store } from '@redux/store';
import { useAuth } from '@hooks/useAuth';
import ProtectedRoute from '@components/shared/ProtectedRoute';
import MainLayout from '@components/layout/MainLayout';

// Auth Pages (eagerly loaded — first thing user sees)
import LoginPage from '@pages/auth/LoginPage';
import SignUpPage from '@pages/auth/SignUpPage';

// Lazy-loaded pages (code-split per route)
const Dashboard = React.lazy(() => import('@pages/dashboard/Dashboard'));
const EmployeesPage = React.lazy(() => import('@pages/employees/Employees'));
const InventoryPage = React.lazy(() => import('@pages/inventory/Inventory'));
const StockInwardPage = React.lazy(() => import('@pages/inventory/StockInward'));
const StockOutwardPage = React.lazy(() => import('@pages/inventory/StockOutward'));
const OrdersPage = React.lazy(() => import('@pages/orders/Orders'));
const VendorsPage = React.lazy(() => import('@pages/vendors/Vendors'));
const VendorDashboard = React.lazy(() => import('@pages/vendors/VendorDashboard'));
const SuppliersPage = React.lazy(() => import('@pages/suppliers/Suppliers'));
const SupplierDashboard = React.lazy(() => import('@pages/suppliers/SupplierDashboard'));
const AttendancePage = React.lazy(() => import('@pages/attendance/Attendance'));
const PayrollPage = React.lazy(() => import('@pages/payroll/Payroll'));
const ExpensesPage = React.lazy(() => import('@pages/expenses/Expenses'));
const LogisticsPage = React.lazy(() => import('@pages/logistics/Logistics'));
const WastagePage = React.lazy(() => import('@pages/wastage/Wastage'));
const ReportsPage = React.lazy(() => import('@pages/reports/Reports'));
const PurchaseRequestsPage = React.lazy(() => import('@pages/purchasing/PurchaseRequests'));
const ProductionOrders = React.lazy(() => import('@pages/production/orders/ProductionOrders'));
const Batches = React.lazy(() => import('@pages/production/batches/Batches'));
const QualityControl = React.lazy(() => import('@pages/production/qc/QualityControl'));
const GoodsReceiptsPage = React.lazy(() => import('@pages/inventory/receipts/GoodsReceipts'));
const WarehouseTransfersPage = React.lazy(() => import('@pages/inventory/transfers/WarehouseTransfers'));
const CustomersPage = React.lazy(() => import('@pages/customers/Customers'));
const CustomerDashboard = React.lazy(() => import('@pages/customers/CustomerDashboard'));
const BOMPage = React.lazy(() => import('@pages/production/BillOfMaterials'));
const SettingsPage = React.lazy(() => import('@pages/settings/Settings'));
const TallySyncPage = React.lazy(() => import('@pages/tally/TallySync'));
const AccessDeniedPage = React.lazy(() => import('@pages/AccessDenied'));
const LandingPage = React.lazy(() => import('@pages/LandingPage'));
const PendingApprovalPage = React.lazy(() => import('@pages/auth/PendingApproval'));

// Suspense fallback
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <Spin size="large" tip="Loading..." />
  </div>
);

// 404 page
const NotFoundPage = () => <div style={{ padding: '50px', textAlign: 'center' }}>404 - Page Not Found</div>;

const AppRoutes: React.FC = () => {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" tip="Initializing..." /></div>;
  }

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute pageKey="dashboard">
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute pageKey="employees">
            <MainLayout>
              <EmployeesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute pageKey="attendance">
            <MainLayout>
              <AttendancePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payroll"
        element={
          <ProtectedRoute pageKey="payroll">
            <MainLayout>
              <PayrollPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute pageKey="inventory">
            <MainLayout>
              <InventoryPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/stock-inward"
        element={
          <ProtectedRoute pageKey="stock-inward">
            <MainLayout>
              <StockInwardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/stock-outward"
        element={
          <ProtectedRoute pageKey="stock-outward">
            <MainLayout>
              <StockOutwardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/goods-receipts"
        element={
          <ProtectedRoute pageKey="goods-receipts">
            <MainLayout>
              <GoodsReceiptsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/warehouse-transfers"
        element={
          <ProtectedRoute pageKey="warehouse-transfers">
            <MainLayout>
              <WarehouseTransfersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchase-requests"
        element={
          <ProtectedRoute pageKey="purchase-requests">
            <MainLayout>
              <PurchaseRequestsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute pageKey="orders">
            <MainLayout>
              <OrdersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendors"
        element={
          <ProtectedRoute pageKey="vendors">
            <MainLayout>
              <VendorsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendors/:id"
        element={
          <ProtectedRoute pageKey="vendors">
            <MainLayout>
              <VendorDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/suppliers"
        element={
          <ProtectedRoute pageKey="suppliers">
            <MainLayout>
              <SuppliersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers/:id"
        element={
          <ProtectedRoute pageKey="suppliers">
            <MainLayout>
              <SupplierDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute pageKey="customers">
            <MainLayout>
              <CustomersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute pageKey="customers">
            <MainLayout>
              <CustomerDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bill-of-materials"
        element={
          <ProtectedRoute pageKey="bill-of-materials">
            <MainLayout>
              <BOMPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/logistics"
        element={
          <ProtectedRoute pageKey="logistics">
            <MainLayout>
              <LogisticsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedRoute pageKey="expenses">
            <MainLayout>
              <ExpensesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/wastage"
        element={
          <ProtectedRoute pageKey="wastage">
            <MainLayout>
              <WastagePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute pageKey="reports">
            <MainLayout>
              <ReportsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute pageKey="settings">
            <MainLayout>
              <SettingsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tally-sync"
        element={
          <ProtectedRoute pageKey="tally-sync">
            <MainLayout>
              <TallySyncPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Landing page route */}
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/pending-approval"
        element={
          <ProtectedRoute pageKey="pending-approval">
            <PendingApprovalPage />
          </ProtectedRoute>
        }
      />

      <Route path="/access-denied" element={
        <ProtectedRoute>
          <MainLayout>
            <AccessDeniedPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Production */}
      <Route path="/bill-of-materials" element={<ProtectedRoute><MainLayout><BOMPage /></MainLayout></ProtectedRoute>} />
      <Route path="/production-orders" element={<ProtectedRoute><MainLayout><ProductionOrders /></MainLayout></ProtectedRoute>} />
      <Route path="/batches" element={<ProtectedRoute><MainLayout><Batches /></MainLayout></ProtectedRoute>} />
      <Route path="/qc" element={<ProtectedRoute><MainLayout><QualityControl /></MainLayout></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#4f46e5', // Modern Indigo primary color
            colorInfo: '#06b6d4', // Cyan info
            colorSuccess: '#10b981', // Emerald success
            colorWarning: '#f59e0b', // Amber warning
            colorError: '#ef4444', // Rose error
            colorTextBase: '#1e293b', // Slate-800 text
            colorBgBase: '#ffffff',
            colorBgLayout: '#f8fafc', // Very soft grey/blue backdrop
            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
            borderRadius: 12, // Softer, more modern rounded corners
          },
          components: {
            Card: {
              boxShadowTertiary: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              colorBorderSecondary: '#f1f5f9',
            },
            Button: {
              fontWeight: 600,
              borderRadius: 8,
            },
            Table: {
              headerBg: '#f8fafc',
              headerColor: '#475569',
              headerBorderRadius: 8,
            },
          },
        }}
      >
        <Router>
          <AppRoutes />
        </Router>
      </ConfigProvider>
    </Provider>
  );
};


export default App;
