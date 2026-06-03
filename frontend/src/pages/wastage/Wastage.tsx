import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Form,
  Modal,
  message,
  Card,
  Select,
  InputNumber,
  DatePicker,
  Spin,
  Popconfirm,
  Input,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { wastageService } from '@services/operationsService';
import { productService } from '@services/inventoryService';
import { Wastage, Product } from '@/types';
import './Wastage.css';

const WastagePage: React.FC = () => {
  const [records, setRecords] = useState<Wastage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchWastage();
    fetchProducts();
  }, [pagination]);

  const fetchWastage = async () => {
    try {
      setLoading(true);
      const { data, total: count } = await wastageService.getWastage(
        pagination.current,
        pagination.pageSize
      );
      setRecords(data);
      setTotal(count);
    } catch (error) {
      message.error('Failed to fetch wastage records');
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
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        wastage_date: values.wastage_date.format('YYYY-MM-DD'),
      };

      await wastageService.recordWastage(formattedValues);
      message.success('Wastage recorded');

      setIsModalVisible(false);
      form.resetFields();
      fetchWastage();
    } catch (error) {
      message.error('Failed to record wastage');
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
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Date',
      dataIndex: 'wastage_date',
      key: 'wastage_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: () => (
        <Popconfirm
          title="Delete Wastage"
          description="Are you sure?"
          onConfirm={() => fetchWastage()}
        >
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const productOptions = products.map((p) => ({
    label: `${p.name} (${p.sku})`,
    value: p.id,
  }));

  return (
    <div className="wastage-page">
      <Card
        title={<h2>Wastage Tracking</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Record Wastage
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
            scroll={{ x: 800 }}
          />
        </Spin>
      </Card>

      {/* Modal */}
      <Modal
        title="Record Wastage"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="product_id"
            label="Product"
            rules={[{ required: true }]}
          >
            <Select options={productOptions} />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: 'Damaged', value: 'damaged' },
                { label: 'Expired', value: 'expired' },
                { label: 'Quality Issue', value: 'quality_issue' },
                { label: 'Spillage', value: 'spillage' },
                { label: 'Other', value: 'other' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="wastage_date"
            label="Date"
            rules={[{ required: true }]}
          >
            <DatePicker />
          </Form.Item>

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

export default WastagePage;
