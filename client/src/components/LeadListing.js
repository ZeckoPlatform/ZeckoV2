import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Spinner from './Spinner';

const JobListingContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const JobItem = styled.div`
  border-bottom: 1px solid #eee;
  padding: 15px 0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const JobTitle = styled.h3`
  color: var(--primary-color);
  margin-bottom: 5px;
`;

const JobDescription = styled.p`
  color: var(--text-color);
  margin-bottom: 10px;
`;

const JobMeta = styled.div`
  display: flex;
  justify-content: space-between;
  color: #777;
  font-size: 0.9em;
`;

const JobDetailsButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;

  &:hover, &:focus {
    background-color: darken(var(--primary-color), 10%);
    outline: 2px solid var(--primary-color);
  }
`;

function JobListing() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobDetails = (jobId) => {
    // Implement job details view logic here
    console.log(`View details for job ${jobId}`);
  };

  if (loading) return <Spinner aria-label="Loading jobs" />;
  if (error) return <p role="alert">Error: {error}</p>;

  return (
    <JobListingContainer>
      <h2 id="job-listing-title">Available Jobs</h2>
      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <ul aria-labelledby="job-listing-title">
          {jobs.map(job => (
            <li key={job._id}>
              <JobItem>
                <JobTitle>{job.title}</JobTitle>
                <JobDescription>{job.description}</JobDescription>
                <JobMeta>
                  <span>Budget: ${job.budget}</span>
                  <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                </JobMeta>
                <JobDetailsButton 
                  onClick={() => handleJobDetails(job._id)}
                  aria-label={`View details for ${job.title}`}
                >
                  View Details
                </JobDetailsButton>
              </JobItem>
            </li>
          ))}
        </ul>
      )}
    </JobListingContainer>
  );
}

export default JobListing;
