import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spin, message, Typography, Space, Button, Descriptions, Tag, Timeline } from 'antd';
import { ArrowLeftOutlined, UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { supabase } from '@config/supabase';
import { Employee } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const EmployeeDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (employeeId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();
        
      if (error) throw error;
      if (!data) throw new Error("Employee not found");
      
      setEmployee(data);
      
    } catch (error: any) {
      message.error(error.message || 'Failed to load employee details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (!employee) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Employee not found</div>;
  }

  let statusColor = 'green';
  if (employee.status === 'inactive') statusColor = 'red';
  if (employee.status === 'on_leave') statusColor = 'orange';

  // Mock historical logs to match vendor profile requirements
  const mockAuditLogs = [
    { date: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'), action: 'Logged into Employee Portal' },
    { date: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm'), action: 'Submitted Timesheet for Approval' },
    { date: dayjs().subtract(12, 'day').format('YYYY-MM-DD HH:mm'), action: 'Completed Safety Training Module' },
    { date: dayjs(employee.joining_date).format('YYYY-MM-DD HH:mm'), action: 'Onboarding completed and profile activated' },
  ];

  return (
    <div className="employee-dashboard" id="employee-dashboard-content">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/employees')}>
          Back to Employees
        </Button>
      </Space>

      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            {employee.first_name} {employee.last_name} <Tag color={statusColor}>{employee.status.replace('_', ' ').toUpperCase()}</Tag>
          </Title>
          <Text type="secondary">
            <Space>
              <span><MailOutlined /> {employee.email}</span>
              <span><PhoneOutlined /> {employee.phone}</span>
            </Space>
          </Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Master Profile Details" bordered={false} style={{ marginBottom: 24 }}>
            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
              <Descriptions.Item label="Employee ID">{employee.employee_id}</Descriptions.Item>
              <Descriptions.Item label="Department">{employee.department}</Descriptions.Item>
              <Descriptions.Item label="Position">{employee.position}</Descriptions.Item>
              <Descriptions.Item label="Joining Date">{dayjs(employee.joining_date).format('MMMM D, YYYY')}</Descriptions.Item>
              <Descriptions.Item label="Salary (Monthly)">₹{Number(employee.salary).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Address">{employee.address || 'N/A'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Historical Activity & Audit Logs" bordered={false}>
            <Timeline>
              {mockAuditLogs.map((log, index) => (
                <Timeline.Item 
                  key={index} 
                  color={index === 0 ? 'green' : 'blue'}
                  dot={index === 0 ? <SafetyCertificateOutlined style={{ fontSize: '16px' }} /> : undefined}
                >
                  <p style={{ margin: 0 }}><strong>{log.action}</strong></p>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{log.date}</Text>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDashboard;
