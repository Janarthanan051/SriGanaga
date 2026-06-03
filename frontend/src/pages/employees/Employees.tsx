import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Form,
  Input,
  Modal,
  message,
  Space,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  InputNumber,
  Popconfirm,
  Badge,
  Spin,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { employeeService } from '@services/hrService';
import { Employee } from '@/types';
import './Employees.css';

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [total, setTotal] = useState(0);

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, [pagination, searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, total: count } = await employeeService.getEmployees(
        pagination.current,
        pagination.pageSize,
        searchTerm ? { search: searchTerm } : undefined
      );
      setEmployees(data);
      setTotal(count);
    } catch (error) {
      message.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = async () => {
    try {
      const newEmployeeId = await employeeService.generateEmployeeId();
      form.setFieldValue('employee_id', newEmployeeId);
      setEditingId(null);
      setIsModalVisible(true);
    } catch (error) {
      message.error('Failed to generate employee ID');
    }
  };

  const showEditModal = (employee: Employee) => {
    form.setFieldsValue({
      ...employee,
      joining_date: dayjs(employee.joining_date),
    });
    setEditingId(employee.id);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        joining_date: values.joining_date.format('YYYY-MM-DD'),
      };

      if (editingId) {
        await employeeService.updateEmployee(editingId, formattedValues);
        message.success('Employee updated successfully');
      } else {
        await employeeService.createEmployee(formattedValues);
        message.success('Employee added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchEmployees();
    } catch (error) {
      message.error(editingId ? 'Failed to update employee' : 'Failed to add employee');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await employeeService.deleteEmployee(id);
      message.success('Employee deleted successfully');
      fetchEmployees();
    } catch (error) {
      message.error('Failed to delete employee');
    }
  };

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employee_id',
      key: 'employee_id',
      width: 120,
      sorter: (a: Employee, b: Employee) => a.employee_id.localeCompare(b.employee_id),
    },
    {
      title: 'Name',
      dataIndex: 'first_name',
      key: 'name',
      render: (_: string, record: Employee) => (
        <a onClick={() => navigate(`/employees/${record.id}`)}>
          <strong>{record.first_name} {record.last_name}</strong>
        </a>
      ),
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      filters: [
        { text: 'HR', value: 'HR' },
        { text: 'IT', value: 'IT' },
        { text: 'Finance', value: 'Finance' },
        { text: 'Operations', value: 'Operations' },
        { text: 'Warehouse', value: 'Warehouse' },
      ],
      onFilter: (value: any, record: Employee) => record.department === value,
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary: number) => `₹${salary.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'On Leave', value: 'on_leave' },
      ],
      onFilter: (value: any, record: Employee) => record.status === value,
      render: (status: string) => {
        let color = 'green';
        if (status === 'inactive') color = 'red';
        if (status === 'on_leave') color = 'orange';
        return <Badge color={color} text={status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} />;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Employee) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Employee"
              description="Are you sure you want to delete this employee?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="employees-page">
      <Card
        title={<h2>Employee Management</h2>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Add Employee
          </Button>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Input.Search
              placeholder="Search by name, email..."
              onSearch={setSearchTerm}
              allowClear
              enterButton={<SearchOutlined />}
            />
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={employees}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total,
              onChange: (page, pageSize) =>
                setPagination({ current: page, pageSize }),
            }}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>

      {/* Modal */}
      <Modal
        title={editingId ? 'Edit Employee' : 'Add New Employee'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="employee_id"
            label="Employee ID"
            rules={[{ required: true }]}
          >
            <Input disabled />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true },
                  { type: 'email' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: 'HR', value: 'HR' },
                    { label: 'IT', value: 'IT' },
                    { label: 'Finance', value: 'Finance' },
                    { label: 'Operations', value: 'Operations' },
                    { label: 'Warehouse', value: 'Warehouse' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="position"
                label="Position"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="joining_date"
                label="Joining Date"
                rules={[{ required: true }]}
              >
                <DatePicker />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="salary"
                label="Salary (Monthly)"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} precision={2} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                initialValue="active"
              >
                <Select
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                    { label: 'On Leave', value: 'on_leave' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="address"
                label="Address"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
