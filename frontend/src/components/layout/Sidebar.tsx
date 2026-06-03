import React from 'react';
import { Layout, Menu, Drawer } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  TableOutlined,
  ShoppingOutlined,
  CarOutlined,
  FileTextOutlined,
  SettingOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@redux/hooks';
import { PAGE_ACCESS } from '@config/rbac';
import './Sidebar.css';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, isMobile }) => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const role = user?.user_metadata?.role;
  const allowedPages = role ? PAGE_ACCESS[role] : ['dashboard', 'settings'];

  const menuItems = [
    { key: '/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
    {
      key: 'hr',
      label: 'HR Management',
      icon: <TeamOutlined />,
      children: [
        { key: '/employees', label: 'Employees' },
        { key: '/attendance', label: 'Attendance' },
        { key: '/payroll', label: 'Payroll' },
      ],
    },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: <TableOutlined />,
      children: [
        { key: '/inventory', label: 'Products' },
        { key: '/stock-inward', label: 'Stock Inward' },
        { key: '/stock-outward', label: 'Stock Outward' },
        { key: '/goods-receipts', label: 'Goods Receipts (GRN)' },
        { key: '/warehouse-transfers', label: 'Warehouse Transfers' },
        { key: '/wastage', label: 'Wastage' },
      ],
    },
    {
      key: 'procurement',
      label: 'Procurement',
      icon: <ShoppingOutlined />,
      children: [
        { key: '/vendors', label: 'Vendors' },
        { key: '/suppliers', label: 'Suppliers' },
        { key: '/purchase-requests', label: 'Purchase Requests' },
        { key: '/orders', label: 'Purchase Orders' },
      ],
    },
    {
      key: 'sales',
      label: 'Sales',
      icon: <TeamOutlined />,
      children: [
        { key: '/customers', label: 'Customers' },
      ],
    },
    {
      key: 'production',
      label: 'Production',
      icon: <ExperimentOutlined />,
      children: [
        { key: '/bill-of-materials', label: 'Bill of Materials' },
        { key: '/production-orders', label: 'Production Orders' },
        { key: '/batches', label: 'Batch Management' },
        { key: '/qc', label: 'Quality Control' },
      ],
    },
    {
      key: 'operations',
      label: 'Operations',
      icon: <CarOutlined />,
      children: [
        { key: '/logistics', label: 'Logistics' },
        { key: '/expenses', label: 'Expenses' },
      ],
    },
    { key: '/reports', label: 'Reports', icon: <FileTextOutlined /> },
    { key: '/tally-sync', label: 'Tally Sync', icon: <FileTextOutlined /> },
    { key: '/settings', label: 'Settings', icon: <SettingOutlined /> },
  ];

  const normalizeRouteKey = (key: string) => key.replace(/^\//, '');

  const filteredMenuItems = menuItems
    .map((item) => {
      if (item.children) {
        const children = item.children.filter((child) => allowedPages.includes(normalizeRouteKey(child.key)));
        return { ...item, children };
      }

      return item;
    })
    .filter((item) => {
      if (item.children) return item.children.length > 0;
      return allowedPages.includes(normalizeRouteKey(item.key));
    });

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const sidebarContent = (
    <div className="sidebar-content">
      <div className="sidebar-logo">
        <h2>{collapsed ? 'SG' : 'Sri Ganga ERP'}</h2>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        items={filteredMenuItems}
        onClick={(e) => handleMenuClick(String(e.key))}
        style={{ marginTop: '20px' }}
      />
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => onToggle(true)}
        open={!collapsed}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      theme="dark"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {sidebarContent}
    </Sider>
  );
};

export default Sidebar;
