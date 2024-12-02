import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  Package,
  ArrowUp,
  ArrowDown
} from 'react-feather';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Container = styled.div`
  padding: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #666;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

const ChangeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: ${props => props.positive ? '#28a745' : '#dc3545'};
`;

const ChartContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

function Analytics() {
  const [analytics, setAnalytics] = useState({
    revenue: { total: 0, growth: 0 },
    orders: { total: 0, growth: 0 },
    users: { active: 0, growth: 0 },
    products: { sold: 0, growth: 0 },
    dailySales: [],
    categoryBreakdown: [],
    userActivity: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error loading analytics: {error}</div>;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const salesData = {
    labels: analytics.dailySales.map(day => format(new Date(day.date), 'MMM d')),
    datasets: [{
      label: 'Daily Sales',
      data: analytics.dailySales.map(day => day.total),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const categoryData = {
    labels: analytics.categoryBreakdown.map(cat => cat.name),
    datasets: [{
      data: analytics.categoryBreakdown.map(cat => cat.total),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ]
    }]
  };

  const userActivityData = {
    labels: analytics.userActivity.map(day => format(new Date(day.date), 'MMM d')),
    datasets: [{
      label: 'New Users',
      data: analytics.userActivity.map(day => day.newUsers),
      backgroundColor: 'rgba(54, 162, 235, 0.5)'
    }]
  };

  return (
    <Container>
      <StatsGrid>
        <StatCard>
          <StatHeader>
            <span>Total Revenue</span>
            <DollarSign size={20} />
          </StatHeader>
          <StatValue>${analytics.revenue.total.toFixed(2)}</StatValue>
          <ChangeIndicator positive={analytics.revenue.growth > 0}>
            {analytics.revenue.growth > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {Math.abs(analytics.revenue.growth)}% from last month
          </ChangeIndicator>
        </StatCard>

        <StatCard>
          <StatHeader>
            <span>Total Orders</span>
            <ShoppingBag size={20} />
          </StatHeader>
          <StatValue>{analytics.orders.total}</StatValue>
          <ChangeIndicator positive={analytics.orders.growth > 0}>
            {analytics.orders.growth > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {Math.abs(analytics.orders.growth)}% from last month
          </ChangeIndicator>
        </StatCard>

        <StatCard>
          <StatHeader>
            <span>Active Users</span>
            <Users size={20} />
          </StatHeader>
          <StatValue>{analytics.users.active}</StatValue>
          <ChangeIndicator positive={analytics.users.growth > 0}>
            {analytics.users.growth > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {Math.abs(analytics.users.growth)}% from last month
          </ChangeIndicator>
        </StatCard>

        <StatCard>
          <StatHeader>
            <span>Products Sold</span>
            <Package size={20} />
          </StatHeader>
          <StatValue>{analytics.products.sold}</StatValue>
          <ChangeIndicator positive={analytics.products.growth > 0}>
            {analytics.products.growth > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {Math.abs(analytics.products.growth)}% from last month
          </ChangeIndicator>
        </StatCard>
      </StatsGrid>

      <ChartGrid>
        <ChartContainer>
          <h3>Sales Overview</h3>
          <div style={{ height: '300px' }}>
            <Line data={salesData} options={chartOptions} />
          </div>
        </ChartContainer>

        <ChartContainer>
          <h3>Category Breakdown</h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={categoryData} options={chartOptions} />
          </div>
        </ChartContainer>

        <ChartContainer>
          <h3>User Activity</h3>
          <div style={{ height: '300px' }}>
            <Bar data={userActivityData} options={chartOptions} />
          </div>
        </ChartContainer>

        <ChartContainer>
          <h3>Top Products</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Sales</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.map(product => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.totalSold}</td>
                  <td>${product.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartContainer>
      </ChartGrid>
    </Container>
  );
}

export default Analytics; 