import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { productsAPI } from '../services/api';
import { CircularProgress } from '@mui/material';

const JobsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const JobCard = styled.div`
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

const FeaturedJobs = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedJobs = async () => {
      try {
        const response = await productsAPI.getAll({ featured: true });
        setFeaturedJobs(response.data);
      } catch (error) {
        console.error('Error loading featured jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedJobs();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <JobsContainer>
      {featuredJobs.map(job => (
        <JobCard key={job._id}>
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
};

export default FeaturedJobs;
