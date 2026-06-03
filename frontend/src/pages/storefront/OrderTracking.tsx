import React, { useState } from 'react';
import { Typography, Input, Button, Card, Steps, Alert, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { supabase } from '@config/supabase';

const { Title, Text } = Typography;

const OrderTracking: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data, error: sbError } = await supabase
        .from('sales_orders')
        .select('*')
        .eq('order_number', orderNumber.trim().toUpperCase())
        .single();
      
      if (sbError || !data) {
        setError('Order not found. Please check the order number and try again.');
        setOrder(null);
      } else {
        setOrder(data);
      }
    } catch (err) {
      setError('An error occurred while tracking the order.');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = () => {
    if (!order) return 0;
    switch (order.status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  return (
    <div className="storefront-container" style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Track Your Order</Title>
      <Text style={{ display: 'block', textAlign: 'center', marginBottom: 24, fontSize: 16 }}>
        Enter your order reference number (e.g. ORD-STORE-1234) below to see the current status.
      </Text>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <Input.Search
          placeholder="ORD-STORE-..."
          allowClear
          enterButton={<Button type="primary" icon={<SearchOutlined />}>Track Order</Button>}
          size="large"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          onSearch={handleSearch}
          style={{ maxWidth: 500 }}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      )}

      {error && (
        <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />
      )}

      {order && order.status !== 'cancelled' && (
        <Card title={`Order Details: ${order.order_number}`} bordered={false} style={{ marginTop: 24 }}>
          <Steps
            current={getStepStatus()}
            items={[
              { title: 'Order Placed', description: 'We have received your order.' },
              { title: 'Processing', description: 'Your order is being prepared.' },
              { title: 'Shipped', description: 'Out for delivery.' },
              { title: 'Delivered', description: 'Delivered successfully.' },
            ]}
          />
          <div style={{ marginTop: 32, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <p><strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ₹{Number(order.total_amount).toLocaleString()}</p>
            <p><strong>Current Status:</strong> {order.status.toUpperCase()}</p>
          </div>
        </Card>
      )}

      {order && order.status === 'cancelled' && (
        <Alert message={`Order ${order.order_number} has been cancelled.`} type="error" showIcon />
      )}
    </div>
  );
};

export default OrderTracking;
