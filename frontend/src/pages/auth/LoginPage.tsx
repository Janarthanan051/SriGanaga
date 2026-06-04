import React from 'react';
import { Form, Input, Button, Card, Space, message, Divider } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSignIn } from '@hooks/useAuth';
import './Auth.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useSignIn();
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await signIn(values.email, values.password);
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      message.error(msg || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" title={<h1>Sri Ganga ERP</h1>}>
        <div className="auth-logo">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
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
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
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
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider>OR</Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button block size="large" onClick={() => navigate('/signup')}>
            Create New Account
          </Button>
          <Button type="link" block>
            Forgot Password?
          </Button>
        </Space>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
          <p><strong>Demo Roles Available:</strong></p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', textAlign: 'left', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            <span>admin@sriganga.com</span><span>Admin@123</span>
            <span>hr_manager@sriganga.com</span><span>hrmanager@123</span>
            <span>warehouse_manager@sriganga.com</span><span>warehousemanager@123</span>
            <span>accountant@sriganga.com</span><span>accountant@123</span>
            <span>vendor_manager@sriganga.com</span><span>vendormanager@123</span>
            <span>production_manager@sriganga.com</span><span>productionmanager@123</span>
            <span>store_keeper@sriganga.com</span><span>storekeeper@123</span>
            <span>sales_executive@sriganga.com</span><span>salesexecutive@123</span>
          </div>
          <p style={{ marginTop: '10px', color: '#999' }}>Format: [role]@sriganga.com / [role(no_underscores)]@123</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
