import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Tag, message, Modal, Descriptions } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { batchService } from '@/services/operationsService';

const Batches: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    fetchBatches();
  }, [searchText]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await batchService.getBatches(1, 50, { search: searchText });
      setData(res.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load Batches');
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = (record: any) => {
    setSelectedRecord(record);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Batch Code',
      dataIndex: 'batch_code',
      key: 'batch_code',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Product',
      key: 'product_id',
      render: (record: any) => record.products?.name || record.product_id,
    },
    {
      title: 'Manufacturing Date',
      dataIndex: 'manufacturing_date',
      key: 'manufacturing_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
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
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => handleInspect(record)}>
          View Details
        </Button>
      ),
    }
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
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          rowKey="id"
          locale={{ emptyText: 'No batches found' }}
        />
      </Card>

      <Modal
        title="Batch Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedRecord && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Batch Code"><strong>{selectedRecord.batch_code}</strong></Descriptions.Item>
            <Descriptions.Item label="Product">{selectedRecord.products?.name || selectedRecord.product_id}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                selectedRecord.status === 'passed' ? 'green' :
                selectedRecord.status === 'rejected' ? 'red' :
                selectedRecord.status === 'quarantine' ? 'gold' : 'default'
              }>
                {selectedRecord.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">{selectedRecord.quantity}</Descriptions.Item>
            <Descriptions.Item label="Manufacturing Date">{new Date(selectedRecord.manufacturing_date).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Expiry Date">{new Date(selectedRecord.expiry_date).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Production Order ID" span={2}>{selectedRecord.production_order_id || 'N/A'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Batches;
