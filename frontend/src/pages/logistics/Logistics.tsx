import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Form,
  Input,
  Modal,
  Space,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Tag,
  message,
  Spin,
  Popconfirm,
  Tooltip,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { logisticsService } from '@services/operationsService';
import { orderService } from '@services/vendorService';
import { Logistics, Order } from '@/types';
import { ExportOptions } from '@components/shared/ExportOptions';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@config/supabase';
import './Logistics.css';

const { Option } = Select;

const ExpandedOrderDetails: React.FC<{ orderId: string }> = ({ orderId }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId) fetchItems();
  }, [orderId]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Assuming 'products' table can be joined this way in Supabase
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(name, sku, unit)
        `)
        .eq('order_id', orderId);
      
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Failed to fetch order items:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="small" />;
  if (!items.length) return <div style={{ padding: 16 }}>No products found for this order.</div>;

  return (
    <div style={{ padding: '8px 24px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
      <h4 style={{ marginTop: 0, marginBottom: 12 }}>Included Products & Quantities</h4>
      <Table 
        dataSource={items}
        rowKey="id"
        pagination={false}
        size="small"
        columns={[
          { title: 'SKU', dataIndex: ['product', 'sku'], key: 'sku', render: (val) => val || 'N/A' },
          { title: 'Product Name', dataIndex: ['product', 'name'], key: 'name', render: (val) => val || 'Unknown Product' },
          { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', render: (val, record: any) => `${val} ${record.product?.unit || ''}` },
          { title: 'Unit Price', dataIndex: 'unit_price', key: 'unit_price', render: val => `₹${val.toLocaleString()}` },
          { title: 'Total Price', dataIndex: 'total_price', key: 'total_price', render: val => `₹${val.toLocaleString()}` }
        ]}
      />
    </div>
  );
};

const VehicleHistoryModal: React.FC<{ vehicleNumber: string | null; visible: boolean; onClose: () => void }> = ({ vehicleNumber, visible, onClose }) => {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && vehicleNumber) {
      fetchVehicleHistory();
    }
  }, [visible, vehicleNumber]);

  const fetchVehicleHistory = async () => {
    setLoading(true);
    try {
      // 1. Fetch all shipments for this vehicle
      const { data: shipments, error: shipErr } = await supabase
        .from('logistics')
        .select('*')
        .eq('vehicle_number', vehicleNumber)
        .order('dispatch_date', { ascending: false });

      if (shipErr) throw shipErr;

      // 2. Extract order IDs
      const orderIds = shipments?.map(s => s.order_id).filter(Boolean) || [];
      
      let allItems: any[] = [];
      if (orderIds.length > 0) {
        // 3. Fetch order items for those orders
        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select(`*, product:products(name, unit)`)
          .in('order_id', orderIds);
        
        if (itemsErr) throw itemsErr;
        allItems = items || [];
      }

      // 4. Map items to shipments
      const enrichedHistory = shipments?.map(shipment => {
        const shipmentItems = allItems.filter(item => item.order_id === shipment.order_id);
        const productsList = shipmentItems.map(i => `${i.product?.name || 'Unknown'} (${i.quantity} ${i.product?.unit || ''})`).join(', ');
        return {
          ...shipment,
          productsSummary: productsList || 'No products recorded',
        };
      }) || [];

      setHistoryData(enrichedHistory);
    } catch (err) {
      console.error('Failed to fetch vehicle history', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Dispatch Date', dataIndex: 'dispatch_date', key: 'dispatch_date', render: (val: string) => dayjs(val).format('DD/MM/YYYY') },
    { title: 'Route', dataIndex: 'route', key: 'route', render: (val: string) => val || 'N/A' },
    { title: 'Driver', dataIndex: 'driver_name', key: 'driver_name' },
    { title: 'Products Carried', dataIndex: 'productsSummary', key: 'productsSummary' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (val: string) => <Tag color="blue">{val.toUpperCase()}</Tag> },
  ];

  return (
    <Modal
      title={`History for Vehicle: ${vehicleNumber}`}
      open={visible}
      onCancel={onClose}
      footer={[<Button key="close" onClick={onClose}>Close</Button>]}
      width={800}
    >
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={historyData}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Spin>
    </Modal>
  );
};

const LogisticsPage: React.FC = () => {
  const [shipments, setShipments] = useState<Logistics[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
  });

  // Vehicle History Modal State
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isVehicleModalVisible, setIsVehicleModalVisible] = useState(false);

  useEffect(() => {
    fetchShipments();
    fetchOrders();
  }, [pagination.current, statusFilter]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const filters: Record<string, any> = {};
      if (statusFilter) filters.status = statusFilter;

      const { data, total: count } = await logisticsService.getLogistics(
        pagination.current,
        pagination.pageSize,
        filters
      );
      setShipments(data);
      setTotal(count);

      // Compute statistics (based on all loaded records or fetch separately)
      // Since it's a small app, we can calculate from the overall count or run a quick fetch
      fetchStats();
    } catch (error) {
      message.error('Failed to fetch logistics shipments');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await orderService.getOrders(1, 100);
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders');
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch stats for all logistics records
      const { data } = await logisticsService.getLogistics(1, 1000);
      const allShipments = data || [];
      setStats({
        total: allShipments.length,
        pending: allShipments.filter((s) => s.status === 'pending').length,
        inTransit: allShipments.filter((s) => s.status === 'in_transit').length,
        delivered: allShipments.filter((s) => s.status === 'delivered').length,
      });
    } catch (error) {
      console.error('Failed to compute logistics stats');
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const showEditModal = (shipment: Logistics) => {
    form.setFieldsValue({
      ...shipment,
      dispatch_date: dayjs(shipment.dispatch_date),
      delivery_date: shipment.delivery_date ? dayjs(shipment.delivery_date) : null,
    });
    setEditingId(shipment.id);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        dispatch_date: values.dispatch_date.format('YYYY-MM-DD'),
        delivery_date: values.delivery_date ? values.delivery_date.format('YYYY-MM-DD') : null,
      };

      if (editingId) {
        await logisticsService.updateLogistics(editingId, formattedValues);
        message.success('Shipment updated successfully');
      } else {
        await logisticsService.createLogistics(formattedValues);
        message.success('Shipment created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchShipments();
    } catch (error) {
      message.error(editingId ? 'Failed to update shipment' : 'Failed to create shipment');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await logisticsService.deleteLogistics(id);
      message.success('Shipment deleted successfully');
      fetchShipments();
    } catch (error) {
      message.error('Failed to delete shipment');
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (orderId: string) => (
        <Tooltip title={orderId || 'N/A'}>
          <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
            {orderId ? `${orderId.substring(0, 8)}...` : 'N/A'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicle_number',
      key: 'vehicle_number',
      render: (num: string, record: Logistics) => (
        <div>
          <Button 
            type="link" 
            style={{ padding: 0, fontWeight: 500 }} 
            onClick={() => {
              setSelectedVehicle(num);
              setIsVehicleModalVisible(true);
            }}
          >
            {num || 'N/A'}
          </Button>
          {record.vehicle_status && (
            <div style={{ fontSize: '12px' }}>
              <Tag color={record.vehicle_status === 'idle' ? 'default' : record.vehicle_status === 'maintenance' ? 'error' : 'processing'}>
                {record.vehicle_status.toUpperCase()}
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Driver Details',
      key: 'driver_details',
      render: (_: any, record: Logistics) => (
        <div>
          <span style={{ fontWeight: 500 }}>{record.driver_name || 'N/A'}</span>
          {record.driver_phone && (
            <div style={{ fontSize: '12px', color: '#64748b' }}>{record.driver_phone}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_: any, record: Logistics) => (
        <div style={{ fontSize: '13px' }}>
          <div>
            <span style={{ color: '#64748b' }}>Dispatch: </span>
            {dayjs(record.dispatch_date).format('DD/MM/YYYY')}
          </div>
          {record.delivery_date && (
            <div>
              <span style={{ color: '#64748b' }}>Delivery: </span>
              {dayjs(record.delivery_date).format('DD/MM/YYYY')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
      render: (route: string) => route || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'pending' | 'in_transit' | 'delivered' | 'cancelled') => {
        let color = 'default';
        let icon = <ClockCircleOutlined />;
        if (status === 'delivered') {
          color = 'success';
          icon = <CheckCircleOutlined />;
        } else if (status === 'in_transit') {
          color = 'processing';
          icon = <SyncOutlined spin />;
        } else if (status === 'cancelled') {
          color = 'error';
          icon = <WarningOutlined />;
        }
        return (
          <Tag icon={icon} color={color} style={{ textTransform: 'capitalize', padding: '2px 8px', borderRadius: '4px' }}>
            {status ? status.replace('_', ' ') : 'N/A'}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Logistics) => (
        <Space size="small">
          <Tooltip title="Edit Shipment">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Shipment">
            <Popconfirm
              title="Delete Shipment"
              description="Are you sure you want to delete this shipment record?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const pieData = [
    { name: 'Pending', value: stats.pending },
    { name: 'In Transit', value: stats.inTransit },
    { name: 'Delivered', value: stats.delivered },
  ];
  const COLORS = ['#faad14', '#1890ff', '#52c41a'];

  const dispatchVolume = shipments.reduce((acc, curr) => {
    const date = dayjs(curr.dispatch_date).format('MMM DD');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const barData = Object.keys(dispatchVolume).map(key => ({
    date: key,
    shipments: dispatchVolume[key],
  })).slice(0, 7).reverse();

  return (
    <div className="logistics-page" id="logistics-content">
      {/* Analytics widgets */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Shipments"
              value={stats.total}
              prefix={<CarOutlined style={{ color: '#4f46e5' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="In Transit"
              value={stats.inTransit}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SyncOutlined spin style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Delivered"
              value={stats.delivered}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Pending Dispatch"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={12}>
          <Card title="Status Distribution">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Recent Dispatch Volume">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="shipments" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={<h2>Logistics & Shipments</h2>}
        extra={
          <Space>
            <ExportOptions 
              elementId="logistics-content" 
              excelData={shipments}
              filenamePrefix="logistics_shipments"
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              New Shipment
            </Button>
          </Space>
        }
      >
        {/* Search / Filter Bar */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: '100%' }}
              onChange={setStatusFilter}
              value={statusFilter}
            >
              <Option value="pending">Pending</Option>
              <Option value="in_transit">In Transit</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={shipments}
            rowKey="id"
            expandable={{
              expandedRowRender: (record) => <ExpandedOrderDetails orderId={record.order_id} />,
              rowExpandable: (record) => !!record.order_id,
            }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total,
              onChange: (page, pageSize) =>
                setPagination({ current: page, pageSize }),
            }}
            scroll={{ x: 900 }}
          />
        </Spin>
      </Card>

      {/* Insert/Edit Modal */}
      <Modal
        title={editingId ? 'Edit Shipment details' : 'Record New Shipment'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={750}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="order_id"
                label="Target Order"
                rules={[{ required: true, message: 'Please link this shipment to an order' }]}
              >
                <Select placeholder="Select Order" showSearch optionFilterProp="children">
                  {orders.map((ord) => (
                    <Option key={ord.id} value={ord.id}>
                      Order ID: {ord.id.substring(0, 8)}... ({dayjs(ord.order_date).format('DD/MM/YYYY')})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Shipment Status"
                rules={[{ required: true }]}
                initialValue="pending"
              >
                <Select>
                  <Option value="pending">Pending Dispatch</Option>
                  <Option value="in_transit">In Transit</Option>
                  <Option value="delivered">Delivered</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="vehicle_number"
                label="Vehicle Number"
                rules={[{ required: true, message: 'Vehicle number is required' }]}
              >
                <Input placeholder="e.g. DL 1CA 1234" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="route"
                label="Transit Route"
              >
                <Input placeholder="e.g. Warehouse A -> Retailer B" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="driver_name"
                label="Driver Name"
                rules={[{ required: true, message: 'Driver name is required' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="driver_phone"
                label="Driver Contact Phone"
              >
                <Input placeholder="e.g. 9876543210" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="vehicle_status"
                label="Vehicle Status"
              >
                <Select>
                  <Option value="idle">Idle</Option>
                  <Option value="loading">Loading</Option>
                  <Option value="loaded">Loaded</Option>
                  <Option value="in_transit">In Transit</Option>
                  <Option value="delivered">Delivered</Option>
                  <Option value="maintenance">Maintenance</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="route_frequency"
                label="Route Frequency (Per Week)"
              >
                <Input type="number" placeholder="e.g. 3" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dispatch_date"
                label="Dispatch Date"
                rules={[{ required: true }]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="delivery_date"
                label="Actual Delivery Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Vehicle History Modal */}
      <VehicleHistoryModal 
        vehicleNumber={selectedVehicle}
        visible={isVehicleModalVisible}
        onClose={() => setIsVehicleModalVisible(false)}
      />
    </div>
  );
};

export default LogisticsPage;
