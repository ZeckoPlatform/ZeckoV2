import React, { useState, useEffect } from 'react';

function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);

  useEffect(() => {
    fetchJobs();
  }, [currentPage]);

  const fetchJobs = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/jobs/search?page=${currentPage}&limit=${jobsPerPage}&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const jobsData = await response.json();
        setJobs(jobsData);
      } else {
        throw new Error('Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleApply = async (jobId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Application submitted successfully!');
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div>
      <h3>Job Search</h3>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for jobs..."
        />
        <button type="submit">Search</button>
      </form>

      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job._id}>
              <h4>{job.title}</h4>
              <p>{job.description}</p>
              <p>Budget: ${job.budget}</p>
              <p>Posted by: {job.postedBy.username}</p>
              <button onClick={() => handleApply(job._id)}>Apply</button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Previous Page
        </button>
        <span>Page {currentPage}</span>
        <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={jobs.length < jobsPerPage}>
          Next Page
        </button>
      </div>
    </div>
  );
}

export default JobSearch;
