import React, { useState, useEffect } from 'react';
import { 
  DashboardContainer, 
  ChartContainer, 
  ActivityContainer,
  ActivityList,
  ActivityItem 
} from '../../styles/dashboard';
import DashboardStats from '../../components/Dashboard/DashboardStats';
import { Line } from 'react-chartjs-2';
import { 
  People as PeopleIcon,
  Business as BusinessIcon,
  LocalShipping as ShippingIcon,
  MonetizationOn as MoneyIcon 
} from '@mui/icons-material';
import { Typography } from '@mui/material';
import { getDashboardStats } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statsData = [
    {
      label: 'Total Users',
      value: stats?.users?.total || 0,
      change: stats?.users?.growth,
      icon: <PeopleIcon />
    },
    {
      label: 'Active Businesses',
      value: stats?.businesses?.active || 0,
      change: stats?.businesses?.growth,
      icon: <BusinessIcon />
    },
    {
      label: 'Total Orders',
      value: stats?.orders?.total || 0,
      change: stats?.orders?.growth,
      icon: <ShippingIcon />
    },
    {
      label: 'Revenue',
      value: `$${stats?.revenue?.total || 0}`,
      change: stats?.revenue?.growth,
      icon: <MoneyIcon />
    }
  ];

  return (
    <DashboardContainer>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <DashboardStats stats={statsData} />

      <ChartContainer>
        <Typography variant="h6" gutterBottom>
          Revenue Overview
        </Typography>
        {stats?.revenueChart && (
          <Line data={stats.revenueChart} options={chartOptions} />
        )}
      </ChartContainer>

      <ActivityContainer>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <ActivityList>
          {stats?.recentActivity?.map((activity, index) => (
            <ActivityItem key={index}>
              <div>
                <Typography variant="subtitle1">
                  {activity.type}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {activity.description}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(activity.timestamp).toLocaleString()}
                </Typography>
              </div>
            </ActivityItem>
          ))}
        </ActivityList>
      </ActivityContainer>
    </DashboardContainer>
  );
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Monthly Revenue'
    }
  }
};

export default AdminDashboard; 