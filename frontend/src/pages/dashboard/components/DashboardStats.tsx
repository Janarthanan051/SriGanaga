import React, { ReactNode } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreOutlined,
  DollarOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => (
  <Card hoverable onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
    <Statistic
      title={title}
      value={value}
      prefix={icon}
      valueStyle={{ color }}
    />
  </Card>
);

interface DashboardStatsProps {
  stats: any;
  selectedRole?: UserRole;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, selectedRole }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <AppstoreOutlined />,
      color: '#667eea',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'production_manager', 'sales_executive'].includes(selectedRole),
      onClick: () => navigate('/inventory'),
    },
    {
      title: 'Current Stock',
      value: stats.currentStock,
      icon: <AppstoreOutlined />,
      color: '#2563eb',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'production_manager'].includes(selectedRole),
      onClick: () => navigate('/inventory'),
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockAlerts,
      icon: <WarningOutlined />,
      color: '#f97316',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'production_manager'].includes(selectedRole),
      onClick: () => navigate('/inventory'),
    },
    {
      title: 'Total Employees',
      value: stats.employeesCount,
      icon: <UserOutlined />,
      color: '#764ba2',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'hr_manager'].includes(selectedRole),
      onClick: () => navigate('/employees'),
    },
    {
      title: 'Attendance',
      value: `${stats.attendancePercentage}%`,
      icon: <UserOutlined />,
      color: '#22c55e',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'hr_manager', 'production_manager'].includes(selectedRole),
      onClick: () => navigate('/attendance'),
    },
    {
      title: 'Payroll Processed',
      value: stats.payrollProcessed ? 'Yes' : 'No',
      icon: <DollarOutlined />,
      color: '#10b981',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'hr_manager', 'accountant'].includes(selectedRole),
      onClick: () => navigate('/payroll'),
    },
    {
      title: 'Total Orders',
      value: stats.pendingOrders + stats.confirmedOrders,
      icon: <ShoppingCartOutlined />,
      color: '#f59e0b',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'vendor_manager', 'logistics_manager', 'sales_executive'].includes(selectedRole),
      onClick: () => navigate('/orders'),
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <ShoppingCartOutlined />,
      color: '#f97316',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'vendor_manager', 'logistics_manager', 'sales_executive'].includes(selectedRole),
      onClick: () => navigate('/orders'),
    },
    {
      title: 'Confirmed Orders',
      value: stats.confirmedOrders,
      icon: <ShoppingCartOutlined />,
      color: '#10b981',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'vendor_manager', 'logistics_manager', 'sales_executive'].includes(selectedRole),
      onClick: () => navigate('/orders'),
    },
    {
      title: 'Monthly Expenses',
      value: `₹${(stats.monthlyExpenses || 0).toLocaleString()}`,
      icon: <DollarOutlined />,
      color: '#ef4444',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'hr_manager', 'accountant'].includes(selectedRole),
      onClick: () => navigate('/expenses'),
    },
    {
      title: 'Wastage %',
      value: `${stats.wastagePercentage || 0}%`,
      icon: <WarningOutlined />,
      color: '#f43f5e',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'warehouse_manager', 'store_keeper', 'production_manager'].includes(selectedRole),
      onClick: () => navigate('/wastage'),
    },
    {
      title: 'Vendor Count',
      value: stats.vendorCount,
      icon: <ShoppingCartOutlined />,
      color: '#2563eb',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'vendor_manager', 'logistics_manager'].includes(selectedRole),
      onClick: () => navigate('/vendors'),
    },
    {
      title: 'Sales Revenue (MTD)',
      value: `₹${(stats.salesMonthlyRevenue || 0).toLocaleString()}`,
      icon: <DollarOutlined />,
      color: '#10b981',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'sales_executive'].includes(selectedRole),
      onClick: () => navigate('/reports'),
    },
    {
      title: "Today's Sales Revenue",
      value: `₹${(stats.salesTodayRevenue || 0).toLocaleString()}`,
      icon: <DollarOutlined />,
      color: '#4f46e5',
      visible: !selectedRole || ['admin', 'super_admin', 'owner', 'sales_executive'].includes(selectedRole),
      onClick: () => navigate('/reports'),
    },
  ];

  const visibleCards = cards.filter((card) => card.visible);

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      {visibleCards.map((card) => (
        <Col xs={24} sm={12} lg={6} key={card.title}>
          <StatCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            onClick={'onClick' in card ? card.onClick : undefined}
          />
        </Col>
      ))}
    </Row>
  );
};

export default DashboardStats;
