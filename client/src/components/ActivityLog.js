import React, { useEffect, useState } from 'react';
import { activityLogService } from '../services/activityLogService';

function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { activities: initialActivities } = await activityLogService.getActivityLog();
        setActivities(initialActivities);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    // Subscribe to real-time updates
    activityLogService.subscribeToUpdates((updatedActivities) => {
      setActivities(updatedActivities);
    });

    fetchActivities();

    // Cleanup
    return () => {
      activityLogService.unsubscribeFromUpdates();
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {activities.map((activity) => (
        <div key={activity._id}>
          <h3>{activity.type}</h3>
          <p>{activity.details}</p>
          <small>{new Date(activity.timestamp).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default ActivityLog; 