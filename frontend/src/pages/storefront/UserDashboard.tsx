import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Button, Modal, Steps, Alert, Card, Row, Col } from 'antd';
import { LogoutOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@config/supabase';

const { Title, Text } = Typography;

const UserDashboard: React.FC = () => {
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('storefront_customer');
    if (!stored) {
      navigate('/store/login');
      return;
    }
    
    const parsed = JSON.parse(stored);
    setCustomer(parsed);
    fetchOrders(parsed.id);
  }, [navigate]);

  const fetchOrders = async (customerId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales_orders')
        .select(`
          *,
          items:sales_order_items (
            *,
            products (name)
          )
        `)
        .eq('customer_id', customerId)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('storefront_customer');
    navigate('/store');
  };

  const showOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const getStepStatus = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const columns = [
    {
      title: 'Order Ref',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: 'Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `₹${Number(amount).toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'delivered') color = 'success';
        if (status === 'processing') color = 'processing';
        if (status === 'shipped') color = 'purple';
        if (status === 'cancelled') color = 'error';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => showOrderDetails(record)}>
          Details
        </Button>
      ),
    },
  ];

  if (!customer) return null;

  return (
    <div className="storefront-container" style={{ padding: '40px 20px', maxWidth: 1000, margin: '0 auto' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Hi, {customer.name}!</Title>
          <Text type="secondary">Phone: {customer.phone}</Text>
        </Col>
        <Col>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>Log Out</Button>
        </Col>
      </Row>

      <Card title="My Order History" bordered={false}>
        <Table 
          dataSource={orders} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      </Card>

      <Modal
        title={`Order Details: ${selectedOrder?.order_number}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>Close</Button>
        ]}
        width={700}
      >
        {selectedOrder && (
          <div>
            {selectedOrder.status === 'cancelled' ? (
              <Alert message="This order was cancelled." type="error" showIcon style={{ marginBottom: 24 }} />
            ) : (
              <Steps
                current={getStepStatus(selectedOrder.status)}
                items={[
                  { title: 'Placed' },
                  { title: 'Processing' },
                  { title: 'Shipped' },
                  { title: 'Delivered' },
                ]}
                style={{ marginBottom: 32 }}
              />
            )}

            <Title level={5}>Items Ordered</Title>
            <Table
              dataSource={selectedOrder.items}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'Product', dataIndex: ['products', 'name'], key: 'name' },
                { title: 'Qty', dataIndex: 'quantity', key: 'qty' },
                { title: 'Price', dataIndex: 'unit_price', key: 'price', render: (v) => `₹${Number(v)}` },
                { title: 'Total', dataIndex: 'total_price', key: 'total', render: (v) => `₹${Number(v)}` },
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}><strong style={{ float: 'right' }}>Grand Total</strong></Table.Summary.Cell>
                  <Table.Summary.Cell index={1}><strong>₹{Number(selectedOrder.total_amount).toLocaleString()}</strong></Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserDashboard;
