import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'react-feather';
import { Line } from 'react-chartjs-2';
import api from '../../services/api';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: ${props => props.increase ? '#28a745' : '#dc3545'};
`;

const ChartContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: stats?.monthlySales || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div>
      <StatsGrid>
        <StatCard>
          <StatHeader>
            <span>Total Users</span>
            <Users size={20} />
          </StatHeader>
          <StatValue>{stats?.totalUsers}</StatValue>
          <StatChange increase={stats?.userGrowth > 0}>
            {stats?.userGrowth > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(stats?.userGrowth)}% from last month
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <span>Total Products</span>
            <Package size={20} />
          </StatHeader>
          <StatValue>{stats?.totalProducts}</StatValue>
          <StatChange increase={stats?.productGrowth > 0}>
            {stats?.productGrowth > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(stats?.productGrowth)}% from last month
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <span>Total Orders</span>
            <ShoppingBag size={20} />
          </StatHeader>
          <StatValue>{stats?.totalOrders}</StatValue>
          <StatChange increase={stats?.orderGrowth > 0}>
            {stats?.orderGrowth > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(stats?.orderGrowth)}% from last month
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <span>Revenue</span>
            <DollarSign size={20} />
          </StatHeader>
          <StatValue>${stats?.totalRevenue.toFixed(2)}</StatValue>
          <StatChange increase={stats?.revenueGrowth > 0}>
            {stats?.revenueGrowth > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(stats?.revenueGrowth)}% from last month
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ChartContainer>
        <h3>Sales Overview</h3>
        <Line data={salesData} />
      </ChartContainer>

      {/* Add more charts and statistics as needed */}
    </div>
  );
}

export default DashboardStats; 