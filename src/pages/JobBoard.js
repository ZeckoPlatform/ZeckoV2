import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const JobBoardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
`;

const Select = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const JobList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const JobCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const JobTitle = styled.h3`
  margin: 0 0 10px 0;
  color: var(--primary-color);
`;

const JobDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 10px 0;
  font-size: 0.9em;
  color: #666;
`;

const ApplyButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: var(--primary-color-dark);
  }
`;

function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    type: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const filteredJobs = jobs.filter(job => {
    return (
      (!filters.category || job.category === filters.category) &&
      (!filters.location || job.location === filters.location) &&
      (!filters.type || job.type === filters.type)
    );
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <JobBoardContainer>
      <h1>Job Board</h1>
      <FilterSection>
        <Select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
        >
          <option value="">All Categories</option>
          <option value="construction">Construction</option>
          <option value="renovation">Renovation</option>
          <option value="maintenance">Maintenance</option>
        </Select>

        <Select
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
        >
          <option value="">All Locations</option>
          <option value="remote">Remote</option>
          <option value="onsite">On-site</option>
        </Select>

        <Select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
        >
          <option value="">All Types</option>
          <option value="fulltime">Full-time</option>
          <option value="contract">Contract</option>
          <option value="temporary">Temporary</option>
        </Select>
      </FilterSection>

      <JobList>
        {filteredJobs.map((job) => (
          <JobCard key={job._id}>
            <JobTitle>{job.title}</JobTitle>
            <p>{job.description}</p>
            <JobDetails>
              <span>📍 {job.location}</span>
              <span>💼 {job.type}</span>
              <span>💰 ${job.salary}</span>
            </JobDetails>
            <ApplyButton>Apply Now</ApplyButton>
          </JobCard>
        ))}
      </JobList>
    </JobBoardContainer>
  );
}

export default JobBoard;
