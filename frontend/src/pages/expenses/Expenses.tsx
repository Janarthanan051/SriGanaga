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
  Row,
  Col,
  Select,
  DatePicker,
  InputNumber,
  Spin,
  Tooltip,
  Popconfirm,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { expenseService } from '@services/operationsService';
import { storageService } from '@services/authService';
import { Expense } from '@/types';
import './Expenses.css';

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [total, setTotal] = useState(0);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    fetchExpenses();
  }, [pagination, selectedMonth]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, total: count } = await expenseService.getExpenses(
        pagination.current,
        pagination.pageSize,
        { month: selectedMonth }
      );
      setExpenses(data);
      setTotal(count);
    } catch (error) {
      message.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setEditingId(null);
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const { receipt, ...restValues } = values;

      let receiptUrl = editingId ? expenses.find((e) => e.id === editingId)?.receipt_url : null;

      // Upload file to Supabase Storage if there's a new file selected
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const file = fileList[0].originFileObj;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        try {
          await storageService.uploadReceipt(fileName, file);
          receiptUrl = storageService.getFileUrl('receipts', fileName);
        } catch (uploadError) {
          console.error('File upload failed, saving without receipt image:', uploadError);
        }
      } else if (fileList.length === 0) {
        receiptUrl = null;
      }

      const formattedValues = {
        ...restValues,
        expense_date: values.expense_date.format('YYYY-MM-DD'),
        receipt_url: receiptUrl,
      };

      if (editingId) {
        await expenseService.updateExpense(editingId, formattedValues);
        message.success('Expense updated successfully');
      } else {
        await expenseService.createExpense(formattedValues);
        message.success('Expense added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchExpenses();
    } catch (error) {
      console.error(error);
      message.error(editingId ? 'Failed to update expense' : 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'expense_date',
      key: 'expense_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Transport', value: 'transport' },
        { text: 'Salary', value: 'salary' },
        { text: 'Maintenance', value: 'maintenance' },
        { text: 'Utility', value: 'utility' },
        { text: 'Miscellaneous', value: 'miscellaneous' },
      ],
      onFilter: (value: any, record: Expense) => record.category === value,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `₹${amount.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Expense) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                form.setFieldsValue({
                  ...record,
                  expense_date: dayjs(record.expense_date),
                });
                setFileList(record.receipt_url ? [{
                  uid: '-1',
                  name: 'receipt_image',
                  status: 'done',
                  url: record.receipt_url,
                }] : []);
                setEditingId(record.id);
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Expense"
              description="Are you sure you want to delete this expense record?"
              onConfirm={async () => {
                try {
                  await expenseService.deleteExpense(record.id);
                  message.success('Expense deleted successfully');
                  fetchExpenses();
                } catch (error) {
                  message.error('Failed to delete expense');
                }
              }}
            >
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="expenses-page">
      <Card
        title={<h2>Expense Management</h2>}
        extra={
          <Space>
            <DatePicker
              picker="month"
              value={dayjs(selectedMonth)}
              onChange={(date) => {
                if (date) setSelectedMonth(date.format('YYYY-MM'));
              }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
              Add Expense
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={expenses}
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
        title={editingId ? 'Edit Expense' : 'Add New Expense'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="expense_date"
                label="Expense Date"
                rules={[{ required: true }]}
              >
                <DatePicker />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: 'Transport', value: 'transport' },
                    { label: 'Salary', value: 'salary' },
                    { label: 'Maintenance', value: 'maintenance' },
                    { label: 'Utility', value: 'utility' },
                    { label: 'Miscellaneous', value: 'miscellaneous' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} precision={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                initialValue="pending"
              >
                <Select
                  options={[
                    { label: 'Pending', value: 'pending' },
                    { label: 'Approved', value: 'approved' },
                    { label: 'Rejected', value: 'rejected' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="receipt"
            label="Receipt"
          >
            <Upload
              beforeUpload={(file) => {
                setFileList([{
                  uid: String(Date.now()),
                  name: file.name,
                  status: 'done',
                  originFileObj: file,
                }]);
                return false;
              }}
              fileList={fileList}
              onRemove={() => setFileList([])}
              listType="picture"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select Receipt File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpensesPage;
