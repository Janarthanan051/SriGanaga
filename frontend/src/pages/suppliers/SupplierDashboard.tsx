import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Spin, message, Typography, Space, Button } from 'antd';
import { ArrowLeftOutlined, DropboxOutlined, FileTextOutlined } from '@ant-design/icons';
import { supplierService } from '@services/vendorService';
import { Supplier } from '@/types';
import { ExportOptions } from '@components/shared/ExportOptions';
import { supabase } from '@config/supabase';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SupplierDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalPOs: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (supplierId: string) => {
    try {
      setLoading(true);
      
      // Fetch Supplier Details
      const supplierData = await supplierService.getSupplier(supplierId);
      if (!supplierData) throw new Error("Supplier not found");
      
      setSupplier(supplierData);

      // Fetch Purchase Orders for this supplier
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });
        
      if (poError) throw poError;
      
      setPurchaseOrders(poData || []);
      
      // Calculate metrics
      const totalSpent = (poData || []).reduce((sum, po) => sum + Number(po.total_amount), 0);
      const totalPOs = (poData || []).length;
      
      setMetrics({
        totalPOs,
        totalSpent
      });
      
    } catch (error) {
      message.error('Failed to load supplier details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const poColumns = [
    {
      title: 'PO Number',
      dataIndex: 'po_number',
      key: 'po_number',
    },
    {
      title: 'Created Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => status.toUpperCase(),
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expected_delivery_date',
      key: 'expected_delivery_date',
      render: (date: string) => date ? dayjs(date).format('DD MMM YYYY') : 'N/A',
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

  if (!supplier) {
    return <div>Supplier not found</div>;
  }

  return (
    <div className="supplier-dashboard" id="supplier-dashboard-content">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/suppliers')}>
          Back to Suppliers
        </Button>
      </Space>

      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>{supplier.name}</Title>
          <Text type="secondary">{supplier.email} | {supplier.phone}</Text>
        </Col>
        <Col>
          <ExportOptions 
            elementId="supplier-dashboard-content" 
            excelData={purchaseOrders}
            filenamePrefix={`supplier_${supplier.name.replace(/\s+/g, '_')}`}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card bordered={false}>
            <Statistic 
              title="Total Purchase Orders" 
              value={metrics.totalPOs} 
              prefix={<DropboxOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false}>
            <Statistic 
              title="Total Volume / Spent" 
              value={metrics.totalSpent} 
              prefix={<FileTextOutlined />} 
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Comprehensive Purchase History" bordered={false}>
        <Table 
          columns={poColumns} 
          dataSource={purchaseOrders} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default SupplierDashboard;
