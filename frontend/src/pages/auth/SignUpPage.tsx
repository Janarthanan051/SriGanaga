import React from 'react';
import { Form, Input, Button, Card, message, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SolutionOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSignUp } from '@hooks/useAuth';
import './Auth.css';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loading } = useSignUp();
  const [form] = Form.useForm();

  const onFinish = async (values: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
  }) => {
    try {
      await signUp(values.email, values.password, values.fullName, values.role);
      message.success('Account created successfully! Awaiting administrator approval.');
      navigate('/login');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      message.error(msg || 'Sign up failed');
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" title={<h1>Sri Ganga ERP</h1>}>
        <div className="auth-logo">
          <h2>Create Account</h2>
          <p>Join the team</p>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Full Name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Account Role / Position"
            rules={[{ required: true, message: 'Please select your role' }]}
            initialValue="hr_manager"
          >
            <Select 
              size="large" 
              suffixIcon={<SolutionOutlined />}
              options={[
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
                { value: 'logistics_manager', label: 'Logistics Manager' },
                { value: 'employee', label: 'Employee' },
                { value: 'admin', label: 'Administrator' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginBottom: 16, textAlign: 'center', color: '#8c8c8c', fontSize: '12px' }}>
          <strong>Note:</strong> Please use a valid email address as you will need to click the verification link sent to your email before logging in.
        </div>

        <Button type="link" block onClick={() => navigate('/login')}>
          Already have an account? Sign In
        </Button>
      </Card>
    </div>
  );
};

export default SignUpPage;
