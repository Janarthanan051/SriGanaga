import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  DatePicker,
  Spin,
  Table,
  Tabs,
  message,
} from 'antd';
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { generateExcel, generatePDF } from '@utils/helpers';
import {
  employeeService,
  attendanceService,
  payrollService,
} from '@services/hrService';
import { expenseService } from '@services/operationsService';
import './Reports.css';

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>({});
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const generateAttendanceReport = async () => {
    try {
      setLoading(true);
      const monthStr = selectedMonth.format('YYYY-MM');
      const { data: employees } = await employeeService.getEmployees(1, 100);
      
      let allAttendance = [];
      for (const emp of employees) {
        const { stats } = await attendanceService.getAttendanceReport(
          emp.id,
          monthStr
        );
        allAttendance.push({
          employee: `${emp.first_name} ${emp.last_name}`,
          ...stats,
          total: stats.present + stats.absent + stats.half_day + stats.leave,
        });
      }

      setReportData({ attendance: allAttendance });
      message.success('Attendance report generated');
    } catch (error) {
      message.error('Failed to generate attendance report');
    } finally {
      setLoading(false);
    }
  };

  const generatePayrollReport = async () => {
    try {
      setLoading(true);
      const monthStr = selectedMonth.format('YYYY-MM');
      const data = await payrollService.getPayroll({
        month: monthStr,
      });

      setReportData({ payroll: data });
      message.success('Payroll report generated');
    } catch (error) {
      message.error('Failed to generate payroll report');
    } finally {
      setLoading(false);
    }
  };

  const generateExpenseReport = async () => {
    try {
      setLoading(true);
      const monthStr = selectedMonth.format('YYYY-MM');
      const { data, total } = await expenseService.getMonthlyExpenses(monthStr);

      const categoryData: Record<string, number> = {};
      data.forEach((exp: any) => {
        if (!categoryData[exp.category]) {
          categoryData[exp.category] = 0;
        }
        categoryData[exp.category] += exp.amount;
      });

      setReportData({
        expenses: {
          data,
          total,
          byCategory: categoryData,
        },
      });
      message.success('Expense report generated');
    } catch (error) {
      message.error('Failed to generate expense report');
    } finally {
      setLoading(false);
    }
  };

  const downloadAsExcel = (reportType: string) => {
    const data = reportData[reportType] || [];
    const filename = `${reportType}-report-${selectedMonth.format('YYYY-MM')}`;
    generateExcel(filename, data);
    message.success('Report downloaded as Excel');
  };

  const downloadAsPDF = (reportType: string) => {
    const data = JSON.stringify(reportData[reportType] || []);
    const filename = `${reportType}-report-${selectedMonth.format('YYYY-MM')}`;
    generatePDF(filename, data);
    message.success('Report downloaded as PDF');
  };

  const attendanceColumns = [
    {
      title: 'Employee',
      dataIndex: 'employee',
      key: 'employee',
    },
    {
      title: 'Present',
      dataIndex: 'present',
      key: 'present',
    },
    {
      title: 'Absent',
      dataIndex: 'absent',
      key: 'absent',
    },
    {
      title: 'Half Day',
      dataIndex: 'half_day',
      key: 'half_day',
    },
    {
      title: 'Leave',
      dataIndex: 'leave',
      key: 'leave',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
    },
  ];

  const tabItems = [
    {
      key: 'attendance',
      label: 'Attendance Report',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col>
              <Space>
                <DatePicker
                  picker="month"
                  value={selectedMonth}
                  onChange={(date) => {
                    if (date) setSelectedMonth(date);
                  }}
                />
                <Button type="primary" onClick={generateAttendanceReport}>
                  Generate Report
                </Button>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => downloadAsExcel('attendance')}
                >
                  Export Excel
                </Button>
                <Button
                  icon={<FilePdfOutlined />}
                  onClick={() => downloadAsPDF('attendance')}
                >
                  Export PDF
                </Button>
              </Space>
            </Col>
          </Row>

          <Spin spinning={loading}>
            {reportData.attendance && (
              <Table
                columns={attendanceColumns}
                dataSource={reportData.attendance}
                rowKey="employee"
                pagination={false}
              />
            )}
          </Spin>
        </div>
      ),
    },
    {
      key: 'payroll',
      label: 'Payroll Report',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col>
              <Space>
                <DatePicker
                  picker="month"
                  value={selectedMonth}
                  onChange={(date) => {
                    if (date) setSelectedMonth(date);
                  }}
                />
                <Button type="primary" onClick={generatePayrollReport}>
                  Generate Report
                </Button>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => downloadAsExcel('payroll')}
                >
                  Export Excel
                </Button>
              </Space>
            </Col>
          </Row>

          <Spin spinning={loading}>
            {reportData.payroll && (
              <div style={{ fontSize: '14px' }}>
                <p>Total payroll records: {reportData.payroll.length}</p>
              </div>
            )}
          </Spin>
        </div>
      ),
    },
    {
      key: 'expenses',
      label: 'Expense Report',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col>
              <Space>
                <DatePicker
                  picker="month"
                  value={selectedMonth}
                  onChange={(date) => {
                    if (date) setSelectedMonth(date);
                  }}
                />
                <Button type="primary" onClick={generateExpenseReport}>
                  Generate Report
                </Button>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => downloadAsExcel('expenses')}
                >
                  Export Excel
                </Button>
              </Space>
            </Col>
          </Row>

          <Spin spinning={loading}>
            {reportData.expenses && (
              <div>
                <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                  <Col>
                    <Card>
                      <h3>Total Expenses: ₹{reportData.expenses.total.toLocaleString()}</h3>
                    </Card>
                  </Col>
                </Row>
                <h4>By Category:</h4>
                {Object.entries(reportData.expenses.byCategory).map(
                  ([category, amount]: any) => (
                    <Row key={category} gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <p>{category}</p>
                      </Col>
                      <Col xs={24} sm={12}>
                        <p>₹{amount.toLocaleString()}</p>
                      </Col>
                    </Row>
                  )
                )}
              </div>
            )}
          </Spin>
        </div>
      ),
    },
  ];

  return (
    <div className="reports-page">
      <Card title={<h2>Reports & Analytics</h2>}>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default ReportsPage;
