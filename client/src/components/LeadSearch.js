import React, { useState, useEffect, lazy } from 'react';

// Lazy load components that aren't immediately visible
const JobList = lazy(() => import('./JobList'));
const Pagination = lazy(() => import('./common/Pagination'));

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

      <React.Suspense fallback={<div>Loading...</div>}>
        {jobs.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          <JobList jobs={jobs} onApply={handleApply} />
        )}

        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          hasMore={jobs.length >= jobsPerPage}
        />
      </React.Suspense>
    </div>
  );
}

export default JobSearch;
