import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="Access Denied"
      subTitle="You do not have permission to view this page. Please contact your administrator if you believe this is an error."
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      }
    />
  );
};

export default AccessDeniedPage;
