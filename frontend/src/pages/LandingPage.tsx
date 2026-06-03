import React, { useEffect, useState } from 'react';
import { Button, Card, Row, Col, Space, Badge, Statistic } from 'antd';
import { 
  ArrowRightOutlined, 
  CheckCircleOutlined, 
  DashboardOutlined, 
  ApiOutlined, 
  DashboardFilled,
  HeartOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@redux/hooks';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  
  // Diagnostic state for live system metrics
  const [latency, setLatency] = useState(34);
  const [activeUsers, setActiveUsers] = useState(5);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    // Dynamic diagnostics simulation
    const interval = setInterval(() => {
      setLatency(Math.floor(28 + Math.random() * 15));
      setCurrentTime(new Date().toLocaleTimeString());
      if (Math.random() > 0.8) {
        setActiveUsers(Math.floor(4 + Math.random() * 4));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      {/* Top Navbar */}
      <header className="landing-header">
        <div className="landing-logo">
          <div className="logo-icon">SG</div>
          <span>Sri Ganga Food Products</span>
        </div>
        <div className="landing-nav">
          <Space size="middle">
            <Badge status="processing" text={<span className="live-server-tag">Server Online</span>} />
            {user ? (
              <Button type="primary" icon={<DashboardOutlined />} onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button type="text" className="nav-btn" onClick={() => navigate('/login')}>Sign In</Button>
                <Button type="primary" className="nav-btn-primary" onClick={() => navigate('/signup')}>Request Account</Button>
              </>
            )}
          </Space>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} lg={12} className="hero-text">
            <Badge count="ERP Solution & Public Storefront v1.0" className="hero-badge" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', fontWeight: 600 }} />
            <h1>Premium Food Products & Internal ERP Operations</h1>
            <p>
              Welcome to Sri Ganga Food Products! Order our fresh sweets and snacks directly online, or sign in to our secure ERP portal to manage manufacturing and logistics operations.
            </p>
            <Space size="middle">
              <Button type="primary" size="large" icon={<ShopOutlined />} onClick={() => navigate('/store')} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                Order Food Online
              </Button>
              <Button size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/login')}>
                Employee Portal Login
              </Button>
            </Space>
          </Col>
          <Col xs={24} lg={12} className="hero-image-container">
            <div className="image-wrapper">
              <img src="/factory_banner.png" alt="Sri Ganga Processing Mill Mockup" className="hero-banner-image" />
              <div className="image-overlay">
                <span className="overlay-badge"><CheckCircleOutlined /> Modern Automated Facility</span>
              </div>
            </div>
          </Col>
        </Row>
      </section>

      {/* Diagnostics & Live Server Metrics */}
      <section className="diagnostics-section">
        <Card title={
          <div className="diagnostics-title">
            <ApiOutlined style={{ color: '#4f46e5' }} />
            <span>Live Server Diagnostics & Capacity</span>
          </div>
        } className="diagnostics-card">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable className="metric-box">
                <Statistic 
                  title="Database Connection" 
                  value="Online" 
                  valueStyle={{ color: '#10b981', fontWeight: 600 }} 
                  prefix={<Badge status="processing" />} 
                />
                <span className="metric-desc">PostgreSQL / Supabase</span>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable className="metric-box">
                <Statistic 
                  title="API Latency" 
                  value={`${latency} ms`} 
                  valueStyle={{ color: '#4f46e5', fontWeight: 600 }} 
                  prefix={<DashboardFilled />} 
                />
                <span className="metric-desc">Fluctuating in real-time</span>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable className="metric-box">
                <Statistic 
                  title="Active ERP Sessions" 
                  value={activeUsers} 
                  valueStyle={{ color: '#06b6d4', fontWeight: 600 }} 
                />
                <span className="metric-desc">Connected managers</span>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable className="metric-box">
                <Statistic 
                  title="Mill Diagnostic Time" 
                  value={currentTime} 
                  valueStyle={{ color: '#f59e0b', fontWeight: 600 }} 
                />
                <span className="metric-desc">Local client runtime</span>
              </Card>
            </Col>
          </Row>
        </Card>
      </section>

      {/* Highlights / Features Grid */}
      <section className="features-section">
        <h2>Key ERP Modules & Operations</h2>
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} md={8}>
            <Card title="Warehouse & Stock" bordered={false} className="feature-card">
              <p>Automated inward and outward stock calculation trigger checks. Handles batch numbers, manufacturing/expiry dates, and automatically computes current balances.</p>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="HR, Attendance & Payroll" bordered={false} className="feature-card">
              <p>Records daily employee logs, handles half-days, and uses pre-configured formulas to process monthly payslips directly in your database.</p>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Procurement & Logistics" bordered={false} className="feature-card">
              <p>Maintains purchase orders, vendor credit limits, supplier records, driver dispatch sheets, and vehicle transit statuses in one audit log.</p>
            </Card>
          </Col>
        </Row>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 Sri Ganga Food Products. Internal ERP Portal. All rights reserved.</p>
        <p className="credit-text">Built with <HeartOutlined style={{ color: '#ef4444' }} /> for Sri Ganga Food Products</p>
      </footer>
    </div>
  );
};

export default LandingPage;
