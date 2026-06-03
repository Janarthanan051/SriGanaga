import React from 'react';
import { Card, Table, Button, Input, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const QualityControl: React.FC = () => {
  const columns = [
    {
      title: 'Report Number',
      dataIndex: 'report_number',
      key: 'report_number',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Batch Code',
      dataIndex: 'batch_id',
      key: 'batch_id',
    },
    {
      title: 'Inspection Date',
      dataIndex: 'inspection_date',
      key: 'inspection_date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          passed: 'green',
          rejected: 'red',
          conditional: 'orange',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Button type="link">View Report</Button>,
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Quality Control (QC)</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          New Inspection
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Search reports or batches..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300 }}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={[]} 
          loading={false}
          rowKey="id"
          locale={{ emptyText: 'No QC reports found' }}
        />
      </Card>
    </div>
  );
};

export default QualityControl;
