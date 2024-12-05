import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign 
} from 'react-feather';
import { fetchData, endpoints } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const Container = styled.div`
  padding: 20px;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ChartContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

function Analytics() {
  const [data, setData] = useState({
    users: [],
    orders: [],
    revenue: [],
    growth: []
  });
  const [loading, setLoading] = useState(true);
  const notify = useNotification();

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const [users, orders, revenue, growth] = await Promise.all([
        fetchData(endpoints.analytics.users),
        fetchData(endpoints.analytics.orders),
        fetchData(endpoints.analytics.revenue),
        fetchData(endpoints.analytics.growth)
      ]);

      setData({
        users: users.data,
        orders: orders.data,
        revenue: revenue.data,
        growth: growth.data
      });
    } catch (error) {
      notify.error('Failed to load analytics data');
      console.error('Analytics data fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchAnalyticsData();

    // Set up polling interval for real-time updates
    const interval = setInterval(fetchAnalyticsData, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchAnalyticsData]);

  if (loading) {
    return <Container>Loading analytics...</Container>;
  }

  return (
    <Container>
      <ChartGrid>
        <ChartContainer>
          <h3><Users /> User Growth</h3>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>New Users</th>
                <th>Growth Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((item, index) => (
                <tr key={index}>
                  <td>{item.period}</td>
                  <td>{item.newUsers}</td>
                  <td>{item.growthRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartContainer>

        <ChartContainer>
          <h3><ShoppingBag /> Orders Overview</h3>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Orders</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((item, index) => (
                <tr key={index}>
                  <td>{item.period}</td>
                  <td>{item.count}</td>
                  <td>${item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartContainer>

        <ChartContainer>
          <h3><DollarSign /> Revenue Analysis</h3>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Revenue</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {data.revenue.map((item, index) => (
                <tr key={index}>
                  <td>{item.period}</td>
                  <td>${item.amount}</td>
                  <td>{item.growth}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartContainer>

        <ChartContainer>
          <h3><TrendingUp /> Growth Metrics</h3>
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {data.growth.map((item, index) => (
                <tr key={index}>
                  <td>{item.metric}</td>
                  <td>{item.value}</td>
                  <td>{item.change}%</td>
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