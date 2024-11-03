import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { activityLogService } from '../services/activityLogService';
import { 
  subscribeToActivityUpdates, 
  unsubscribeFromActivityUpdates,
  getSocket 
} from '../utils/socket.io';
import { testActivityUpdate } from '../utils/testActivityLog';

const ActivityLogContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FilterSection = styled.div`
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
`;

const Select = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  min-width: 150px;
`;

const ActivityItem = styled.div`
  background: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityType = styled.span`
  background-color: ${props => {
    switch (props.type) {
      case 'login': return '#e3f2fd';
      case 'security': return '#fff3e0';
      case 'profile': return '#e8f5e9';
      case 'order': return '#f3e5f5';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'login': return '#1976d2';
      case 'security': return '#f57c00';
      case 'profile': return '#388e3c';
      case 'order': return '#7b1fa2';
      default: return '#616161';
    }
  }};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-right: 10px;
`;

const Timestamp = styled.time`
  color: #666;
  font-size: 0.9rem;
`;

const NoActivities = styled.div`
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  color: #666;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.connected ? '#4caf50' : '#f44336'};
`;

const UpdateIndicator = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #2196f3;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  animation: fadeIn 0.3s ease-in;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TestButton = styled.button`
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 10px;

  &:hover {
    background-color: #f57c00;
  }
`;

function UserActivityLog() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [realtimeUpdate, setRealtimeUpdate] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: 'week'
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchActivityLog();

    // Initialize socket connection
    const socket = getSocket();
    if (socket) {
      setSocketConnected(socket.connected);

      // Handle socket connection status
      const handleConnect = () => {
        console.log('Socket connected');
        setSocketConnected(true);
      };

      const handleDisconnect = () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      };

      const handleError = (error) => {
        console.error('Socket error:', error);
        setError('Real-time updates unavailable');
        setSocketConnected(false);
      };

      // Add event listeners
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('error', handleError);

      // Handle real-time activity updates
      const handleActivityUpdate = (newActivity) => {
        if (newActivity) {
          setActivities(prevActivities => {
            const updatedActivities = [newActivity, ...prevActivities];
            return updatedActivities.sort((a, b) => 
              new Date(b.timestamp) - new Date(a.timestamp)
            );
          });
          
          setRealtimeUpdate(true);
          setTimeout(() => setRealtimeUpdate(false), 3000);
        }
      };

      const cleanup = subscribeToActivityUpdates(handleActivityUpdate);

      // Cleanup function
      return () => {
        cleanup();
        if (socket) {
          socket.off('connect', handleConnect);
          socket.off('disconnect', handleDisconnect);
          socket.off('error', handleError);
        }
      };
    }
  }, [filters]);

  const fetchActivityLog = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await activityLogService.getActivityLog(filters);
      setActivities(data?.activities || []);
    } catch (err) {
      console.error('Error fetching activity log:', err);
      setError(err.message || 'Error fetching activities');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConnection = () => {
    const socket = getSocket();
    if (socket) {
      console.log('Attempting to reconnect socket...');
      socket.connect();
    }
  };

  const handleTestUpdate = () => {
    try {
      testActivityUpdate();
    } catch (err) {
      console.error('Error testing update:', err);
    }
  };

  return (
    <ActivityLogContainer>
      <Header>
        <h1>Activity Log</h1>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StatusIndicator>
            <StatusDot connected={socketConnected} />
            {socketConnected ? 'Real-time updates enabled' : (
              <>
                Real-time updates disabled
                <button onClick={handleRetryConnection}>Retry</button>
              </>
            )}
          </StatusIndicator>
          
          {/* Add test button only in development */}
          {process.env.NODE_ENV === 'development' && (
            <TestButton onClick={handleTestUpdate}>
              Test Updates
            </TestButton>
          )}
        </div>
      </Header>
      
      <FilterSection>
        <Select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
        >
          <option value="all">All Activities</option>
          <option value="login">Login Activities</option>
          <option value="security">Security Changes</option>
          <option value="profile">Profile Updates</option>
          <option value="order">Order Activities</option>
        </Select>

        <Select
          name="dateRange"
          value={filters.dateRange}
          onChange={handleFilterChange}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </Select>
      </FilterSection>

      {loading ? (
        <div>Loading activities...</div>
      ) : error ? (
        <div>
          Error: {error}
          <button onClick={fetchActivityLog}>Retry</button>
        </div>
      ) : !activities || activities.length === 0 ? (
        <NoActivities>No activities found for the selected filters.</NoActivities>
      ) : (
        <>
          {activities.map(activity => (
            <ActivityItem key={activity._id || activity.id}>
              <ActivityInfo>
                <ActivityType type={activity.type}>
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </ActivityType>
                <span>{activity.description}</span>
              </ActivityInfo>
              <Timestamp>{new Date(activity.timestamp).toLocaleString()}</Timestamp>
            </ActivityItem>
          ))}
          
          {realtimeUpdate && (
            <UpdateIndicator>
              New activity received!
            </UpdateIndicator>
          )}
        </>
      )}
    </ActivityLogContainer>
  );
}

export default UserActivityLog; 