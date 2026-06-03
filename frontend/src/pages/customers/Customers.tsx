import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Tag, Modal, Form, Space, message, InputNumber, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { supabase } from '@config/supabase';

const { Option } = Select;
const { TextArea } = Input;

export interface Customer {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  billing_address?: string;
  shipping_address?: string;
  gst_number?: string;
  credit_limit: number;
  outstanding_balance: number;
  status: 'active' | 'inactive' | 'blacklisted';
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      message.error(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (values: any) => {
    try {
      const { error } = await supabase
        .from('customers')
        .insert([{
          name: values.name,
          contact_person: values.contact_person,
          email: values.email,
          phone: values.phone,
          gst_number: values.gst_number,
          billing_address: values.billing_address,
          shipping_address: values.shipping_address,
          credit_limit: values.credit_limit || 0,
          status: values.status || 'active'
        }]);

      if (error) throw error;

      message.success('Customer created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchCustomers();
    } catch (err: any) {
      message.error(err.message || 'Failed to create customer');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchText.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    c.phone?.includes(searchText)
  );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_: any, record: Customer) => (
        <div>
          <div>{record.contact_person || 'N/A'}</div>
          <div style={{ fontSize: '0.85em', color: 'gray' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'GST Number',
      dataIndex: 'gst_number',
      key: 'gst_number',
    },
    {
      title: 'Outstanding Balance',
      dataIndex: 'outstanding_balance',
      key: 'balance',
      render: (val: number) => `₹${val.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'inactive') color = 'default';
        if (status === 'blacklisted') color = 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button type="link">Edit</Button>,
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Customers</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Add Customer
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Search by name, email, or phone..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={filteredCustomers} 
          loading={loading}
          rowKey="id"
        />
      </Card>

      <Modal
        title="Add New Customer"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form layout="vertical" form={form} onFinish={handleCreateCustomer}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="name" label="Company / Customer Name" rules={[{ required: true }]}>
              <Input placeholder="Enter name" />
            </Form.Item>
            <Form.Item name="gst_number" label="GST Number">
              <Input placeholder="Enter GST (optional)" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="contact_person" label="Contact Person">
              <Input placeholder="Enter person name" />
            </Form.Item>
            <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
              <Input placeholder="Enter phone" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="email" label="Email Address">
              <Input type="email" placeholder="Enter email" />
            </Form.Item>
            <Form.Item name="status" label="Status" initialValue="active">
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="blacklisted">Blacklisted</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="billing_address" label="Billing Address">
            <TextArea rows={2} placeholder="Enter full billing address" />
          </Form.Item>

          <Form.Item name="shipping_address" label="Shipping Address">
            <TextArea rows={2} placeholder="Enter full shipping address (if different)" />
          </Form.Item>

          <Form.Item name="credit_limit" label="Credit Limit (₹)">
            <InputNumber style={{ width: '100%' }} min={0} defaultValue={0} />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save Customer</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;
