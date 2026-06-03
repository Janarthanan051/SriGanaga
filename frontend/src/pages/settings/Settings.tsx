import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Row, Col, Switch, message, Divider, Table, Select, Spin } from 'antd';
import { useSignOut } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@redux/hooks';
import { authService } from '@services/authService';
import './Settings.css';

const SettingsPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { signOut } = useSignOut();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Admin user management state
  const isAdmin = user?.user_metadata?.role === 'admin';
  const [usersList, setUsersList] = useState<any[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setFetchingUsers(true);
      const data = await authService.getUsersList();
      
      // Map out_ prefixed columns from Postgres to avoid any naming collisions
      const mappedData = (data || []).map((u: any) => ({
        id: u.out_id || u.id,
        email: u.out_email || u.email,
        full_name: u.out_full_name || u.full_name,
        role: u.out_role || u.role,
        is_approved: u.out_is_approved ?? u.is_approved,
        created_at: u.out_created_at || u.created_at
      }));
      
      setUsersList(mappedData);
    } catch (error: any) {
      console.error('Failed to fetch user list:', error);
      message.error(`Failed to fetch user list: ${error?.message || 'Unknown error'}`);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleUpdateUser = async (userId: string, newRole: string, newApproval: boolean) => {
    try {
      await authService.updateUserRoleAndApproval(userId, newRole, newApproval);
      message.success('User updated successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user');
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
      message.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      message.error('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = user?.user_metadata?.role
    ? user.user_metadata.role.replace('_', ' ').replace(/ \w/g, (c) => c.toUpperCase())
    : 'Not assigned';

  const userColumns = [
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text: string) => <strong>{text || 'N/A'}</strong>,
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: any) => (
        <Select
          value={role}
          onChange={(val) => handleUpdateUser(record.id, val, record.is_approved)}
          disabled={record.id === user?.id} // Cannot edit own role to prevent lockout
          style={{ width: 180 }}
          options={[
            { value: 'admin', label: 'Administrator' },
            { value: 'super_admin', label: 'Super Admin' },
            { value: 'owner', label: 'Owner' },
            { value: 'manager', label: 'Manager' },
            { value: 'hr_manager', label: 'HR Manager' },
            { value: 'production_manager', label: 'Production Manager' },
            { value: 'store_keeper', label: 'Store Keeper' },
            { value: 'warehouse_manager', label: 'Warehouse Manager' },
            { value: 'sales_executive', label: 'Sales Executive' },
            { value: 'accountant', label: 'Accountant' },
            { value: 'vendor_manager', label: 'Vendor Manager' },
          ]}
        />
      ),
    },
    {
      title: 'Approval Status',
      dataIndex: 'is_approved',
      key: 'is_approved',
      render: (isApproved: boolean, record: any) => (
        <Switch
          checked={isApproved}
          onChange={(checked) => handleUpdateUser(record.id, record.role, checked)}
          disabled={record.id === user?.id} // Cannot unapprove oneself
          checkedChildren="Approved"
          unCheckedChildren="Pending"
        />
      ),
    },
    {
      title: 'Registered Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className="settings-page">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={<h2>Account Settings</h2>}>
            <Form form={form} layout="vertical">
              <Form.Item label="Email">
                <Input disabled value={user?.email} />
              </Form.Item>

              <Form.Item label="Full Name">
                <Input defaultValue={user?.user_metadata?.full_name} />
              </Form.Item>

              <Form.Item label="Role">
                <Input disabled value={roleLabel} />
              </Form.Item>

              <Divider />

              <Form.Item label="Enable Email Notifications">
                <Switch defaultChecked />
              </Form.Item>

              <Form.Item label="Enable SMS Notifications">
                <Switch defaultChecked />
              </Form.Item>

              <Button type="primary" block>
                Save Changes
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<h2>Security & Logout</h2>}>
            <Form layout="vertical">
              <Form.Item>
                <Button block>Change Password</Button>
              </Form.Item>

              <Form.Item>
                <Button block>Two-Factor Authentication</Button>
              </Form.Item>

              <Divider />

              <Form.Item>
                <Button
                  type="primary"
                  danger
                  block
                  loading={loading}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Form.Item>

              <Form.Item>
                <Button block danger>
                  Delete Account
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Admin User approvals section */}
      {isAdmin && (
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card title={<h2>User Management & Role Approvals (Admin Only)</h2>}>
              <Spin spinning={fetchingUsers}>
                <Table
                  dataSource={usersList}
                  columns={userColumns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                />
              </Spin>
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card title={<h2>System Information</h2>}>
            <Form layout="vertical">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <p><strong>Application Version:</strong> 1.0.0</p>
                </Col>
                <Col xs={24} sm={12}>
                  <p><strong>Build Date:</strong> {new Date().toLocaleDateString()}</p>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
