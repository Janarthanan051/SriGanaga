import React from 'react';
import { Card, Table, Button, Input, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const ProductionOrders: React.FC = () => {
  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'BOM / Recipe',
      dataIndex: 'bom_id',
      key: 'bom_id',
    },
    {
      title: 'Planned Date',
      dataIndex: 'planned_date',
      key: 'planned_date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          planned: 'gold',
          in_progress: 'blue',
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
        <h1>Production Orders</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          New Order
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Search production orders..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300 }}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={[]} 
          loading={false}
          rowKey="id"
          locale={{ emptyText: 'No production orders found' }}
        />
      </Card>
    </div>
  );
};

export default ProductionOrders;
