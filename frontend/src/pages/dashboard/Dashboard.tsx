import React, { useEffect, useState, ReactNode } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Empty,
  Spin,
  Alert,
} from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreOutlined,
  DollarOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { productService } from '@services/inventoryService';
import { employeeService, attendanceService, payrollService } from '@services/hrService';
import { orderService, vendorService } from '@services/vendorService';
import { expenseService, wastageService } from '@services/operationsService';
import { useAppSelector } from '@redux/hooks';
import dayjs from 'dayjs';
import { ExportOptions } from '@components/shared/ExportOptions';
import EmployeeDashboard from '../employees/EmployeeDashboard';
import './Dashboard.css';

type UserRole = 'admin' | 'super_admin' | 'owner' | 'hr_manager' | 'warehouse_manager' | 'accountant' | 'vendor_manager' | 'logistics_manager' | 'production_manager' | 'sales_executive' | 'employee';

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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

const Dashboard: React.FC = () => {
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

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e'];

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <Card hoverable>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        valueStyle={{ color }}
      />
    </Card>
  );

  const roleNameMap: Record<UserRole | 'undefined', string> = {
    admin: 'Administrator',
    super_admin: 'Super Admin',
    owner: 'Owner',
    hr_manager: 'HR Manager',
    warehouse_manager: 'Warehouse Manager',
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
    hr_manager: 'HR dashboard with employee headcount, payroll tracking, and attendance summaries.',
    warehouse_manager: 'Warehouse controls for inventory, stock movement, and order readiness.',
    accountant: 'Finance dashboard focused on expenses, payroll, and reporting insights.',
    vendor_manager: 'Supplier and purchase order insights for vendors and procurement.',
    employee: 'General employee dashboard for self-service and overview.',
    logistics_manager: 'Logistics tracking, stock dispatching, and inventory movements.',
    production_manager: 'Production tracking, BOM management, and manufacturing operations.',
    sales_executive: 'Sales performance, revenue trends, and order management.',
    undefined: 'Your account is logged in, but no business role is assigned yet.',
  };

  const cards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <AppstoreOutlined />,
      color: '#667eea',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'production_manager', 'sales_executive'].includes(selectedRole),
    },
    {
      title: 'Current Stock',
      value: stats.currentStock,
      icon: <AppstoreOutlined />,
      color: '#2563eb',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'production_manager'].includes(selectedRole),
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockAlerts,
      icon: <WarningOutlined />,
      color: '#f97316',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'production_manager'].includes(selectedRole),
    },
    {
      title: 'Total Employees',
      value: stats.employeesCount,
      icon: <UserOutlined />,
      color: '#764ba2',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'hr_manager'].includes(selectedRole),
    },
    {
      title: 'Attendance',
      value: `${stats.attendancePercentage}%`,
      icon: <UserOutlined />,
      color: '#22c55e',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'hr_manager', 'production_manager'].includes(selectedRole),
    },
    {
      title: 'Payroll Processed',
      value: stats.payrollProcessed ? 'Yes' : 'No',
      icon: <DollarOutlined />,
      color: '#10b981',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'hr_manager', 'accountant'].includes(selectedRole),
    },
    {
      title: 'Total Orders',
      value: stats.pendingOrders + stats.confirmedOrders,
      icon: <ShoppingCartOutlined />,
      color: '#f59e0b',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'vendor_manager', 'logistics_manager', 'sales_executive'].includes(selectedRole),
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <ShoppingCartOutlined />,
      color: '#f97316',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'vendor_manager', 'logistics_manager', 'sales_executive'].includes(selectedRole),
    },
    {
      title: 'Confirmed Orders',
      value: stats.confirmedOrders,
      icon: <ShoppingCartOutlined />,
      color: '#10b981',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'vendor_manager', 'logistics_manager', 'sales_executive'].includes(selectedRole),
    },
    {
      title: 'Monthly Expenses',
      value: `₹${stats.monthlyExpenses.toLocaleString()}`,
      icon: <DollarOutlined />,
      color: '#ef4444',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'hr_manager', 'accountant'].includes(selectedRole),
    },
    {
      title: 'Wastage %',
      value: `${stats.wastagePercentage}%`,
      icon: <WarningOutlined />,
      color: '#f43f5e',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'production_manager'].includes(selectedRole),
    },
    {
      title: 'Vendor Count',
      value: stats.vendorCount,
      icon: <ShoppingCartOutlined />,
      color: '#2563eb',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'vendor_manager', 'logistics_manager'].includes(selectedRole),
    },
    {
      title: 'Sales Revenue (MTD)',
      value: `₹${stats.salesMonthlyRevenue.toLocaleString()}`,
      icon: <DollarOutlined />,
      color: '#10b981',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'sales_executive'].includes(selectedRole),
    },
    {
      title: "Today's Sales Revenue",
      value: `₹${stats.salesTodayRevenue.toLocaleString()}`,
      icon: <DollarOutlined />,
      color: '#4f46e5',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'sales_executive'].includes(selectedRole),
    },
  ];

  const visibleCards = cards.filter((card) => card.visible);

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
            style={{ marginBottom: '24px' }}
          />
        )}

        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          {visibleCards.map((card) => (
            <Col xs={24} sm={12} lg={6} key={card.title}>
              <StatCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
              />
            </Col>
          ))}
        </Row>

        {/* Revenue Trend Chart (Sales & Admin) */}
      {(role === 'admin' || role === 'super_admin' || role === 'owner' || role === 'sales_executive') && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <Card title="7-Day Revenue Trend" hoverable>
              {stats.revenueTrend && stats.revenueTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#52c41a" activeDot={{ r: 8 }} strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No revenue data available" />
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Charts */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                role === 'hr_manager'
                  ? 'Attendance Breakdown'
                  : role === 'vendor_manager'
                  ? 'Vendor Activity'
                  : role === 'accountant'
                  ? 'Expense Performance'
                  : 'Stock by Category'
              }
              hoverable
            >
              {role === 'hr_manager' ? (
                chartData.attendance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.attendance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#4f46e5"
                        dataKey="value"
                      >
                        {chartData.attendance.map((_, index) => (
                          <Cell key={`cell-attendance-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="No attendance data" />
                )
              ) : role === 'vendor_manager' ? (
                chartData.vendorOrders.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.vendorOrders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="No vendor data" />
                )
              ) : role === 'accountant' ? (
                chartData.expensesTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.expensesTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#4f46e5" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="No expense data" />
                )
              ) : chartData.inventory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.inventory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No data" />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                role === 'accountant' || role === 'hr_manager'
                  ? 'Monthly Expense Summary'
                  : role === 'vendor_manager'
                  ? 'Purchase Order Status'
                  : 'Order Status'
              }
              hoverable
            >
              {role === 'accountant' || role === 'hr_manager' ? (
                chartData.expensesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ₹${value}`}
                        outerRadius={80}
                        fill="#4f46e5"
                        dataKey="amount"
                      >
                        {chartData.expensesByCategory.map((_, index) => (
                          <Cell key={`cell-expense-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="No expense data" />
                )
              ) : chartData.orders.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.orders}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#4f46e5"
                      dataKey="value"
                    >
                      {chartData.orders.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No data" />
              )}
            </Card>
          </Col>
        </Row>

        {/* Expense Trend */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card title="Monthly Expense Trend" hoverable>
              {chartData.expensesTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.expensesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="No data" />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
