import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import ContractorDashboard from './ContractorDashboard';
import VendorDashboard from './VendorDashboard';
import UserDashboard from './UserDashboard';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  const getDashboardComponent = () => {
    switch (user?.accountType) {
      case 'admin':
        return <AdminDashboard />;
      case 'contractor':
        return <ContractorDashboard />;
      case 'vendor':
        return <VendorDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {getDashboardComponent()}
    </DashboardLayout>
  );
};

export default Dashboard; 