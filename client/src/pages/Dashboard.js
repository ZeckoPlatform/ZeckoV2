import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight, FiEye, FiEdit, FiTrash2, FiUser, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pageSize = 10;
  const navigate = useNavigate();

  const fetchJobs = async (page) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getUserJobs({ page, limit: pageSize });
      
      if (response.data && Array.isArray(response.data.jobs)) {
        setJobs(response.data.jobs);
        setTotalPages(Math.ceil(response.data.total / pageSize));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError({
        message: 'Failed to load jobs',
        details: err.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  const handleSearch = useCallback(
    debounce(async (term) => {
      if (term) {
        try {
          const response = await api.searchJobs({ term });
          setJobs(response.data.jobs);
        } catch (err) {
          console.error('Search error:', err);
        }
      } else {
        fetchJobs(currentPage);
      }
    }, 500),
    []
  );

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleEditJob = (jobId) => {
    navigate(`/jobs/edit/${jobId}`);
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await api.deleteJob(jobId);
        toast.success('Job deleted successfully');
        fetchJobs(currentPage);
      } catch (err) {
        toast.error('Failed to delete job');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderActionButton = (job, label, icon, handler) => (
    <ActionButton
      onClick={() => handler(job._id)}
      title={label}
    >
      {icon}
    </ActionButton>
  );

  const renderPagination = () => (
    <Pagination>
      <PaginationButton 
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
      >
        <FiChevronLeft />
      </PaginationButton>
      <PageInfo>Page {currentPage} of {totalPages}</PageInfo>
      <PaginationButton 
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
      >
        <FiChevronRight />
      </PaginationButton>
    </Pagination>
  );

  return (
    <DashboardContainer>
      <Header>
        <HeaderLeft>
          <h1>My Jobs</h1>
        </HeaderLeft>
        <HeaderRight>
          <PostJobButton to="/jobs/new">Post New Job</PostJobButton>
          <ProfileButton onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <FiUser />
          </ProfileButton>
          {showProfileMenu && (
            <ProfileDropdown>
              <ProfileLink to="/profile">
                <FiUser /> Profile
              </ProfileLink>
              <LogoutButton onClick={handleLogout}>
                Logout
              </LogoutButton>
            </ProfileDropdown>
          )}
        </HeaderRight>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Search jobs..."
        />
      </SearchContainer>

      {loading && <LoadingSpinner />}
      
      {error && (
        <ErrorContainer>
          <ErrorMessage>
            <h4>{error.message}</h4>
            <p>{error.details}</p>
            <RetryButton onClick={() => fetchJobs(currentPage)}>
              <FiRefreshCw /> Retry
            </RetryButton>
          </ErrorMessage>
        </ErrorContainer>
      )}
      
      {!loading && !error && jobs.length === 0 && (
        <EmptyState>
          <p>No jobs found. Post your first job!</p>
          <PostJobButton to="/jobs/new">Post a Job</PostJobButton>
        </EmptyState>
      )}
      
      {!loading && !error && jobs.length > 0 && (
        <>
          <JobsList>
            {jobs.map(job => (
              <JobCard key={job._id}>
                <JobContent>
                  <JobTitle>{job.title}</JobTitle>
                  <JobCompany>{job.company}</JobCompany>
                  <JobStatus status={job.status}>
                    {job.status || 'Active'}
                  </JobStatus>
                </JobContent>
                <JobActions>
                  {renderActionButton(job, 'View', <FiEye />, handleViewJob)}
                  {renderActionButton(job, 'Edit', <FiEdit />, handleEditJob)}
                  {renderActionButton(job, 'Delete', <FiTrash2 />, handleDeleteJob)}
                </JobActions>
              </JobCard>
            ))}
          </JobsList>
          {renderPagination()}
        </>
      )}
    </DashboardContainer>
  );
};

// Styled components (keep all the original styling)
const DashboardContainer = styled.div`
  padding: 2rem;
`;

// ... (keep all other styled components exactly as they were)

export default Dashboard;