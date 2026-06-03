import React from 'react';
import { Card, Table, Button, Input, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const GoodsReceipts: React.FC = () => {

  const columns = [
    {
      title: 'GRN Number',
      dataIndex: 'grn_number',
      key: 'grn_number',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'PO Reference',
      dataIndex: 'po_id',
      key: 'po_id',
    },
    {
      title: 'Receipt Date',
      dataIndex: 'receipt_date',
      key: 'receipt_date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          received: 'gold',
          inspected: 'green',
          rejected: 'red',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button type="link">Inspect</Button>,
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Goods Receipts (GRN)</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Receive Goods
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Search GRNs..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300 }}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={[]} 
          loading={false}
          rowKey="id"
          locale={{ emptyText: 'No receipts found (Phase 2 Stub)' }}
        />
      </Card>
    </div>
  );
};

export default GoodsReceipts;
