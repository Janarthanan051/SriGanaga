import React, { useState } from 'react';
import { Typography, Input, Button, Card, message } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@config/supabase';

const { Title, Text } = Typography;

const CustomerLogin: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!phone.trim()) {
      message.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('phone', phone.trim())
        .limit(1)
        .single();

      if (error || !data) {
        message.error("No account found with this phone number. Please place an order first!");
      } else {
        // Store customer details in local storage for session
        localStorage.setItem('storefront_customer', JSON.stringify({
          id: data.id,
          name: data.name,
          phone: phone.trim()
        }));
        
        message.success(`Welcome back, ${data.name}!`);
        navigate('/store/dashboard');
      }
    } catch (err) {
      message.error("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="storefront-container" style={{ padding: '60px 20px', maxWidth: 500, margin: '0 auto' }}>
      <Card bordered={false} style={{ textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Title level={2}>My Dashboard</Title>
        <Text style={{ display: 'block', marginBottom: 24 }}>
          Enter the phone number you used during checkout to view your order history and track deliveries.
        </Text>

        <Input
          size="large"
          placeholder="Phone Number (e.g. 9876543210)"
          prefix={<PhoneOutlined />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onPressEnter={handleLogin}
          style={{ marginBottom: 16 }}
        />

        <Button 
          type="primary" 
          size="large" 
          block 
          onClick={handleLogin}
          loading={loading}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
        >
          View My Orders
        </Button>
      </Card>
    </div>
  );
};

export default CustomerLogin;
