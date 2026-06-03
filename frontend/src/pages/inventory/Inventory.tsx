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
  InputNumber,
  Popconfirm,
  Spin,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { productService } from '@services/inventoryService';
import { Product } from '@/types';
import './Inventory.css';

const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [total, setTotal] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchLowStockProducts();
  }, [pagination, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, total: count } = await productService.getProducts(
        pagination.current,
        pagination.pageSize,
        searchTerm ? { search: searchTerm } : undefined
      );
      setProducts(data);
      setTotal(count);
    } catch (error) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const lowStock = await productService.getLowStockProducts();
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Failed to fetch low stock products');
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const showEditModal = (product: Product) => {
    form.setFieldsValue(product);
    setEditingId(product.id);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingId) {
        await productService.updateProduct(editingId, values);
        message.success('Product updated successfully');
      } else {
        await productService.createProduct(values);
        message.success('Product added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchProducts();
      fetchLowStockProducts();
    } catch (error) {
      message.error(editingId ? 'Failed to update product' : 'Failed to add product');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 100,
      sorter: (a: Product, b: Product) => a.sku.localeCompare(b.sku),
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Raw Materials', value: 'Raw Materials' },
        { text: 'Finished Products', value: 'Finished Products' },
        { text: 'Packaging', value: 'Packaging' },
      ],
      onFilter: (value: any, record: Product) => record.category === value,
    },
    {
      title: 'Current Stock',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (stock: number, record: Product) => {
        const isLow = stock <= record.reorder_level;
        return (
          <span style={{ color: isLow ? '#ff4d4f' : '#52c41a' }}>
            {stock} {isLow && <WarningOutlined style={{ marginLeft: '8px' }} />}
          </span>
        );
      },
    },
    {
      title: 'Reorder Level',
      dataIndex: 'reorder_level',
      key: 'reorder_level',
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price: number) => `₹${price.toLocaleString()}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Product) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Product"
              description="Are you sure?"
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

  return (
    <div className="inventory-page">
      {lowStockProducts.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24}>
            <Card
              type="inner"
              style={{ backgroundColor: '#fff7e6', borderColor: '#ffc53d' }}
            >
              <Space>
                <WarningOutlined style={{ color: '#faad14', fontSize: '18px' }} />
                <span>
                  {lowStockProducts.length} product(s) have stock below reorder level
                </span>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      <Card
        title={<h2>Inventory Management</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Add Product
          </Button>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Input.Search
              placeholder="Search by name, SKU..."
              onSearch={setSearchTerm}
              allowClear
              enterButton={<SearchOutlined />}
            />
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={products}
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
        title={editingId ? 'Edit Product' : 'Add New Product'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="sku"
                label="SKU"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g., PROD-001" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[{ required: true }]}
              >
                <Input placeholder="e.g., kg, liters, pieces" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="unit_price"
                label="Unit Price"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} precision={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="current_stock"
                label="Current Stock"
              >
                <InputNumber min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="reorder_level"
                label="Reorder Level"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
