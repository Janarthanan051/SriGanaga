import React from 'react';
import { Card, Table, Button, Input, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const WarehouseTransfers: React.FC = () => {

  const columns = [
    {
      title: 'Transfer Number',
      dataIndex: 'transfer_number',
      key: 'transfer_number',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Source',
      dataIndex: 'source_warehouse',
      key: 'source_warehouse',
    },
    {
      title: 'Destination',
      dataIndex: 'destination_warehouse',
      key: 'destination_warehouse',
    },
    {
      title: 'Date',
      dataIndex: 'transfer_date',
      key: 'transfer_date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          pending: 'gold',
          in_transit: 'blue',
          completed: 'green',
          cancelled: 'red',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button type="link">View Details</Button>,
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Warehouse Transfers</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          New Transfer
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Search transfers..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300 }}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={[]} 
          loading={false}
          rowKey="id"
          locale={{ emptyText: 'No transfers found (Phase 2 Stub)' }}
        />
      </Card>
    </div>
  );
};

export default WarehouseTransfers;
