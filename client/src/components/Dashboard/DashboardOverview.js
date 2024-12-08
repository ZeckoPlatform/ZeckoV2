import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Grid, 
  Paper, 
  CircularProgress,
  Button,
  IconButton 
} from '@mui/material';
import { 
  TrendingUp, 
  MonetizationOn, 
  Description, 
  Mail,
  Refresh 
} from '@mui/icons-material';
import { api } from '../../services/api';
import CreditBalance from '../credits/CreditBalance';

const StatsCard = styled(Paper)`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.5rem;
`;

const RecentActivity = styled(Paper)`
  padding: 1.5rem;
  margin-top: 2rem;
`;

const ActivityItem = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, activitiesResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activities')
      ]);
      
      setStats(statsResponse.data);
      setActivities(activitiesResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2>Dashboard Overview</h2>
        <IconButton onClick={fetchDashboardData}>
          <Refresh />
        </IconButton>
      </div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatsCard>
            <div>
              <StatValue>{stats.activeLeads}</StatValue>
              <StatLabel>Active Leads</StatLabel>
            </div>
            <Description fontSize="large" color="primary" />
          </StatsCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatsCard>
            <div>
              <StatValue>{stats.proposalsSent}</StatValue>
              <StatLabel>Proposals Sent</StatLabel>
            </div>
            <Mail fontSize="large" color="primary" />
          </StatsCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatsCard>
            <div>
              <StatValue>${stats.totalEarnings}</StatValue>
              <StatLabel>Total Earnings</StatLabel>
            </div>
            <MonetizationOn fontSize="large" color="primary" />
          </StatsCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatsCard>
            <div>
              <StatValue>{stats.winRate}%</StatValue>
              <StatLabel>Win Rate</StatLabel>
            </div>
            <TrendingUp fontSize="large" color="primary" />
          </StatsCard>
        </Grid>
      </Grid>

      <Grid container spacing={3} style={{ marginTop: '1rem' }}>
        <Grid item xs={12} md={8}>
          <RecentActivity>
            <h3>Recent Activity</h3>
            {activities.map((activity, index) => (
              <ActivityItem key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{activity.type}</strong>
                    <p>{activity.description}</p>
                  </div>
                  <small>{new Date(activity.date).toLocaleDateString()}</small>
                </div>
              </ActivityItem>
            ))}
            <Button 
              variant="text" 
              fullWidth 
              style={{ marginTop: '1rem' }}
              onClick={() => {/* Navigate to full activity log */}}
            >
              View All Activity
            </Button>
          </RecentActivity>
        </Grid>

        <Grid item xs={12} md={4}>
          <CreditBalance />
        </Grid>
      </Grid>
    </div>
  );
};

export default DashboardOverview; 