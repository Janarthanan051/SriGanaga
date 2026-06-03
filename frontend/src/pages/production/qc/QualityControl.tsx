import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Tag, message, Modal, Descriptions } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { qcService } from '@/services/operationsService';

const QualityControl: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  useEffect(() => {
    fetchReports();
  }, [searchText]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await qcService.getReports(1, 50, { search: searchText });
      setData(res.data);
    } catch (err) {
      console.error(err);
      message.error('Failed to load QC Reports');
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
      title: 'Report Number',
      dataIndex: 'report_number',
      key: 'report_number',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Batch Code',
      key: 'batch_id',
      render: (record: any) => record.batches?.batch_code || record.batch_id,
    },
    {
      title: 'Inspection Date',
      dataIndex: 'inspection_date',
      key: 'inspection_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
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
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => handleInspect(record)}>
          View Report
        </Button>
      ),
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
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          rowKey="id"
          locale={{ emptyText: 'No QC reports found' }}
        />
      </Card>

      <Modal
        title="Quality Control Report Details"
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
            <Descriptions.Item label="Report Number"><strong>{selectedRecord.report_number}</strong></Descriptions.Item>
            <Descriptions.Item label="Inspection Date">{new Date(selectedRecord.inspection_date).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                selectedRecord.status === 'passed' ? 'green' :
                selectedRecord.status === 'rejected' ? 'red' : 'orange'
              }>
                {selectedRecord.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Batch Code">{selectedRecord.batches?.batch_code || selectedRecord.batch_id}</Descriptions.Item>
            <Descriptions.Item label="Inspector ID">{selectedRecord.inspector_id}</Descriptions.Item>
            <Descriptions.Item label="Comments" span={2}>{selectedRecord.comments || 'No comments provided.'}</Descriptions.Item>
            
            {selectedRecord.parameters && (
              <Descriptions.Item label="Tested Parameters" span={2}>
                <pre style={{ margin: 0, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {JSON.stringify(selectedRecord.parameters, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default QualityControl;
