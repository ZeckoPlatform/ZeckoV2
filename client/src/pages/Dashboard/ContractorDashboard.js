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
  Work as WorkIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  MonetizationOn as MoneyIcon 
} from '@mui/icons-material';
import { Typography, Button, Chip } from '@mui/material';
import { getBusinessStats } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const ContractorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getBusinessStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching contractor stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statsData = [
    {
      label: 'Active Leads',
      value: stats?.activeLeads || 0,
      icon: <WorkIcon />
    },
    {
      label: 'Won Contracts',
      value: stats?.wonContracts || 0,
      change: stats?.contractGrowth,
      icon: <AssignmentIcon />
    },
    {
      label: 'Rating',
      value: `${stats?.rating || 0}/5`,
      icon: <StarIcon />
    },
    {
      label: 'Total Revenue',
      value: `$${stats?.totalRevenue || 0}`,
      change: stats?.revenueGrowth,
      icon: <MoneyIcon />
    }
  ];

  return (
    <DashboardContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Typography variant="h4">
          Contractor Dashboard
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/leads/search')}
        >
          Find Leads
        </Button>
      </div>

      <DashboardStats stats={statsData} />

      <ChartContainer>
        <Typography variant="h6" gutterBottom>
          Lead Conversion Rate
        </Typography>
        {stats?.conversionChart && (
          <Line data={stats.conversionChart} options={chartOptions} />
        )}
      </ChartContainer>

      <ActivityContainer>
        <Typography variant="h6" gutterBottom>
          Active Leads
        </Typography>
        <ActivityList>
          {stats?.activeLeads?.map((lead, index) => (
            <ActivityItem key={index}>
              <div>
                <Typography variant="subtitle1">
                  {lead.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Budget: ${lead.budget}
                </Typography>
                <Chip 
                  size="small" 
                  label={lead.status}
                  color={lead.status === 'new' ? 'primary' : 'default'}
                />
              </div>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate(`/leads/${lead.id}`)}
              >
                View Lead
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
      text: 'Monthly Lead Conversion'
    }
  }
};

export default ContractorDashboard; 