import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/Dashboard/DashboardLayout';

function Dashboard() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export default Dashboard;