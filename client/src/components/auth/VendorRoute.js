import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingFallback } from '../common/LoadingFallback';

export const VendorRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user || user.accountType !== 'vendor') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}; 