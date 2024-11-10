import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Overview from '../components/dashboard/Overview';
import Orders from '../components/dashboard/Orders';
import Products from '../components/dashboard/Products';
import Profile from '../components/dashboard/Profile';
import Settings from '../components/dashboard/Settings';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
