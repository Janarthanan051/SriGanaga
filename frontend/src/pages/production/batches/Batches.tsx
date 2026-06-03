import React from 'react';
import { Card, Table, Button, Input, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const Batches: React.FC = () => {
  const columns = [
    {
      title: 'Batch Code',
      dataIndex: 'batch_code',
      key: 'batch_code',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Product',
      dataIndex: 'product_id',
      key: 'product_id',
    },
    {
      title: 'Manufacturing Date',
      dataIndex: 'manufacturing_date',
      key: 'manufacturing_date',
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          quarantine: 'gold',
          passed: 'green',
          rejected: 'red',
          consumed: 'default',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Batch Management</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          New Batch
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Search batches..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300 }}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={[]} 
          loading={false}
          rowKey="id"
          locale={{ emptyText: 'No batches found (Phase 3 Stub)' }}
        />
      </Card>
    </div>
  );
};

export default Batches;
