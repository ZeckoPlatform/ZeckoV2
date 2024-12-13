import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { productsAPI } from '../services/api';
import { CircularProgress } from '@mui/material';

const FeaturedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        setJobs(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        console.error('Error loading featured jobs:', err);
        setError(err.message);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <div>Error loading featured jobs: {error}</div>;
  if (!jobs?.length) return <div>No featured jobs available</div>;

  return (
    <div>
      {jobs.map(job => (
        <div key={job._id || 'default'}>
          {/* Job content */}
          {job.title || 'Untitled Job'}
        </div>
      ))}
    </div>
  );
};

export default FeaturedJobs;
