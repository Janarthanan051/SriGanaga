import React, { useState } from 'react';
import { Row, Col, Card, Form, Input, Button, Typography, message, Result, Table, Divider } from 'antd';
import { ShoppingCartOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { clearCart } from '@/redux/cartSlice';
import { supabase } from '@/config/supabase';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Checkout: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<{success: boolean, orderId?: string} | null>(null);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItems = useAppSelector(state => state.cart.items);
  
  const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.product.unit_price) * item.quantity), 0);

  const handleSubmit = async (values: any) => {
    if (cartItems.length === 0) {
      message.error("Your cart is empty");
      return;
    }

    try {
      setLoading(true);
      
      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));

      const { data, error } = await supabase.rpc('submit_customer_order', {
        p_customer_name: values.name,
        p_customer_phone: values.phone,
        p_customer_address: values.address,
        p_items: orderItems
      });

      if (error) throw error;

      setOrderComplete({ success: true, orderId: data });
      dispatch(clearCart());
      
    } catch (error: any) {
      console.error("Checkout error:", error);
      message.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete?.success) {
    return (
      <Result
        status="success"
        title="Order Placed Successfully!"
        subTitle={<>Your order has been recorded. You pay Cash on Delivery. <br/> Your reference ID is <b>{orderComplete.orderId}</b>.</>}
        extra={[
          <Button type="primary" key="console" onClick={() => navigate('/store')}>
            Order Again
          </Button>
        ]}
      />
    );
  }

  const columns = [
    { title: 'Item', dataIndex: ['product', 'name'], key: 'name' },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 60 },
    { 
      title: 'Total', 
      key: 'total', 
      render: (_: any, record: any) => `₹${(Number(record.product.unit_price) * record.quantity).toLocaleString()}`,
      align: 'right' as const
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Checkout</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card title="Delivery Details" bordered={false}>
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={handleSubmit}
              initialValues={{ name: '', phone: '', address: '' }}
            >
              <Form.Item 
                name="name" 
                label="Full Name" 
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input size="large" placeholder="John Doe" />
              </Form.Item>
              
              <Form.Item 
                name="phone" 
                label="Phone Number" 
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input size="large" placeholder="+91 9876543210" />
              </Form.Item>
              
              <Form.Item 
                name="address" 
                label="Delivery Address" 
                rules={[{ required: true, message: 'Please enter your full delivery address' }]}
              >
                <Input.TextArea rows={4} placeholder="123 Street Name, City, Pincode" />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  block 
                  loading={loading}
                  disabled={cartItems.length === 0}
                  icon={<CheckCircleOutlined />}
                >
                  Place Order (Cash on Delivery)
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} lg={10}>
          <Card title={<><ShoppingCartOutlined /> Order Summary</>} bordered={false}>
            <Table 
              dataSource={cartItems} 
              columns={columns} 
              pagination={false} 
              rowKey={(record) => record.product.id}
              size="small"
            />
            <Divider />
            <Row justify="space-between" align="middle">
              <Title level={4} style={{ margin: 0 }}>Total Amount</Title>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>₹{totalAmount.toLocaleString()}</Title>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;
