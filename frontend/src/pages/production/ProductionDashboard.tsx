import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';

const ProductionDashboard: React.FC = () => {
  return (
    <div className="production-dashboard">
      <Card style={{ marginBottom: 24 }}>
        <h2>Production Control</h2>
        <p>Manage manufacturing, work orders, and bill of materials.</p>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Active Work Orders"
              value={0}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductionDashboard;
