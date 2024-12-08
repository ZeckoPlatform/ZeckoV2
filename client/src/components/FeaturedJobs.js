import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { fetchData, endpoints } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const JobsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const JobCard = styled(Link)`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const JobTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const JobDetails = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9em;

  p {
    margin: 5px 0;
  }
`;

const JobTag = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary.light};
  color: ${({ theme }) => theme.colors.primary.text};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8em;
  margin-right: 5px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  padding: 20px;
  background: ${({ theme }) => theme.colors.error}10;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin: 20px 0;
`;

function FeaturedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { error: notify } = useNotification();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchData(endpoints.jobs.featured);
      setJobs(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load jobs';
      setError(errorMessage);
      notify(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  if (loading) {
    return <LoadingContainer>Loading jobs...</LoadingContainer>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <JobsContainer>
      {jobs.map(job => (
        <JobCard key={job._id} to={`/jobs/${job._id}`}>
          <JobTitle>{job.title}</JobTitle>
          <JobDetails>
            <p><strong>Company:</strong> {job.company}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <div>
              <JobTag>{job.type}</JobTag>
              {job.salary && <JobTag>${job.salary}</JobTag>}
            </div>
          </JobDetails>
        </JobCard>
      ))}
    </JobsContainer>
  );
}

export default FeaturedJobs;
