import { Layout, Avatar, Dropdown, Button, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@redux/hooks';
import { setUser } from '@redux/authSlice';
import { useSignOut } from '@hooks/useAuth';
import { UserRole } from '@/types';
import './Header.css';

const { Header } = Layout;

interface TopHeaderProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { signOut } = useSignOut();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      className="app-header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        background: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        boxShadow: 'none',
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => onToggle(!collapsed)}
        style={{ fontSize: '16px' }}
      />

      <Space>
        {user?.user_metadata?.role && (
          <Dropdown
            menu={{
              items: [
                { key: 'admin', label: 'Admin' },
                { key: 'super_admin', label: 'Super Admin' },
                { key: 'hr_manager', label: 'HR Manager' },
                { key: 'warehouse_manager', label: 'Warehouse Manager' },
                { key: 'logistics_manager', label: 'Logistics Manager' },
                { key: 'production_manager', label: 'Production Manager' },
                { key: 'store_keeper', label: 'Store Keeper' },
                { key: 'sales_executive', label: 'Sales Executive' },
                { key: 'accountant', label: 'Accountant' },
                { key: 'vendor_manager', label: 'Vendor Manager' },
                { key: 'employee', label: 'Employee' },
              ],
              onClick: (e) => {
                if (user) {
                  dispatch(
                    setUser({
                      ...user,
                      user_metadata: { ...user.user_metadata, role: e.key as UserRole },
                    })
                  );
                }
              },
            }}
            placement="bottomRight"
          >
            <Button size="small" style={{ marginRight: 16, background: '#e6f7ff', borderColor: '#91d5ff', color: '#096dd9' }}>
              View As: {user.user_metadata.role}
            </Button>
          </Dropdown>
        )}
        <Button type="text" icon={<BellOutlined />} />
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              style={{ backgroundColor: '#667eea' }}
              icon={<UserOutlined />}
            />
            <Typography.Text strong>{user?.user_metadata?.full_name || 'User'}</Typography.Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default TopHeader;
