import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Spin, message, Typography, Space, Button, Descriptions, Tag } from 'antd';
import { ArrowLeftOutlined, UserOutlined, DollarOutlined, CreditCardOutlined } from '@ant-design/icons';
import { supabase } from '@config/supabase';
import { Customer } from './Customers';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const CustomerDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (customerId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
        
      if (error) throw error;
      if (!data) throw new Error("Customer not found");
      
      setCustomer(data);
      
    } catch (error: any) {
      message.error(error.message || 'Failed to load customer details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (!customer) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Customer not found</div>;
  }

  let statusColor = 'green';
  if (customer.status === 'inactive') statusColor = 'default';
  if (customer.status === 'blacklisted') statusColor = 'red';

  const creditUtilization = customer.credit_limit > 0 
    ? (customer.outstanding_balance / customer.credit_limit) * 100 
    : 0;

  return (
    <div className="customer-dashboard" id="customer-dashboard-content">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>
          Back to Customers
        </Button>
      </Space>

      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            {customer.name} <Tag color={statusColor}>{customer.status.toUpperCase()}</Tag>
          </Title>
          <Text type="secondary">{customer.email || 'No email provided'} | {customer.phone || 'No phone provided'}</Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic 
              title="Outstanding Balance" 
              value={customer.outstanding_balance} 
              prefix={<DollarOutlined />} 
              precision={2}
              valueStyle={{ color: customer.outstanding_balance > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic 
              title="Credit Limit" 
              value={customer.credit_limit} 
              prefix={<CreditCardOutlined />} 
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic 
              title="Credit Utilization" 
              value={creditUtilization} 
              suffix="%" 
              precision={1}
              valueStyle={{ color: creditUtilization > 80 ? '#cf1322' : creditUtilization > 50 ? '#faad14' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Customer Details" bordered={false}>
        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
          <Descriptions.Item label="Contact Person">{customer.contact_person || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="GST Number">{customer.gst_number || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Billing Address">{customer.billing_address || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Shipping Address">{customer.shipping_address || 'N/A'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
