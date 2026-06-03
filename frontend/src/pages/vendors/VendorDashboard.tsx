import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Spin, message, Typography, Tag, Space, Button } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons';
import { vendorService, orderService } from '@services/vendorService';
import { Vendor, Order } from '@/types';
import { ExportOptions } from '@components/shared/ExportOptions';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const VendorDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalSpent: 0,
    totalItemsPurchased: 0,
  });

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (vendorId: string) => {
    try {
      setLoading(true);
      const [vendorData, ordersData] = await Promise.all([
        vendorService.getVendor(vendorId),
        orderService.getOrders(1, 1000, { vendor_id: vendorId })
      ]);
      
      setVendor(vendorData);
      setOrders(ordersData.data);
      
      // Calculate metrics
      const totalSpent = ordersData.data.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const totalOrders = ordersData.total;
      
      setMetrics({
        totalOrders,
        totalSpent,
        totalItemsPurchased: ordersData.data.length * 5 // Mock calculation, ideally fetched from items
      });
      
    } catch (error) {
      message.error('Failed to load vendor details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const orderColumns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'delivered') color = 'success';
        if (status === 'processing') color = 'processing';
        if (status === 'cancelled') color = 'error';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `₹${Number(amount).toLocaleString()}`,
    }
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (!vendor) {
    return <div>Vendor not found</div>;
  }

  return (
    <div className="vendor-dashboard" id="vendor-dashboard-content">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/vendors')}>
          Back to Vendors
        </Button>
      </Space>

      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>{vendor.name}</Title>
          <Text type="secondary">{vendor.email} | {vendor.phone}</Text>
        </Col>
        <Col>
          <ExportOptions 
            elementId="vendor-dashboard-content" 
            excelData={orders}
            filenamePrefix={`vendor_${vendor.name.replace(/\s+/g, '_')}`}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic 
              title="Total Orders" 
              value={metrics.totalOrders} 
              prefix={<ShoppingCartOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic 
              title="Total Spent" 
              value={metrics.totalSpent} 
              prefix={<DollarOutlined />} 
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic 
              title="Outstanding Balance" 
              value={vendor.outstanding_balance} 
              prefix={<FileTextOutlined />} 
              precision={2}
              valueStyle={{ color: vendor.outstanding_balance > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Comprehensive Order History" bordered={false}>
        <Table 
          columns={orderColumns} 
          dataSource={orders} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default VendorDashboard;
