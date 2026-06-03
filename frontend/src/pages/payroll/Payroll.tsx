import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  message,
  Space,
  Card,
  Row,
  Col,
  DatePicker,
  Spin,
  Tag,
  Tooltip,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { payrollService } from '@services/hrService';
import { employeeService } from '@services/hrService';
import { Payroll, Employee } from '@/types';
import { ExportOptions } from '@components/shared/ExportOptions';
import './Payroll.css';

const PayrollPage: React.FC = () => {
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  useEffect(() => {
    fetchPayroll();
    fetchEmployees();
  }, [selectedMonth]);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const data = await payrollService.getPayroll({
        month: selectedMonth,
      });
      setPayroll(data || []);
    } catch (error) {
      message.error('Failed to fetch payroll');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await employeeService.getEmployees(1, 100);
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      const monthStr = selectedMonth.split('-')[1];
      const yearNum = parseInt(selectedMonth.split('-')[0]);
      
      await payrollService.generatePayroll(monthStr, yearNum);
      message.success('Payroll generated successfully');
      fetchPayroll();
    } catch (error) {
      message.error('Failed to generate payroll');
    }
  };

  const handleProcessPayment = async (id: string) => {
    try {
      await payrollService.updatePayrollStatus(id, 'paid');
      message.success('Payment processed');
      fetchPayroll();
    } catch (error) {
      message.error('Failed to process payment');
    }
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employee_id',
      key: 'employee_id',
      width: 180,
      render: (empId: string) => {
        const emp = employees.find((e) => e.id === empId);
        return emp ? `${emp.first_name} ${emp.last_name}` : 'N/A';
      },
    },
    {
      title: 'Days Present',
      dataIndex: 'days_present',
      key: 'days_present',
    },
    {
      title: 'Basic Salary',
      dataIndex: 'basic_salary',
      key: 'basic_salary',
      render: (salary: number) => `₹${Number(salary || 0).toLocaleString()}`,
    },
    {
      title: 'Allowances',
      dataIndex: 'allowances',
      key: 'allowances',
      render: (amount: number) => <span style={{ color: '#52c41a' }}>+ ₹{Number(amount || 0).toLocaleString()}</span>,
    },
    {
      title: 'Deductions',
      dataIndex: 'deductions',
      key: 'deductions',
      render: (amount: number) => <span style={{ color: '#ff4d4f' }}>- ₹{Number(amount || 0).toLocaleString()}</span>,
    },
    {
      title: 'Net Salary',
      dataIndex: 'net_salary',
      key: 'net_salary',
      render: (salary: number) => <strong>₹{Number(salary || 0).toLocaleString()}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'paid') color = 'success';
        if (status === 'processed') color = 'processing';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Payroll) => (
        <Space size="small">
          <Tooltip title="View Payslip">
            <Button
              type="primary"
              size="small"
              icon={<FileTextOutlined />}
            />
          </Tooltip>
          {record.payment_status !== 'paid' && (
            <Tooltip title="Process Payment">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleProcessPayment(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const totalSalaries = payroll.reduce((sum, p) => sum + p.net_salary, 0);

  return (
    <div className="payroll-page" id="payroll-content">
      <Card
        title={<h2>Payroll Management</h2>}
        extra={
          <Space>
            <ExportOptions 
              elementId="payroll-content" 
              excelData={payroll}
              filenamePrefix={`payroll_${selectedMonth}`}
            />
            <DatePicker
              picker="month"
              value={dayjs(selectedMonth)}
              onChange={(date) => {
                if (date) setSelectedMonth(date.format('YYYY-MM'));
              }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleGeneratePayroll}>
              Generate Payroll
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Salaries"
                value={totalSalaries}
                prefix="₹"
                valueStyle={{ color: '#667eea' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Payroll Records"
                value={payroll.length}
                valueStyle={{ color: '#764ba2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Paid"
                value={payroll.filter((p) => p.payment_status === 'paid').length}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending"
                value={payroll.filter((p) => p.payment_status === 'pending').length}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={payroll}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default PayrollPage;
