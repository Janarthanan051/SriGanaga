import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Tag, Modal, Form, Select, InputNumber, Space, message, DatePicker } from 'antd';
import { PlusOutlined, SearchOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { supabase } from '@config/supabase';
import { useAuth } from '@hooks/useAuth';
import { PurchaseRequest, PurchaseRequestItem, Product } from '@/types';

const { Option } = Select;

const PurchaseRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchProducts();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchase_requests')
        .select(`
          *,
          items:purchase_request_items(
            *,
            product:products(name, sku, unit)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      message.error(err.message || 'Failed to fetch purchase requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      message.error(err.message || 'Failed to fetch products');
    }
  };

  const rawMaterials = products.filter(p => p.product_type === 'raw_material' || p.category === 'Raw Material');

  const handleCreatePR = async (values: any) => {
    try {
      // Create PR
      const { data: prData, error: prError } = await supabase
        .from('purchase_requests')
        .insert({
          pr_number: values.pr_number,
          requester_id: user?.id,
          department: values.department,
          required_date: values.required_date ? values.required_date.format('YYYY-MM-DD') : null,
          notes: values.notes,
          status: 'pending'
        })
        .select()
        .single();

      if (prError) throw prError;

      // Create PR Items
      const itemsToInsert = values.items.map((item: any) => ({
        pr_id: prData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit: products.find(p => p.id === item.product_id)?.unit || 'kg'
      }));

      const { error: itemsError } = await supabase
        .from('purchase_request_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      message.success('Purchase Request created successfully!');
      setIsModalVisible(false);
      form.resetFields();
      fetchRequests();
    } catch (err: any) {
      message.error(err.message || 'Failed to create PR');
    }
  };

  const filteredRequests = requests.filter(pr => 
    pr.pr_number.toLowerCase().includes(searchText.toLowerCase()) ||
    pr.department?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'PR Number',
      dataIndex: 'pr_number',
      key: 'pr_number',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Required By',
      dataIndex: 'required_date',
      key: 'required_date',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          pending: 'gold',
          approved: 'blue',
          ordered: 'purple',
          rejected: 'red',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Purchase Requests</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          New Request
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Search by PR number or department..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={filteredRequests} 
          loading={loading}
          rowKey="id"
          expandable={{
            expandedRowRender: record => {
              const itemCols = [
                { title: 'Item', dataIndex: ['product', 'name'], key: 'name' },
                { title: 'SKU', dataIndex: ['product', 'sku'], key: 'sku' },
                { title: 'Quantity', dataIndex: 'quantity', key: 'qty' },
                { title: 'Unit', dataIndex: 'unit', key: 'unit' }
              ];
              return (
                <Table 
                  columns={itemCols} 
                  dataSource={(record as any).items || []} 
                  pagination={false} 
                  rowKey="id" 
                  size="small"
                />
              );
            }
          }}
        />
      </Card>

      <Modal
        title="Create Purchase Request"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical" form={form} onFinish={handleCreatePR}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item 
              name="pr_number" 
              label="PR Number" 
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. PR-001" />
            </Form.Item>

            <Form.Item 
              name="department" 
              label="Department"
            >
              <Select placeholder="Select Department">
                <Option value="Production">Production</Option>
                <Option value="Maintenance">Maintenance</Option>
                <Option value="Administration">Administration</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item 
              name="required_date" 
              label="Required By Date" 
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item 
              name="notes" 
              label="Notes / Reason"
            >
              <Input />
            </Form.Item>
          </div>

          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <h3>Requested Items</h3>
          </div>

          <Form.List name="items" rules={[{
            validator: async (_, items) => {
              if (!items || items.length < 1) {
                return Promise.reject(new Error('At least one item is required'));
              }
            }
          }]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'product_id']}
                      rules={[{ required: true, message: 'Missing product' }]}
                    >
                      <Select placeholder="Select Material" style={{ width: 350 }} showSearch optionFilterProp="children">
                        {rawMaterials.map(rm => (
                          <Option key={rm.id} value={rm.id}>{rm.name} (Stock: {rm.current_stock} {rm.unit})</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Missing quantity' }]}
                    >
                      <InputNumber placeholder="Qty" min={0.1} step={0.1} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Item
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Submit Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseRequests;
