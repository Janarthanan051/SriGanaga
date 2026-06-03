import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Tag, message, Modal, Descriptions } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { transferService } from '@/services/inventoryService';

const WarehouseTransfers: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    fetchTransfers();
  }, [searchText]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await transferService.getWarehouseTransfers(1, 50, { search: searchText });
      setData(res.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load Warehouse Transfers');
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
      render: (date: string) => new Date(date).toLocaleDateString(),
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
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          rowKey="id"
          locale={{ emptyText: 'No transfers found' }}
        />
      </Card>

      <Modal
        title="Warehouse Transfer Details"
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
            <Descriptions.Item label="Transfer Number"><strong>{selectedRecord.transfer_number}</strong></Descriptions.Item>
            <Descriptions.Item label="Date">{new Date(selectedRecord.transfer_date).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Source Warehouse">{selectedRecord.source_warehouse}</Descriptions.Item>
            <Descriptions.Item label="Destination Warehouse">{selectedRecord.destination_warehouse}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                selectedRecord.status === 'completed' ? 'green' :
                selectedRecord.status === 'cancelled' ? 'red' :
                selectedRecord.status === 'in_transit' ? 'blue' : 'gold'
              }>
                {selectedRecord.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Requested By">{selectedRecord.requested_by}</Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>{selectedRecord.notes || 'No internal notes provided.'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default WarehouseTransfers;
