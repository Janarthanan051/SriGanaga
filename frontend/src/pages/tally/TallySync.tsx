import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Tag,
  message,
  Typography,
  Tooltip,
} from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { tallyService } from '@services/operationsService';
import { supabase } from '@config/supabase';
import './TallySync.css';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

interface SyncLog {
  id: string;
  sync_type: string;
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
  created_at: string;
}

const TallySyncPage: React.FC = () => {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingType, setSyncingType] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [total, setTotal] = useState(0);

  // Stats states
  const [totalSyncs, setTotalSyncs] = useState(0);
  const [successRate, setSuccessRate] = useState(100);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [pagination.current]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, total: count } = await tallyService.getSyncLogs(
        pagination.current,
        pagination.pageSize
      );
      setLogs(data as SyncLog[]);
      setTotal(count);
    } catch (error: any) {
      message.error(`Failed to load sync logs: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('tally_sync_log')
        .select('status, created_at');

      if (error) throw error;

      if (data && data.length > 0) {
        setTotalSyncs(data.length);
        
        const successCount = data.filter((item) => item.status === 'success').length;
        setSuccessRate(Math.round((successCount / data.length) * 100));

        const successSyncs = data
          .filter((item) => item.status === 'success')
          .sort((a, b) => dayjs(b.created_at).diff(dayjs(a.created_at)));

        if (successSyncs.length > 0) {
          setLastSyncTime(successSyncs[0].created_at);
        } else {
          setLastSyncTime(null);
        }
      } else {
        setTotalSyncs(0);
        setSuccessRate(100);
        setLastSyncTime(null);
      }
    } catch (error) {
      console.error('Failed to calculate stats', error);
    }
  };

  const handleSync = async (syncType: string) => {
    try {
      setSyncingType(syncType);
      message.loading({ content: `Initiating synchronization for ${syncType}...`, key: 'syncing', duration: 0 });
      
      const result = await tallyService.triggerSync(syncType);
      
      if (result.status === 'success') {
        message.success({ content: `${syncType.toUpperCase()} sync completed successfully!`, key: 'syncing', duration: 3 });
      } else {
        message.error({ content: `${syncType.toUpperCase()} sync failed: ${result.error_message}`, key: 'syncing', duration: 5 });
      }
      
      // Refresh logs & stats
      fetchLogs();
      fetchStats();
    } catch (error: any) {
      message.error({ content: `Sync request encountered an error: ${error.message || error}`, key: 'syncing', duration: 4 });
    } finally {
      setSyncingType(null);
    }
  };

  const columns = [
    {
      title: 'Sync Type',
      dataIndex: 'sync_type',
      key: 'sync_type',
      render: (type: string) => (
        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
          {type} Sync
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'pending' | 'success' | 'failed') => {
        let color = 'gold';
        let icon = <SyncOutlined spin />;
        let text = 'Pending';

        if (status === 'success') {
          color = 'success';
          icon = <CheckCircleOutlined />;
          text = 'Success';
        } else if (status === 'failed') {
          color = 'error';
          icon = <CloseCircleOutlined />;
          text = 'Failed';
        }

        return (
          <Tag icon={icon} color={color} style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 500 }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Details / Error',
      dataIndex: 'error_message',
      key: 'error_message',
      render: (err: string, record: SyncLog) => {
        if (record.status === 'success') {
          return <Text type="secondary">Synchronized successfully</Text>;
        }
        if (record.status === 'failed') {
          return (
            <Text type="danger" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <InfoCircleOutlined /> {err || 'Unknown error occurred'}
            </Text>
          );
        }
        return <Text type="warning">Sync processing in background...</Text>;
      },
    },
    {
      title: 'Sync Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          <Text>{dayjs(date).format('DD/MM/YYYY hh:mm A')}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ({dayjs(date).fromNow()})
          </Text>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="tally-sync-container">
      {/* Title Header */}
      <div className="tally-header-section">
        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
          Tally Database Integration
        </Title>
        <Paragraph type="secondary" style={{ margin: '8px 0 24px 0', fontSize: '15px' }}>
          Manually trigger and monitor data pipelines between the Sri Ganga ERP and Tally ERP.
        </Paragraph>
      </div>

      {/* Stats Section */}
      <Row gutter={[20, 20]} className="tally-stats-row">
        <Col xs={24} sm={8}>
          <Card className="tally-stat-card card-hover-effect">
            <div className="tally-stat-icon-wrapper blue-icon">
              <DatabaseOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            </div>
            <div className="tally-stat-content">
              <Text type="secondary" className="tally-stat-label">Total Sync Runs</Text>
              <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{totalSyncs}</Title>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="tally-stat-card card-hover-effect">
            <div className={`tally-stat-icon-wrapper ${successRate > 80 ? 'green-icon' : 'orange-icon'}`}>
              <CheckCircleOutlined style={{ fontSize: '24px', color: successRate > 80 ? '#52c41a' : '#fa8c16' }} />
            </div>
            <div className="tally-stat-content">
              <Text type="secondary" className="tally-stat-label">Sync Success Rate</Text>
              <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{successRate}%</Title>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="tally-stat-card card-hover-effect">
            <div className="tally-stat-icon-wrapper purple-icon">
              <SyncOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
            </div>
            <div className="tally-stat-content">
              <Text type="secondary" className="tally-stat-label">Last Successful Sync</Text>
              <Title level={4} style={{ margin: 0, fontWeight: 700, fontSize: '16px', lineHeight: '32px' }}>
                {lastSyncTime ? dayjs(lastSyncTime).fromNow() : 'No successful syncs'}
              </Title>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Sync Actions Cards */}
      <Title level={4} style={{ margin: '30px 0 16px 0', fontWeight: 600 }}>
        Manual Synchronization Targets
      </Title>
      <Row gutter={[20, 20]} className="tally-actions-row">
        <Col xs={24} md={8}>
          <Card 
            className="tally-action-card card-hover-effect"
            actions={[
              <Button 
                type="primary"
                icon={syncingType === 'ledgers' ? <LoadingOutlined /> : <SyncOutlined />}
                disabled={syncingType !== null}
                onClick={() => handleSync('ledgers')}
                style={{ width: '85%' }}
              >
                {syncingType === 'ledgers' ? 'Syncing...' : 'Sync Ledgers'}
              </Button>
            ]}
          >
            <div className="tally-action-header">
              <div className="tally-action-avatar red-avatar">GL</div>
              <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Master Ledgers</Title>
            </div>
            <Paragraph type="secondary" style={{ minHeight: '44px', marginTop: '12px' }}>
              Sync accounting ledgers including suppliers, vendors, customers, and operational expense accounts.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card 
            className="tally-action-card card-hover-effect"
            actions={[
              <Button 
                type="primary"
                icon={syncingType === 'vouchers' ? <LoadingOutlined /> : <SyncOutlined />}
                disabled={syncingType !== null}
                onClick={() => handleSync('vouchers')}
                style={{ width: '85%' }}
              >
                {syncingType === 'vouchers' ? 'Syncing...' : 'Sync Vouchers'}
              </Button>
            ]}
          >
            <div className="tally-action-header">
              <div className="tally-action-avatar orange-avatar">VC</div>
              <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Transactions Vouchers</Title>
            </div>
            <Paragraph type="secondary" style={{ minHeight: '44px', marginTop: '12px' }}>
              Sync transaction details including sales records, raw material purchases, and payroll vouchers.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card 
            className="tally-action-card card-hover-effect"
            actions={[
              <Button 
                type="primary"
                icon={syncingType === 'inventory' ? <LoadingOutlined /> : <SyncOutlined />}
                disabled={syncingType !== null}
                onClick={() => handleSync('inventory')}
                style={{ width: '85%' }}
              >
                {syncingType === 'inventory' ? 'Syncing...' : 'Sync Inventory'}
              </Button>
            ]}
          >
            <div className="tally-action-header">
              <div className="tally-action-avatar green-avatar">IV</div>
              <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Inventory Items</Title>
            </div>
            <Paragraph type="secondary" style={{ minHeight: '44px', marginTop: '12px' }}>
              Sync raw material catalogs, finished goods stock items, warehousing units, and stock quantities.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* Logs Table Section */}
      <div className="tally-logs-section" style={{ marginTop: '40px' }}>
        <Card 
          title={
            <div className="tally-logs-title-bar">
              <FileTextOutlined style={{ marginRight: '8px' }} />
              <span>Synchronization Activity Logs</span>
            </div>
          }
          extra={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => { fetchLogs(); fetchStats(); }}
              loading={loading}
            >
              Refresh
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={logs}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total,
              onChange: (page, pageSize) =>
                setPagination({ current: page, pageSize }),
              showSizeChanger: false,
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default TallySyncPage;
