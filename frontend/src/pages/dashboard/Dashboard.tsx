import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Spin,
  Alert,
} from 'antd';
import { WarningOutlined } from '@ant-design/icons';

import { productService } from '@services/inventoryService';
import { employeeService, attendanceService, payrollService } from '@services/hrService';
import { orderService, vendorService } from '@services/vendorService';
import { expenseService, wastageService } from '@services/operationsService';
import { useAppSelector } from '@redux/hooks';
import dayjs from 'dayjs';
import { ExportOptions } from '@components/shared/ExportOptions';
import EmployeeDashboard from '../employees/EmployeeDashboard';
import './Dashboard.css';

import { UserRole } from '@/types';
import DashboardStats from './components/DashboardStats';
import RevenueTrend from './components/RevenueTrend';
import ActivityCharts from './components/ActivityCharts';
import ExpenseTrend from './components/ExpenseTrend';

interface DashboardStats {
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
  vendorCount: number;
  salesMonthlyRevenue: number;
  salesTodayRevenue: number;
  revenueTrend: Array<{name: string, revenue: number}>;
}

interface ChartData {
  inventory: Array<{ name: string; stock: number }>;
  orders: Array<{ name: string; value: number }>;
  expensesByCategory: Array<{ name: string; amount: number }>;
  expensesTrend: Array<{ name: string; amount: number }>;
  attendance: Array<{ name: string; value: number }>;
  vendorOrders: Array<{ name: string; value: number }>;
}



