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
  Assignment as AssignmentIcon,
  Message as MessageIcon,
  Engineering as EngineeringIcon,
  Notifications as NotificationsIcon 
} from '@mui/icons-material';
import { Typography, Button, Avatar } from '@mui/material';
import { getUserStats } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getUserStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statsData = [
    {
      label: 'Active Requests',
      value: stats?.activeRequests || 0,
      icon: <AssignmentIcon />
    },
    {
      label: 'New Messages',
      value: stats?.newMessages || 0,
      icon: <MessageIcon />
    },
    {
      label: 'Active Services',
      value: stats?.activeServices || 0,
      icon: <EngineeringIcon />
    },
    {
      label: 'Notifications',
      value: stats?.notifications || 0,
      icon: <NotificationsIcon />
    }
  ];

  return (
    <DashboardContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Avatar 
          src={user?.profileImage} 
          alt={user?.name}
          sx={{ width: 64, height: 64 }}
        />
        <div>
          <Typography variant="h4">
            Welcome back, {user?.name || 'User'}!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {user?.email}
          </Typography>
        </div>
      </div>

      <DashboardStats stats={statsData} />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/service-request')}
        >
          New Service Request
        </Button>
        <Button 
          variant="outlined"
          onClick={() => navigate('/messages')}
        >
          View Messages
        </Button>
      </div>

      <ActivityContainer>
        <Typography variant="h6" gutterBottom>
          Recent Service Requests
        </Typography>
        <ActivityList>
          {stats?.recentRequests?.map((request, index) => (
            <ActivityItem key={index}>
              <div>
                <Typography variant="subtitle1">
                  {request.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Status: {request.status}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(request.timestamp).toLocaleString()}
                </Typography>
              </div>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate(`/requests/${request.id}`)}
              >
                View Details
              </Button>
            </ActivityItem>
          ))}
        </ActivityList>
      </ActivityContainer>

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

export default UserDashboard; 