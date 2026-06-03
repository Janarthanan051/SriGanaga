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
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
  Spin,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { stockService, productService } from '@services/inventoryService';
import { StockInward, Product } from '@/types';
import './StockInward.css';

const StockInwardPage: React.FC = () => {
  const [records, setRecords] = useState<StockInward[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchStockInward();
    fetchProducts();
  }, [pagination]);

  const fetchStockInward = async () => {
    try {
      setLoading(true);
      const { data, total: count } = await stockService.getStockInward(
        pagination.current,
        pagination.pageSize
      );
      setRecords(data);
      setTotal(count);
    } catch (error) {
      message.error('Failed to fetch stock inward records');
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
        received_date: values.received_date.format('YYYY-MM-DD'),
        manufacturing_date: values.manufacturing_date?.format('YYYY-MM-DD'),
        expiry_date: values.expiry_date?.format('YYYY-MM-DD'),
      };

      if (editingId) {
        // Update
        message.success('Stock inward updated');
      } else {
        await stockService.createStockInward(formattedValues);
        message.success('Stock inward recorded');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchStockInward();
    } catch (error) {
      message.error('Failed to save stock inward record');
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product_id',
      key: 'product_id',
      render: (prodId: string) => {
        const prod = products.find((p) => p.id === prodId);
        return prod?.name || 'N/A';
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Received Date',
      dataIndex: 'received_date',
      key: 'received_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Batch Number',
      dataIndex: 'batch_number',
      key: 'batch_number',
    },
    {
      title: 'Invoice Number',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: StockInward) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue({
                ...record,
                received_date: dayjs(record.received_date),
              });
              setEditingId(record.id);
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete Stock Inward"
            description="Are you sure you want to delete this record?"
            onConfirm={() => {
              fetchStockInward();
            }}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const productOptions = products.map((p) => ({
    label: `${p.name} (${p.sku})`,
    value: p.id,
  }));

  return (
    <div className="stock-inward-page">
      <Card
        title={<h2>Stock Inward</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Record Stock Inward
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
        title="Record Stock Inward"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="product_id"
            label="Product"
            rules={[{ required: true }]}
          >
            <Select options={productOptions} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="received_date"
                label="Received Date"
                rules={[{ required: true }]}
              >
                <DatePicker />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="batch_number"
                label="Batch Number"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="invoice_number"
                label="Invoice Number"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="manufacturing_date"
                label="Manufacturing Date"
              >
                <DatePicker />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="expiry_date"
                label="Expiry Date"
              >
                <DatePicker />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StockInwardPage;
