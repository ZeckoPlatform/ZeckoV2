import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { activityLogService } from '../services/activityLogService';
import { useAuth } from '../context/AuthContext';

const ActivityLogContainer = styled.div`
  padding: 20px;
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: ${props => props.isConnected ? '#e8f5e9' : '#ffebee'};
  border-radius: 4px;
`;

const RetryButton = styled.button`
  margin-left: 10px;
  padding: 5px 10px;
  cursor: pointer;
`;

function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/activity-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(data.activities || []);
      return true;
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const initializeRealTimeUpdates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // First fetch activities
      const success = await fetchActivities();
      if (!success) return;

      // Then initialize socket
      activityLogService.disconnect(); // Clean up any existing connection
      activityLogService.initializeSocket();

      activityLogService.onConnectionStatus((status) => {
        console.log('Socket connection status:', status);
        setIsConnected(status);
      });

      activityLogService.subscribeToUpdates((newActivities) => {
        console.log('Received new activities:', newActivities);
        setActivities(newActivities);
      });

    } catch (error) {
      console.error('Error initializing real-time updates:', error);
      setError(error.message);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (user) {
      initializeRealTimeUpdates();
    }

    return () => {
      activityLogService.disconnect();
    };
  }, [user]);

  const handleRetryConnection = () => {
    setError(null);
    initializeRealTimeUpdates();
  };

  if (loading) {
    return <div>Loading activity log...</div>;
  }

  if (error) {
    return (
      <ActivityLogContainer>
        <StatusBar isConnected={false}>
          Error: {error}
          <RetryButton onClick={handleRetryConnection}>Retry</RetryButton>
        </StatusBar>
      </ActivityLogContainer>
    );
  }

  return (
    <ActivityLogContainer>
      <StatusBar isConnected={isConnected}>
        Real-time updates {isConnected ? 'enabled' : 'disabled'}
        {!isConnected && (
          <RetryButton onClick={handleRetryConnection}>
            Retry Connection
          </RetryButton>
        )}
      </StatusBar>

      {activities.length === 0 ? (
        <div>No activities found</div>
      ) : (
        activities.map((activity, index) => (
          <div key={index}>
            <h4>{activity.type}</h4>
            <p>{activity.details}</p>
            <small>{new Date(activity.timestamp).toLocaleString()}</small>
          </div>
        ))
      )}
    </ActivityLogContainer>
  );
}

export default ActivityLog; 