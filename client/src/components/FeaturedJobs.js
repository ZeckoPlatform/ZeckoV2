import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import api from '../services/api';

const JobsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const JobCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  h3 {
    color: var(--primary-color, ${({ theme }) => theme.colors.primary.main});
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const JobDetails = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const JobTag = styled.span`
  background: ${({ theme }) => theme.colors.background.light};
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8rem;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  grid-column: 1 / -1;
`;

const ErrorState = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.status.error};
  padding: ${({ theme }) => theme.spacing.xl};
  grid-column: 1 / -1;
`;

export function FeaturedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await api.get('/jobs/featured');
        setJobs(response.data);
      } catch (err) {
        console.error('Error fetching featured jobs:', err);
        setError('Failed to load featured jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  if (loading) {
    return <LoadingState>Loading featured jobs...</LoadingState>;
  }

  if (error) {
    return <ErrorState>{error}</ErrorState>;
  }

  if (!jobs.length) {
    return <LoadingState>No featured jobs available</LoadingState>;
  }

  return (
    <JobsContainer>
      {jobs.map((job) => (
        <Link to={`/jobs/${job._id}`} key={job._id} style={{ textDecoration: 'none' }}>
          <JobCard>
            <h3>{job.title}</h3>
            <p>{job.description.substring(0, 100)}...</p>
            <JobDetails>
              <div>🏢 {job.company}</div>
              <div>📍 {job.location}</div>
              <div>
                <JobTag>{job.type}</JobTag>
                {job.salary && <JobTag>${job.salary}</JobTag>}
              </div>
            </JobDetails>
          </JobCard>
        </Link>
      ))}
    </JobsContainer>
  );
}
