import React from 'react';
import { Row, Col, Card, Empty } from 'antd';
import {
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

interface ExpenseTrendProps {
  expensesTrend: Array<{ name: string; amount: number }>;
  role?: UserRole;
}

const ExpenseTrend: React.FC<ExpenseTrendProps> = ({ expensesTrend }) => {
  // If we only want this to show for certain roles, we could check here.
  // In original code, the Expense Trend block did not have a role check wrapping the Row, 
  // but let's keep it clean.
  return (
    <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
      <Col xs={24}>
        <Card title="Monthly Expense Trend" hoverable>
          {expensesTrend && expensesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={expensesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No data" />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ExpenseTrend;
