import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { activityLogService } from '../services/activityLogService';
import { useAuth } from '../context/AuthContext';

const RetryButton = styled.button`
  padding: 5px 10px;
  margin-left: 10px;
  cursor: pointer;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: ${props => props.isConnected ? 'green' : 'red'};
`;

function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const initializeRealTimeUpdates = () => {
    if (token && user) {
      activityLogService.disconnect(); // Disconnect any existing connection
      activityLogService.initializeSocket();
      
      // Subscribe to connection status
      activityLogService.onConnectionStatus((status) => {
        setIsConnected(status);
      });

      // Subscribe to activity updates
      activityLogService.subscribeToUpdates((newActivities) => {
        setActivities(newActivities);
      });
    }
  };

  useEffect(() => {
    initializeRealTimeUpdates();

    return () => {
      activityLogService.disconnect();
    };
  }, [user, token]);

  const handleRetryConnection = () => {
    initializeRealTimeUpdates();
  };

  return (
    <div>
      <StatusIndicator isConnected={isConnected}>
        Real-time updates {isConnected ? 'enabled' : 'disabled'}
        {!isConnected && (
          <RetryButton onClick={handleRetryConnection}>
            Retry
          </RetryButton>
        )}
      </StatusIndicator>
      
      {/* Activity list */}
      {activities.map((activity, index) => (
        <div key={index}>
          <h3>{activity.type}</h3>
          <p>{activity.details}</p>
          <small>{new Date(activity.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default ActivityLog; 