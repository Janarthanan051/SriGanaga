import React, { useState } from 'react';
import { Card, Button, Result, message, Space } from 'antd';
import { HourglassOutlined, ReloadOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSignOut } from '@hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@redux/hooks';
import { setUser } from '@redux/authSlice';
import { authService } from '@services/authService';
import { User } from '@/types';
import './Auth.css';

const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { signOut } = useSignOut();
  const [checking, setChecking] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleCheckStatus = async () => {
    try {
      setChecking(true);
      // Fetch fresh user data from Supabase Auth
      const updatedUser = await authService.getCurrentUser(true);
      if (updatedUser) {
        dispatch(setUser(updatedUser as User));
        const approved = updatedUser.user_metadata?.is_approved !== false;
        if (approved) {
          message.success('Your account has been approved! Redirecting...');
          navigate('/dashboard');
        } else {
          message.info('Account approval is still pending. Please try again later.');
        }
      }
    } catch (error) {
      message.error('Failed to update status');
    } finally {
      setChecking(false);
    }
  };

  const roleLabel = user?.user_metadata?.role
    ? user.user_metadata.role.replace('_', ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
    : 'Manager';

  return (
    <div className="auth-container">
      <Card className="auth-card" style={{ maxWidth: 500, margin: '40px auto' }}>
        <Result
          icon={<HourglassOutlined style={{ fontSize: 50, color: '#f59e0b' }} />}
          status="warning"
          title="Account Pending Approval"
          subTitle={
            <div>
              <p style={{ fontSize: 16, marginBottom: 12 }}>
                Hello <strong>{user?.user_metadata?.full_name || 'User'}</strong>, your registration request as <strong>{roleLabel}</strong> has been received.
              </p>
              <p style={{ color: '#64748b' }}>
                For security reasons, manager accounts must be reviewed and approved by an administrator before access to the ERP modules is granted.
              </p>
            </div>
          }
          extra={[
            <Space key="actions" direction="vertical" style={{ width: '100%' }} size="middle">
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={handleCheckStatus}
                loading={checking}
                block
                size="large"
              >
                Check Approval Status
              </Button>
              <Button 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
                block
                size="large"
                danger
              >
                Sign Out / Exit
              </Button>
            </Space>
          ]}
        />
        <div style={{ marginTop: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
          <p>Sri Ganga Food Products Internal ERP System</p>
        </div>
      </Card>
    </div>
  );
};

export default PendingApprovalPage;
