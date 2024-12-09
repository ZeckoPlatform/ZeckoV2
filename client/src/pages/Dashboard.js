import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { productsAPI, ordersAPI, userAPI } from '../services/api';  // Updated imports
import { CircularProgress } from '@mui/material';

// ... styled components remain the same ...

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    products: [],
    orders: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [productsRes, ordersRes, notificationsRes] = await Promise.all([
          productsAPI.getAll(),
          ordersAPI.getAll(),
          userAPI.getNotifications()
        ]);

        setDashboardData({
          products: productsRes.data,
          orders: ordersRes.data,
          notifications: notificationsRes.data
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  // ... rest of the component remains the same ...
};

export default Dashboard;