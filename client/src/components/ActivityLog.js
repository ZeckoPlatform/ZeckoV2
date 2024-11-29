import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { activityLogService } from '../services/activityLogService';
import { useAuth } from '../contexts/AuthContext';

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
  const [retrying, setRetrying] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const initializeRealTimeUpdates = () => {
      activityLogService.onConnectionStatus(setIsConnected);
      activityLogService.subscribeToUpdates((newActivities) => {
        setActivities(prev => [...newActivities, ...prev]);
      });
      activityLogService.initializeSocket();
    };

    if (user) {
      initializeRealTimeUpdates();
    }

    return () => {
      activityLogService.unsubscribeFromUpdates();
      activityLogService.disconnect();
    };
  }, [user]);

  const handleRetryConnection = async () => {
    setRetrying(true);
    try {
      await activityLogService.reconnect();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div>
      <StatusBar isConnected={isConnected}>
        Real-time updates {isConnected ? 'enabled' : 'disabled'}
        {!isConnected && (
          <RetryButton 
            onClick={handleRetryConnection}
            disabled={retrying}
          >
            {retrying ? 'Retrying...' : 'Retry Connection'}
          </RetryButton>
        )}
      </StatusBar>

      {activities.map((activity, index) => (
        <div key={index}>
          <h4>{activity.type}</h4>
          <p>{activity.description}</p>
          <small>{new Date(activity.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default ActivityLog; 