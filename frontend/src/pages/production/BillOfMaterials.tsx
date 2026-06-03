import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Tag, Modal, Form, Select, InputNumber, Space, message } from 'antd';
import { PlusOutlined, SearchOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { supabase } from '@config/supabase';
import { BillOfMaterials, Product } from '@/types';

const { Option } = Select;

const BOMPage: React.FC = () => {
  const [boms, setBoms] = useState<BillOfMaterials[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchBOMs();
    fetchProducts();
  }, []);

  const fetchBOMs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bill_of_materials')
        .select(`
          *,
          product:products(id, name, sku),
          items:bom_items(
            *,
            raw_material:products(id, name, unit)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBoms(data || []);
    } catch (err: any) {
      message.error(err.message || 'Failed to fetch BOMs');
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

  const finishedGoods = products.filter(p => p.product_type === 'finished_good' || p.category === 'Finished Goods' || p.category === 'Final Product');
  const rawMaterials = products.filter(p => p.product_type === 'raw_material' || p.category === 'Raw Material');

  const handleCreateBOM = async (values: any) => {
    try {
      // Create BOM
      const { data: bomData, error: bomError } = await supabase
        .from('bill_of_materials')
        .insert({
          product_id: values.product_id,
          bom_number: values.bom_number,
          expected_yield: values.expected_yield,
          yield_unit: values.yield_unit,
          is_active: true
        })
        .select()
        .single();

      if (bomError) throw bomError;

      // Create BOM Items
      const itemsToInsert = values.items.map((item: any) => ({
        bom_id: bomData.id,
        raw_material_id: item.raw_material_id,
        quantity_required: item.quantity_required,
        unit: rawMaterials.find(rm => rm.id === item.raw_material_id)?.unit || 'kg'
      }));

      const { error: itemsError } = await supabase
        .from('bom_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      message.success('Bill of Materials created successfully!');
      setIsModalVisible(false);
      form.resetFields();
      fetchBOMs();
    } catch (err: any) {
      message.error(err.message || 'Failed to create BOM');
    }
  };

  const filteredBOMs = boms.filter(bom => 
    bom.bom_number.toLowerCase().includes(searchText.toLowerCase()) ||
    bom.product?.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'BOM Number',
      dataIndex: 'bom_number',
      key: 'bom_number',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Finished Good',
      dataIndex: ['product', 'name'],
      key: 'product_name',
    },
    {
      title: 'Expected Yield',
      key: 'yield',
      render: (_: any, record: BillOfMaterials) => `${record.expected_yield} ${record.yield_unit}`,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Bill of Materials (BOM)</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Create Recipe
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Search BOMs..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={filteredBOMs} 
          loading={loading}
          rowKey="id"
          expandable={{
            expandedRowRender: record => {
              const itemCols = [
                { title: 'Raw Material', dataIndex: ['raw_material', 'name'], key: 'rm_name' },
                { title: 'Quantity', dataIndex: 'quantity_required', key: 'qty' },
                { title: 'Unit', dataIndex: 'unit', key: 'unit' }
              ];
              return (
                <Table 
                  columns={itemCols} 
                  dataSource={record.items || []} 
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
        title="Create Bill of Materials"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form layout="vertical" form={form} onFinish={handleCreateBOM}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item 
              name="bom_number" 
              label="BOM Number" 
              rules={[{ required: true, message: 'Please enter BOM number' }]}
            >
              <Input placeholder="e.g. BOM-001" />
            </Form.Item>

            <Form.Item 
              name="product_id" 
              label="Finished Good" 
              rules={[{ required: true, message: 'Please select finished good' }]}
            >
              <Select placeholder="Select Finished Good" showSearch optionFilterProp="children">
                {finishedGoods.map(fg => (
                  <Option key={fg.id} value={fg.id}>{fg.name} ({fg.sku})</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item 
              name="expected_yield" 
              label="Expected Yield Quantity" 
              rules={[{ required: true, message: 'Please enter yield' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
            </Form.Item>

            <Form.Item 
              name="yield_unit" 
              label="Yield Unit" 
              rules={[{ required: true, message: 'Please enter unit' }]}
              initialValue="kg"
            >
              <Input />
            </Form.Item>
          </div>

          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <h3>Raw Materials (Recipe)</h3>
          </div>

          <Form.List name="items" rules={[{
            validator: async (_, items) => {
              if (!items || items.length < 1) {
                return Promise.reject(new Error('At least one raw material is required'));
              }
            }
          }]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'raw_material_id']}
                      rules={[{ required: true, message: 'Missing material' }]}
                    >
                      <Select placeholder="Select Material" style={{ width: 300 }} showSearch optionFilterProp="children">
                        {rawMaterials.map(rm => (
                          <Option key={rm.id} value={rm.id}>{rm.name} (Stock: {rm.current_stock} {rm.unit})</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity_required']}
                      rules={[{ required: true, message: 'Missing quantity' }]}
                    >
                      <InputNumber placeholder="Qty" min={0} step={0.1} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Raw Material
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
              Save BOM
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BOMPage;
