import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Tag, message, Modal, Descriptions } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { productionService } from '@/services/operationsService';

const ProductionOrders: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, [searchText]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await productionService.getProductionOrders(1, 50, { search: searchText });
      setData(res.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load Production Orders');
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
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'BOM / Recipe',
      key: 'bom_id',
      render: (record: any) => record.bill_of_materials?.bom_number || record.bom_id,
    },
    {
      title: 'Planned Date',
      dataIndex: 'planned_date',
      key: 'planned_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
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
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          rowKey="id"
          locale={{ emptyText: 'No production orders found' }}
        />
      </Card>

      <Modal
        title="Production Order Details"
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
            <Descriptions.Item label="Order Number"><strong>{selectedRecord.order_number}</strong></Descriptions.Item>
            <Descriptions.Item label="Planned Date">{new Date(selectedRecord.planned_date).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                selectedRecord.status === 'completed' ? 'green' :
                selectedRecord.status === 'cancelled' ? 'red' :
                selectedRecord.status === 'in_progress' ? 'blue' : 'gold'
              }>
                {selectedRecord.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="BOM Reference">{selectedRecord.bill_of_materials?.bom_number || selectedRecord.bom_id}</Descriptions.Item>
            <Descriptions.Item label="Target Quantity">{selectedRecord.target_quantity}</Descriptions.Item>
            <Descriptions.Item label="Produced Quantity">{selectedRecord.produced_quantity || '0'}</Descriptions.Item>
            <Descriptions.Item label="Completed Date">{selectedRecord.completed_date ? new Date(selectedRecord.completed_date).toLocaleDateString() : 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Supervisor ID">{selectedRecord.supervisor_id}</Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>{selectedRecord.notes || 'No internal notes provided.'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ProductionOrders;
