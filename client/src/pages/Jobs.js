import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CircularProgress } from '@mui/material';
import { fetchData, endpoints } from '../services/api';

const JobsContainer = styled.div`
  text-align: center;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.size.h2};
`;

function Jobs() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetchData(endpoints.jobs.list);
        if (response.data) {
          setJobs(response.data);
        }
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <JobsContainer>
      <SectionTitle>Available Jobs</SectionTitle>
      {/* Add job listing components here */}
    </JobsContainer>
  );
}

export default Jobs; 