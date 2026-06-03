import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Form,
  Input,
  Modal,
  message,
  Space,
  Card,
  Select,
  DatePicker,
  Spin,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { attendanceService, employeeService } from '@services/hrService';
import { Attendance, Employee } from '@/types';
import { ExportOptions } from '@components/shared/ExportOptions';
import './Attendance.css';

const AttendancePage: React.FC = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, [selectedMonth]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getAttendance({
        month: selectedMonth,
      });
      setAttendance(data || []);
    } catch (error) {
      message.error('Failed to fetch attendance');
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

  const showAddModal = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };

      if (editingId) {
        await attendanceService.updateAttendance(editingId, formattedValues);
        message.success('Attendance updated');
      } else {
        await attendanceService.recordAttendance(formattedValues);
        message.success('Attendance recorded');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchAttendance();
    } catch (error) {
      message.error('Failed to save attendance');
    }
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employee_id',
      key: 'employee_id',
      width: 200,
      render: (empId: string) => {
        const emp = employees.find((e) => e.id === empId);
        return emp ? `${emp.first_name} ${emp.last_name}` : 'N/A';
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Present', value: 'present' },
        { text: 'Absent', value: 'absent' },
        { text: 'Half Day', value: 'half_day' },
        { text: 'Leave', value: 'leave' },
      ],
      onFilter: (value: any, record: Attendance) => record.status === value,
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Attendance) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue({
                ...record,
                date: dayjs(record.date),
              });
              setEditingId(record.id);
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Mark Absent"
            description="Are you sure you want to mark this employee as absent?"
            onConfirm={() => {
              attendanceService.updateAttendance(record.id, { status: 'absent' });
              message.success('Record deleted');
              fetchAttendance();
            }}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const employeeOptions = employees.map((e) => ({
    label: `${e.first_name} ${e.last_name}`,
    value: e.id,
  }));

  return (
    <div className="attendance-page" id="attendance-content">
      <Card
        title={<h2>Attendance Management</h2>}
        extra={
          <Space>
            <ExportOptions 
              elementId="attendance-content" 
              excelData={attendance}
              filenamePrefix={`attendance_${selectedMonth}`}
            />
            <DatePicker
              picker="month"
              value={dayjs(selectedMonth)}
              onChange={(date) => {
                if (date) setSelectedMonth(date.format('YYYY-MM'));
              }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              Mark Attendance
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={attendance}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>

      {/* Modal */}
      <Modal
        title={editingId ? 'Edit Attendance' : 'Mark Attendance'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="employee_id"
            label="Employee"
            rules={[{ required: true }]}
          >
            <Select options={employeeOptions} />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: 'Present', value: 'present' },
                { label: 'Absent', value: 'absent' },
                { label: 'Half Day', value: 'half_day' },
                { label: 'Leave', value: 'leave' },
              ]}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.status !== currentValues.status}
          >
            {({ getFieldValue }) =>
              getFieldValue('status') === 'leave' ? (
                <Form.Item
                  name="leave_type"
                  label="Leave Type"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={[
                      { label: 'Sick Leave', value: 'sick' },
                      { label: 'Casual Leave', value: 'casual' },
                      { label: 'Authorized Leave', value: 'authorized' },
                      { label: 'Unpaid Leave', value: 'unpaid' },
                    ]}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
