import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Form,
  Input,
  Modal,
  message,
  Card,
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
  Spin,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { stockService, productService } from '@services/inventoryService';
import { orderService } from '@services/vendorService';
import { StockOutward, Product, Order } from '@/types';
import './StockOutward.css';

const StockOutwardPage: React.FC = () => {
  const [records, setRecords] = useState<StockOutward[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchStockOutward();
    fetchProducts();
    fetchOrders();
  }, [pagination.current]);

  const fetchStockOutward = async () => {
    try {
      setLoading(true);
      const { data, total: count } = await stockService.getStockOutward(
        pagination.current,
        pagination.pageSize
      );
      setRecords(data);
      setTotal(count);
    } catch (error) {
      message.error('Failed to fetch stock outward records');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await productService.getProducts(1, 100);
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await orderService.getOrders(1, 100);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders');
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        outward_date: values.outward_date.format('YYYY-MM-DD'),
      };

      await stockService.createStockOutward(formattedValues);
      message.success('Stock outward recorded successfully');

      setIsModalVisible(false);
      form.resetFields();
      fetchStockOutward();
    } catch (error) {
      message.error('Failed to save stock outward record');
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product_id',
      key: 'product_id',
      render: (prodId: string) => {
        const prod = products.find((p) => p.id === prodId);
        return prod ? `${prod.name} (${prod.sku})` : 'N/A';
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: number) => <strong>{qty}</strong>,
    },
    {
      title: 'Outward Date',
      dataIndex: 'outward_date',
      key: 'outward_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => (
        <span style={{ textTransform: 'capitalize' }}>{reason.replace('_', ' ')}</span>
      ),
    },
    {
      title: 'Linked Order',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (orderId: string) => {
        const order = orders.find((o) => o.id === orderId);
        return order ? order.order_number : 'N/A';
      },
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
  ];

  const productOptions = products.map((p) => ({
    label: `${p.name} (${p.sku})`,
    value: p.id,
  }));

  const orderOptions = orders.map((o) => ({
    label: `Order: ${o.order_number}`,
    value: o.id,
  }));

  return (
    <div className="stock-outward-page">
      <Card
        title={<h2>Stock Outward</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Record Stock Outward
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={records}
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
        title="Record Stock Outward"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="product_id"
            label="Product"
            rules={[{ required: true, message: 'Please select a product' }]}
          >
            <Select options={productOptions} showSearch placeholder="Search and select product" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: 'Please input quantity' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="outward_date"
                label="Outward Date"
                rules={[{ required: true, message: 'Please select a date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="reason"
                label="Reason"
                rules={[{ required: true, message: 'Please select a reason' }]}
              >
                <Select
                  placeholder="Select reason"
                  options={[
                    { value: 'dispatch', label: 'Dispatch to Customer/Vendor' },
                    { value: 'wastage', label: 'Wastage / Damage' },
                    { value: 'adjustment', label: 'Stock Adjustment' },
                    { value: 'internal_use', label: 'Internal Consumption' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="order_id"
                label="Linked Order (Optional)"
              >
                <Select options={orderOptions} placeholder="Select order" allowClear showSearch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={2} placeholder="Enter any extra information" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StockOutwardPage;
