import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Form,
  Input,
  Modal,
  message,
  Space,
  Card,
  InputNumber,
  Select,
  DatePicker,
  Popconfirm,
  Spin,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { vendorService, orderService } from '@services/vendorService';
import { Order } from '@/types';
import './Orders.css';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<Array<{ label: string; value: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrders();
    fetchVendors();
  }, [pagination]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, total: count } = await orderService.getOrders(
        pagination.current,
        pagination.pageSize
      );
      setOrders(data);
      setTotal(count);
    } catch (error) {
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const { data } = await vendorService.getVendors(1, 100);
      setVendors(data.map((v) => ({ label: v.name, value: v.id })));
    } catch (error) {
      console.error('Failed to fetch vendors');
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        order_date: values.order_date.format('YYYY-MM-DD'),
        delivery_date: values.delivery_date?.format('YYYY-MM-DD'),
      };

      if (editingId) {
        await orderService.updateOrderStatus(editingId, values.status);
        message.success('Order updated successfully');
      } else {
        await orderService.createOrder(formattedValues, []);
        message.success('Order created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchOrders();
    } catch (error) {
      message.error('Failed to save order');
    }
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 130,
    },
    {
      title: 'Vendor',
      dataIndex: 'vendor_id',
      key: 'vendor_id',
      width: 150,
      render: (vendorId: string) => {
        const vendor = vendors.find((v: any) => v.value === vendorId);
        return vendor?.label || 'N/A';
      },
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `₹${amount.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Confirmed', value: 'confirmed' },
        { text: 'Delivered', value: 'delivered' },
      ],
      onFilter: (value: any, record: Order) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Order) => (
        <Space size="small">
          <Tooltip title="Edit Status">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                form.setFieldsValue({
                  status: record.status,
                });
                setEditingId(record.id);
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Order"
              description="Are you sure?"
              onConfirm={() => {
                orderService.deleteOrder(record.id);
                message.success('Order deleted');
                fetchOrders();
              }}
            >
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="orders-page">
      <Card
        title={<h2>Order Management</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            New Order
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total,
              onChange: (page, pageSize) =>
                setPagination({ current: page, pageSize }),
            }}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>

      {/* Modal */}
      <Modal
        title={editingId ? 'Update Order Status' : 'Create Order'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          {!editingId && (
            <>
              <Form.Item
                name="order_number"
                label="Order Number"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g., ORD-001" />
              </Form.Item>

              <Form.Item
                name="vendor_id"
                label="Vendor"
                rules={[{ required: true }]}
              >
                <Select options={vendors} />
              </Form.Item>

              <Form.Item
                name="order_date"
                label="Order Date"
                rules={[{ required: true }]}
              >
                <DatePicker />
              </Form.Item>

              <Form.Item
                name="total_amount"
                label="Total Amount"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} precision={2} />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Processing', value: 'processing' },
                { label: 'Dispatched', value: 'dispatched' },
                { label: 'Delivered', value: 'delivered' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersPage;
