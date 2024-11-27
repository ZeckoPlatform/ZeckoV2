import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingFallback } from '../common/LoadingFallback';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}; 