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
  Spin,
  message,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { supplierService } from '@services/vendorService';
import { Supplier } from '@/types';
import './Suppliers.css';

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchSuppliers();
  }, [pagination.current, searchTerm]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data, total: count } = await supplierService.getSuppliers(
        pagination.current,
        pagination.pageSize,
        searchTerm ? { search: searchTerm } : undefined
      );
      setSuppliers(data);
      setTotal(count);
    } catch (error) {
      message.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const showEditModal = (supplier: Supplier) => {
    form.setFieldsValue(supplier);
    setEditingId(supplier.id);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingId) {
        await supplierService.updateSupplier(editingId, values);
        message.success('Supplier updated successfully');
      } else {
        await supplierService.createSupplier(values);
        message.success('Supplier added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchSuppliers();
    } catch (error) {
      message.error(editingId ? 'Failed to update supplier' : 'Failed to add supplier');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supplierService.deleteSupplier(id);
      message.success('Supplier deleted successfully');
      fetchSuppliers();
    } catch (error) {
      message.error('Failed to delete supplier');
    }
  };

  const columns = [
    {
      title: 'Supplier Name',
      dataIndex: 'name',
      key: 'name',
      fontWeight: 'bold',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Contact Person',
      dataIndex: 'contact_person',
      key: 'contact_person',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Materials Supplied',
      dataIndex: 'materials_supplied',
      key: 'materials_supplied',
      ellipsis: true,
    },
    {
      title: 'City / State',
      key: 'location',
      render: (_: any, record: Supplier) => {
        const city = record.city || '';
        const state = record.state || '';
        return city && state ? `${city}, ${state}` : city || state || 'N/A';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Supplier) => (
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
              title="Delete Supplier"
              description="Are you sure you want to delete this supplier?"
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
    <div className="suppliers-page">
      <Card
        title={<h2>Supplier Management</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Add Supplier
          </Button>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Input.Search
              placeholder="Search by name, contact, email..."
              onSearch={setSearchTerm}
              allowClear
              enterButton={<SearchOutlined />}
            />
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={suppliers}
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
        title={editingId ? 'Edit Supplier' : 'Add New Supplier'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={700}
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Supplier Name"
                rules={[{ required: true, message: 'Please enter supplier name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="contact_person"
                label="Contact Person"
                rules={[{ required: true, message: 'Please enter contact person name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter email address' },
                  { type: 'email', message: 'Please enter a valid email address' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="materials_supplied"
                label="Materials Supplied (e.g. Wheat, Packaging)"
                rules={[{ required: true, message: 'Please detail materials supplied' }]}
              >
                <Input placeholder="e.g. Raw Wheat, Jute Bags, Corrugated Boxes" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="address" label="Street Address">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="city" label="City">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="state" label="State">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="pincode" label="Pincode">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
