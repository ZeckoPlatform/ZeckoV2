import React, { useState, useEffect } from 'react';
import { 
  DashboardContainer, 
  ChartContainer, 
  ActivityContainer,
  ActivityList,
  ActivityItem 
} from '../../styles/dashboard';
import DashboardStats from '../../components/Dashboard/DashboardStats';
import { 
  Inventory as InventoryIcon,
  ShoppingCart as CartIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingIcon 
} from '@mui/icons-material';
import { Typography, Button } from '@mui/material';
import { getVendorStats } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const VendorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getVendorStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching vendor stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statsData = [
    {
      label: 'Active Products',
      value: stats?.activeProducts || 0,
      icon: <InventoryIcon />
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: <CartIcon />
    },
    {
      label: 'Monthly Sales',
      value: `$${stats?.monthlySales || 0}`,
      change: stats?.salesGrowth,
      icon: <MoneyIcon />
    },
    {
      label: 'Conversion Rate',
      value: `${stats?.conversionRate || 0}%`,
      change: stats?.conversionGrowth,
      icon: <TrendingIcon />
    }
  ];

  return (
    <DashboardContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Typography variant="h4">
          Vendor Dashboard
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/vendor/products/new')}
        >
          Add New Product
        </Button>
      </div>

      <DashboardStats stats={statsData} />

      <ChartContainer>
        <Typography variant="h6" gutterBottom>
          Sales Overview
        </Typography>
        {stats?.salesChart && (
          <Line data={stats.salesChart} options={chartOptions} />
        )}
      </ChartContainer>

      <ActivityContainer>
        <Typography variant="h6" gutterBottom>
          Recent Orders
        </Typography>
        <ActivityList>
          {stats?.recentOrders?.map((order, index) => (
            <ActivityItem key={index}>
              <div>
                <Typography variant="subtitle1">
                  Order #{order.orderNumber}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ${order.amount} - {order.status}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(order.timestamp).toLocaleString()}
                </Typography>
              </div>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate(`/vendor/orders/${order.id}`)}
              >
                View Details
              </Button>
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
      text: 'Monthly Sales'
    }
  }
};

export default VendorDashboard; 