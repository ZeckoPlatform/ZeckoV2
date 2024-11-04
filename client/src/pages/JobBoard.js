import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

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

const PostJobButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 20px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const JobForm = styled.form`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
  }
`;

const SubmitButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const JobStatus = styled.div`
  font-size: 0.9em;
  color: #666;
  margin: 10px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const EditButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const DeleteButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #da190b;
  }
`;

function JobBoard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    type: ''
  });
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    type: 'fulltime'
  });
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`/api/jobs/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
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

  const handleJobInputChange = (e) => {
    setNewJob({
      ...newJob,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newJob)
      });

      if (!response.ok) {
        throw new Error('Failed to post job');
      }

      const postedJob = await response.json();
      setJobs([postedJob, ...jobs]);
      setShowPostForm(false);
      setNewJob({
        title: '',
        description: '',
        company: '',
        location: '',
        salary: '',
        type: 'fulltime'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setNewJob({
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: job.type
    });
    setShowPostForm(true);
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/jobs/${editingJob._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newJob)
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      const updatedJob = await response.json();
      setJobs(jobs.map(job => 
        job._id === editingJob._id ? updatedJob : job
      ));
      setShowPostForm(false);
      setEditingJob(null);
      setNewJob({
        title: '',
        description: '',
        company: '',
        location: '',
        salary: '',
        type: 'fulltime'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete job');
        }

        setJobs(jobs.filter(job => job._id !== jobId));
      } catch (err) {
        setError(err.message);
      }
    }
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
      <h1>Lead Board</h1>
      
      {user && (
        <PostJobButton onClick={() => {
          if (!showPostForm) {
            setEditingJob(null);
            setNewJob({
              title: '',
              description: '',
              company: '',
              location: '',
              salary: '',
              type: 'fulltime'
            });
          }
          setShowPostForm(!showPostForm);
        }}>
          {showPostForm ? 'Cancel' : editingJob ? 'Cancel Edit' : 'Post a Lead'}
        </PostJobButton>
      )}

      {showPostForm && (
        <JobForm onSubmit={editingJob ? handleUpdateJob : handleSubmitJob}>
          <FormGroup>
            <Label htmlFor="title">Lead Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={newJob.title}
              onChange={handleJobInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              value={newJob.description}
              onChange={handleJobInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="company">Company</Label>
            <Input
              type="text"
              id="company"
              name="company"
              value={newJob.company}
              onChange={handleJobInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              name="location"
              value={newJob.location}
              onChange={handleJobInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="salary">Salary</Label>
            <Input
              type="number"
              id="salary"
              name="salary"
              value={newJob.salary}
              onChange={handleJobInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="type">Job Type</Label>
            <Select
              id="type"
              name="type"
              value={newJob.type}
              onChange={handleJobInputChange}
              required
            >
              <option value="fulltime">Full-time</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
            </Select>
          </FormGroup>

          <SubmitButton type="submit">
            {editingJob ? 'Update Lead' : 'Post Lead'}
          </SubmitButton>
        </JobForm>
      )}

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
              <span>🏢 {job.company}</span>
              <span>📍 {job.location}</span>
              <span>💼 {job.type}</span>
              <span>💰 ${job.salary}</span>
            </JobDetails>
            <JobStatus>Posted: {new Date(job.createdAt).toLocaleDateString()}</JobStatus>
            <ButtonGroup>
              <EditButton onClick={() => handleEditJob(job)}>
                Edit Lead
              </EditButton>
              <DeleteButton onClick={() => handleDeleteJob(job._id)}>
                Delete Lead
              </DeleteButton>
            </ButtonGroup>
          </JobCard>
        ))}
      </JobList>
    </JobBoardContainer>
  );
}

export default JobBoard;
