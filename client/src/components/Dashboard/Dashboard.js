import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserJobs } from '../../services/jobService';
import { useNotification } from '../../contexts/NotificationContext';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const notify = useNotification();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getUserJobs(user._id);
        if (data.error) {
          notify.error(data.error);
        } else {
          setJobs(data.jobs || []);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        notify.error('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchJobs();
    }
  }, [user, notify]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Rest of your dashboard component...
};

export default Dashboard; 