import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@redux/hooks';
import { Spin } from 'antd';
import { PAGE_ACCESS } from '@config/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  pageKey?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, pageKey }) => {
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const role = user?.user_metadata?.role;

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isApproved = user.user_metadata?.is_approved !== false;
  if (!isApproved && pageKey !== 'pending-approval') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (pageKey && pageKey !== 'pending-approval') {
    const allowedPages = role ? PAGE_ACCESS[role] : ['dashboard', 'settings'];
    if (!allowedPages.includes(pageKey)) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
