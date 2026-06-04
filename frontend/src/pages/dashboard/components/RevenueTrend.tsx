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

interface RevenueTrendProps {
  trendData: Array<{name: string, revenue: number}>;
  role?: UserRole;
}

const RevenueTrend: React.FC<RevenueTrendProps> = ({ trendData, role }) => {
  if (role !== 'admin' && role !== 'super_admin' && role !== 'owner' && role !== 'sales_executive') {
    return null;
  }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={24}>
        <Card title="7-Day Revenue Trend" hoverable>
          {trendData && trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#52c41a" activeDot={{ r: 8 }} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No revenue data available" />
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default RevenueTrend;
