import React from 'react';
import { Row, Col, Card, Empty } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { UserRole } from '@/types';

interface ChartData {
  inventory: Array<{ name: string; stock: number }>;
  orders: Array<{ name: string; value: number }>;
  expensesByCategory: Array<{ name: string; amount: number }>;
  expensesTrend: Array<{ name: string; amount: number }>;
  attendance: Array<{ name: string; value: number }>;
  vendorOrders: Array<{ name: string; value: number }>;
}

interface ActivityChartsProps {
  chartData: ChartData;
  role?: UserRole;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e'];

const ActivityCharts: React.FC<ActivityChartsProps> = ({ chartData, role }) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card
          title={
            role === 'hr_manager'
              ? 'Attendance Breakdown'
              : role === 'vendor_manager'
              ? 'Vendor Activity'
              : role === 'accountant'
              ? 'Expense Performance'
              : 'Stock by Category'
          }
          hoverable
        >
          {role === 'hr_manager' ? (
            chartData.attendance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.attendance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#4f46e5"
                    dataKey="value"
                  >
                    {chartData.attendance.map((_, index) => (
                      <Cell key={`cell-attendance-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No attendance data" />
            )
          ) : role === 'vendor_manager' ? (
            chartData.vendorOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.vendorOrders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No vendor data" />
            )
          ) : role === 'accountant' ? (
            chartData.expensesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.expensesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#4f46e5" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No expense data" />
            )
          ) : chartData.inventory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.inventory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stock" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No data" />
          )}
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card
          title={
            role === 'accountant' || role === 'hr_manager'
              ? 'Monthly Expense Summary'
              : role === 'vendor_manager'
              ? 'Purchase Order Status'
              : 'Order Status'
          }
          hoverable
        >
          {role === 'accountant' || role === 'hr_manager' ? (
            chartData.expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ₹${value}`}
                    outerRadius={80}
                    fill="#4f46e5"
                    dataKey="amount"
                  >
                    {chartData.expensesByCategory.map((_, index) => (
                      <Cell key={`cell-expense-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No expense data" />
            )
          ) : chartData.orders.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.orders}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#4f46e5"
                  dataKey="value"
                >
                  {chartData.orders.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No data" />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ActivityCharts;
