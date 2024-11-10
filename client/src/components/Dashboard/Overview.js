import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const OverviewContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const StatTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: bold;
`;

const StatChange = styled.span`
  color: ${({ isPositive, theme }) => 
    isPositive ? theme.colors.status.success : theme.colors.status.error};
  font-size: 0.9rem;
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

const ChartContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const RecentActivityContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.main};

  &:hover {
    background: ${({ theme }) => theme.colors.background.gradient};
  }
`;

const Overview = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrder: 0,
    conversionRate: 0
  });
  const [chartData, setChartData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Replace with your actual API calls
      const response = await fetch('/api/dashboard/overview');
      const data = await response.json();
      
      setStats(data.stats);
      setChartData(data.chartData);
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Overview'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <OverviewContainer>
      <StatsGrid>
        <StatCard
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <StatTitle>Total Sales</StatTitle>
          <StatValue>
            ${stats.totalSales.toLocaleString()}
            <StatChange isPositive={true}>+12.5%</StatChange>
          </StatValue>
        </StatCard>

        <StatCard
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <StatTitle>Total Orders</StatTitle>
          <StatValue>
            {stats.totalOrders.toLocaleString()}
            <StatChange isPositive={true}>+8.2%</StatChange>
          </StatValue>
        </StatCard>

        <StatCard
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <StatTitle>Average Order Value</StatTitle>
          <StatValue>
            ${stats.averageOrder.toLocaleString()}
            <StatChange isPositive={false}>-2.1%</StatChange>
          </StatValue>
        </StatCard>

        <StatCard
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <StatTitle>Conversion Rate</StatTitle>
          <StatValue>
            {stats.conversionRate}%
            <StatChange isPositive={true}>+5.3%</StatChange>
          </StatValue>
        </StatCard>
      </StatsGrid>

      <ChartContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {chartData && (
          <Line options={chartOptions} data={chartData} />
        )}
      </ChartContainer>

      <RecentActivityContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3>Recent Activity</h3>
        <ActivityList>
          {recentActivity.map((activity, index) => (
            <ActivityItem key={index}>
              <div>
                <strong>{activity.type}</strong>
                <p>{activity.description}</p>
                <small>{new Date(activity.timestamp).toLocaleString()}</small>
              </div>
            </ActivityItem>
          ))}
        </ActivityList>
      </RecentActivityContainer>
    </OverviewContainer>
  );
};

export default Overview; 