const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const role = useAppSelector((state) => state.auth.user?.user_metadata?.role);
  const validRoles: UserRole[] = ['admin', 'super_admin', 'owner', 'hr_manager', 'warehouse_manager', 'accountant', 'vendor_manager', 'logistics_manager', 'production_manager', 'sales_executive', 'employee'];
  const selectedRole = validRoles.includes(role as UserRole) ? (role as UserRole) : undefined;
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    currentStock: 0,
    lowStockAlerts: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    employeesCount: 0,
    attendancePercentage: 0,
    payrollProcessed: false,
    monthlyExpenses: 0,
    wastagePercentage: 0,
    vendorCount: 0,
    salesMonthlyRevenue: 0,
    salesTodayRevenue: 0,
    revenueTrend: []
  });

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData>({
    inventory: [],
    orders: [],
    expensesByCategory: [],
    expensesTrend: [],
    attendance: [],
    vendorOrders: [],
  });

  useEffect(() => {
    if (role === 'employee') {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const currentMonth = new Date().toISOString().slice(0, 7);

        const isAdmin = role === 'admin' || role === 'super_admin' || role === 'owner';
        const isHr = role === 'hr_manager';
        const isWarehouse = role === 'warehouse_manager' || role === 'store_keeper';
        const isAccountant = role === 'accountant';
        const isVendor = role === 'vendor_manager';
        const isLogistics = role === 'logistics_manager';
        const isProduction = role === 'production_manager';
        const isSales = role === 'sales_executive';

        const products =
          isAdmin || isWarehouse || isProduction || isVendor || isSales
            ? (await productService.getProducts(1, 100)).data
            : [];
        const employees =
          isAdmin || isHr || isProduction
            ? (await employeeService.getEmployees(1, 100)).data
            : [];
        const orders =
          isAdmin || isWarehouse || isVendor || isLogistics || isSales || isProduction
            ? (await orderService.getOrders(1, 100)).data
            : [];
        const expensesResult =
          isAdmin || isHr || isAccountant
            ? await expenseService.getMonthlyExpenses(currentMonth)
            : { total: 0 };
        const recentExpenses =
          isAdmin || isHr || isAccountant
            ? await expenseService.getExpensesTrend(6)
            : [];
        const vendors =
          isAdmin || isVendor || isWarehouse || isLogistics
            ? (await vendorService.getVendors(1, 100)).data
            : [];
        const payrolls =
          isAdmin || isHr || isAccountant
            ? await payrollService.getPayroll()
            : [];
        const attendanceRecords =
          isAdmin || isHr || isProduction
            ? await attendanceService.getAttendance()
            : [];
        const wastageResult =
          isAdmin || isWarehouse || isLogistics || isProduction
            ? await wastageService.getWastage(1, 100)
            : { data: [], total: 0 };

        const totalProducts = products.length;
        const currentStock = products.reduce((sum, item) => sum + (item.current_stock || 0), 0);
        const lowStockAlerts = products.filter((item) => (item.current_stock || 0) <= (item.reorder_level || 0)).length;
        const pendingOrders = orders.filter((order) => order.status === 'pending').length;
        const confirmedOrders = orders.filter((order) => order.status === 'confirmed').length;
        const employeesCount = employees.length;
        const presentCount = attendanceRecords.filter((record) => record.status === 'present').length;
        const attendancePercentage = attendanceRecords.length
          ? Math.round((presentCount / attendanceRecords.length) * 100)
          : 0;
        const payrollProcessed = payrolls.some((payroll) => payroll.payment_status === 'paid');
        const monthlyExpenses = 'total' in expensesResult ? (expensesResult.total || 0) : 0;
        const vendorCount = vendors.length;
        const wastageQuantity = (wastageResult.data || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
        const wastagePercentage = currentStock > 0 ? Number(((wastageQuantity / currentStock) * 100).toFixed(1)) : 0;

        const salesAnalytics =
          isAdmin || isSales
            ? await import('@services/salesService').then(m => m.salesService.getSalesAnalytics())
            : { monthlyRevenue: 0, todayRevenue: 0, revenueTrend: [] };

        const categoryData = {} as Record<string, number>;
        products.forEach((product) => {
          const categoryName = product.category || 'Uncategorized';
          categoryData[categoryName] = (categoryData[categoryName] || 0) + (product.current_stock || 0);
        });

        const inventoryChart = Object.entries(categoryData).map(([name, value]) => ({
          name,
          stock: value,
        }));

        const orderStatusData = [
          { name: 'Pending', value: pendingOrders },
          { name: 'Confirmed', value: confirmedOrders },
          { name: 'Other', value: Math.max(0, orders.length - pendingOrders - confirmedOrders) },
        ];

        const attendanceData = [
          { name: 'Present', value: presentCount },
          { name: 'Absent', value: Math.max(0, attendanceRecords.length - presentCount) },
        ];

        const vendorOrderData = [
          { name: 'Vendors', value: vendorCount },
          { name: 'Orders', value: orders.length },
        ];

        setStats({
          totalProducts,
          currentStock,
          lowStockAlerts,
          pendingOrders,
          confirmedOrders,
          employeesCount,
          attendancePercentage,
          payrollProcessed,
          monthlyExpenses,
          wastagePercentage,
          vendorCount,
          salesMonthlyRevenue: salesAnalytics.monthlyRevenue,
          salesTodayRevenue: salesAnalytics.todayRevenue,
          revenueTrend: salesAnalytics.revenueTrend || [],
        });

        const trendMonths = Array.from({ length: 6 }, (_, i) => {
          return dayjs().subtract(5 - i, 'month').format('YYYY-MM');
        });
        const monthlyTotals = {} as Record<string, number>;
        trendMonths.forEach((m) => {
          monthlyTotals[m] = 0;
        });
        recentExpenses.forEach((exp) => {
          if (exp.expense_date) {
            const mKey = exp.expense_date.substring(0, 7);
            if (monthlyTotals[mKey] !== undefined) {
              monthlyTotals[mKey] += exp.amount || 0;
            }
          }
        });
        const expensesTrend = trendMonths.map((m) => ({
          name: dayjs(m + '-01').format('MMM YY'),
          amount: monthlyTotals[m],
        }));

        const categoryExpenses = {} as Record<string, number>;
        const currentMonthExpenses = 'data' in expensesResult ? (expensesResult.data || []) : [];
        currentMonthExpenses.forEach((exp) => {
          const cat = exp.category ? exp.category.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Miscellaneous';
          categoryExpenses[cat] = (categoryExpenses[cat] || 0) + (exp.amount || 0);
        });
        const expensesByCategory = Object.entries(categoryExpenses).map(([name, value]) => ({
          name,
          amount: value,
        }));

        setChartData({
          inventory: inventoryChart.slice(0, 6),
          orders: orderStatusData,
          expensesByCategory,
          expensesTrend,
          attendance: attendanceData,
          vendorOrders: vendorOrderData,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role]);



  const roleNameMap: Record<UserRole | 'undefined', string> = {
    admin: 'Administrator',
    super_admin: 'Super Admin',
    owner: 'Owner',
    manager: 'Manager',
    hr_manager: 'HR Manager',
    warehouse_manager: 'Warehouse Manager',
    store_keeper: 'Store Keeper',
    accountant: 'Accountant',
    vendor_manager: 'Vendor Manager',
    employee: 'Employee',
    logistics_manager: 'Logistics Manager',
    production_manager: 'Production Manager',
    sales_executive: 'Sales Executive',
    undefined: 'Team Member',
  };

  const roleDescriptionMap: Record<UserRole | 'undefined', string> = {
    admin: 'Full ERP access with company-wide analytics and management controls.',
    super_admin: 'Full ERP access with company-wide analytics and management controls.',
    owner: 'Full ERP access with company-wide analytics and management controls.',
    manager: 'General management access and overview.',
    hr_manager: 'HR dashboard with employee headcount, payroll tracking, and attendance summaries.',
    warehouse_manager: 'Warehouse controls for inventory, stock movement, and order readiness.',
    store_keeper: 'Inventory management and stock alerts.',
    accountant: 'Finance dashboard focused on expenses, payroll, and reporting insights.',
    vendor_manager: 'Supplier and purchase order insights for vendors and procurement.',
    employee: 'General employee dashboard for self-service and overview.',
    logistics_manager: 'Logistics tracking, stock dispatching, and inventory movements.',
    production_manager: 'Production tracking, BOM management, and manufacturing operations.',
    sales_executive: 'Sales performance, revenue trends, and order management.',
    undefined: 'Your account is logged in, but no business role is assigned yet.',
  };


  if (role === 'employee') {
    return <EmployeeDashboard />;
  }

  return (
    <div className="dashboard" id="dashboard-content">
      <Spin spinning={loading}>
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>{selectedRole ? roleNameMap[selectedRole] : 'Enterprise Analytics Matrix'}</h2>
              <p>{selectedRole ? roleDescriptionMap[selectedRole] : 'Your dashboard will show role-based metrics once your assigned role is available.'}</p>
            </div>
            <ExportOptions 
              elementId="dashboard-content" 
              excelData={[]} // Full data export logic can be expanded here
              filenamePrefix="enterprise_analytics"
            />
          </div>
        </Card>

        {(!selectedRole && !loading) && (
          <Alert
            message="No valid role assigned"
            description="Your account is logged in, but the assigned role is missing or invalid. Ask your administrator to check your user role mapping."
            type="warning"
            showIcon
            closable
            style={{ marginBottom: '24px' }}
          />
        )}

        {stats.lowStockAlerts > 0 && role && (
          <Alert
            message={`${stats.lowStockAlerts} products with low stock`}
            description="Please check inventory for items below reorder level."
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            closable
            style={{ marginBottom: '24px', cursor: 'pointer' }}
            onClick={() => navigate('/inventory')}
          />
        )}

        <DashboardStats stats={stats} selectedRole={selectedRole} />
        <RevenueTrend trendData={stats.revenueTrend} role={selectedRole} />
        <ActivityCharts chartData={chartData} role={selectedRole} />
        <ExpenseTrend expensesTrend={chartData.expensesTrend} role={selectedRole} />
      </Spin>
    </div>
  );
};

export default Dashboard;
