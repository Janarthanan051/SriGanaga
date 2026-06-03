import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Tag, message, Modal, Descriptions } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { grnService } from '@/services/inventoryService';

const GoodsReceipts: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    fetchGRNs();
  }, [searchText]);

  const fetchGRNs = async () => {
    try {
      setLoading(true);
      const res = await grnService.getGoodsReceipts(1, 50, { search: searchText });
      setData(res.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load Goods Receipts');
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
      title: 'GRN Number',
      dataIndex: 'grn_number',
      key: 'grn_number',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'PO Reference',
      key: 'po_id',
      render: (record: any) => record.purchase_orders?.po_number || record.po_id,
    },
    {
      title: 'Receipt Date',
      dataIndex: 'receipt_date',
      key: 'receipt_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
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
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => handleInspect(record)}>
          Inspect
        </Button>
      ),
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
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          rowKey="id"
          locale={{ emptyText: 'No receipts found' }}
        />
      </Card>

      <Modal
        title="Goods Receipt Details"
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
            <Descriptions.Item label="GRN Number"><strong>{selectedRecord.grn_number}</strong></Descriptions.Item>
            <Descriptions.Item label="Receipt Date">{new Date(selectedRecord.receipt_date).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                selectedRecord.status === 'received' ? 'gold' :
                selectedRecord.status === 'inspected' ? 'green' : 'red'
              }>
                {selectedRecord.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="PO Reference">{selectedRecord.purchase_orders?.po_number || selectedRecord.po_id}</Descriptions.Item>
            <Descriptions.Item label="Received By" span={2}>{selectedRecord.received_by}</Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>{selectedRecord.notes || 'No notes available.'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default GoodsReceipts;
