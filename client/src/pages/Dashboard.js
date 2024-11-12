import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import Overview from '../components/Dashboard/Overview';
import Orders from '../components/Dashboard/Orders';
import Products from '../components/Dashboard/Products';
import Profile from '../components/dashboard/Profile';
import Settings from '../components/dashboard/Settings';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default Dashboard;
