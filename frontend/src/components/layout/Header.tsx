import { Layout, Avatar, Dropdown, Button, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@redux/hooks';
import { useSignOut } from '@hooks/useAuth';
import './Header.css';

const { Header } = Layout;

interface TopHeaderProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
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
