import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight, FiEye, FiEdit, FiTrash2, FiUser, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';
import { useTheme } from '../contexts/ThemeContext';

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const HeaderLeft = styled.div``;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PostJobButton = styled(Link)`
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border-radius: 4px;
  text-decoration: none;
`;

const ProfileButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
`;

const ProfileDropdown = styled.div`
  position: absolute;
  right: 2rem;
  top: 4rem;
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 0.5rem;
  z-index: 1000;
`;

const ProfileLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  width: 100%;
  
  &:hover {
    background: ${props => props.theme.colors.backgroundHover};
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  color: #dc3545;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  padding: 1rem;
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
`;

const JobsList = styled.div`
  display: grid;
  gap: 1rem;
`;

const JobCard = styled.div`
  padding: 1rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const JobTitle = styled.h3`
  margin: 0;
`;

const JobCompany = styled.div`
  color: #6c757d;
`;

const JobActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  color: #6c757d;
  
  &:hover {
    color: #007bff;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  border-radius: 4px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OfflineBanner = styled.div`
  background: ${props => props.theme.colors.warning};
  color: white;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  
  small {
    opacity: 0.8;
    margin-top: 0.25rem;
  }
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const ErrorContainer = styled.div`
  margin: 1rem 0;
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  color: ${props => props.theme.colors.text};
  
  &:hover {
    background: ${props => props.theme.colors.backgroundHover};
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.secondary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.secondaryDark};
  }
`;

const JobStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background: ${props => 
    props.status === 'Active' ? props.theme.colors.success :
    props.status === 'Pending' ? props.theme.colors.warning :
    props.status === 'Closed' ? props.theme.colors.danger :
    props.theme.colors.secondary};
  color: white;
`;

const JobContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [actionLoading, setActionLoading] = useState({});
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState(null);
  const MAX_RETRIES = 3;

  // Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Back online! Refreshing data...');
      fetchJobs(currentPage);
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning('You are offline. Some features may be limited.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for new job posted and refresh list
  useEffect(() => {
    if (location.state?.jobPosted) {
      fetchJobs(1);
      toast.success('Job posted successfully!');
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const handleSearch = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        fetchJobs(1);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await api.get('/jobs/search', {
          params: { 
            term,
            page: currentPage,
            limit: pageSize
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.jobs) {
          setJobs(response.data.jobs);
          setTotalPages(Math.ceil(response.data.total / pageSize));
        } else {
          setJobs([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Search error:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Search failed. Please try again.');
          toast.error('Search failed');
        }
      } finally {
        setLoading(false);
      }
    }, 300),
    [currentPage, pageSize, navigate]
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      fetchJobs(page);
    }
  };

  const fetchJobs = async (page) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await api.get('/jobs/user', {
        params: { 
          page, 
          limit: pageSize 
        },
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });

      console.log('API Response:', response.data);

      if (response.data && Array.isArray(response.data.jobs)) {
        setJobs(response.data.jobs);
        setTotalPages(Math.ceil(response.data.total / pageSize));
      } else {
        setJobs([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      
      if (err.response?.status === 404) {
        toast.error('Jobs endpoint not found. Please check API configuration.');
        setError({
          message: 'API endpoint not found',
          details: 'The jobs endpoint is not available',
          code: 404
        });
      } else {
        handleApiError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PageButton
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </PageButton>
      );
    }

    return (
      <Pagination>
        <PageButton 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FiChevronLeft />
        </PageButton>
        {pages}
        <PageButton 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FiChevronRight />
        </PageButton>
      </Pagination>
    );
  };

  const handleAction = async (actionType, jobId, action) => {
    setActionLoading(prev => ({ ...prev, [jobId]: actionType }));
    try {
      await action();
      toast.success(`${actionType} successful`);
    } catch (err) {
      console.error(`${actionType} error:`, err);
      toast.error(
        <div>
          <strong>{`${actionType} failed`}</strong>
          <p>{err.response?.data?.message || 'Please try again'}</p>
        </div>
      );
    } finally {
      setActionLoading(prev => ({ ...prev, [jobId]: null }));
    }
  };

  const handleViewJob = (job) => {
    handleAction('View', job._id, async () => {
      // View logic here
    });
  };

  const handleEditJob = (job) => {
    handleAction('Edit', job._id, async () => {
      // Edit logic here
    });
  };

  const handleDeleteJob = (job) => {
    handleAction('Delete', job._id, async () => {
      // Delete logic here
    });
  };

  // Render loading states in buttons
  const renderActionButton = (job, type, icon, handler) => (
    <ActionButton 
      onClick={() => handler(job)}
      disabled={actionLoading[job._id]}
    >
      {actionLoading[job._id] === type ? (
        <LoadingSpinner small />
      ) : icon}
    </ActionButton>
  );

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    navigate('/profile'); // Direct navigation to profile page
  };

  // Add manual refresh functionality
  const handleRefresh = () => {
    fetchJobs(currentPage);
    toast.info('Refreshing job list...');
  };

  return (
    <DashboardContainer>
      {isOffline && (
        <OfflineBanner>
          You are currently offline. Some features may be limited.
          {lastSuccessfulFetch && (
            <small>Last updated: {new Date(lastSuccessfulFetch).toLocaleString()}</small>
          )}
        </OfflineBanner>
      )}
      
      <Header>
        <HeaderLeft>
          <h1>Dashboard</h1>
        </HeaderLeft>
        <HeaderRight>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw /> Refresh
          </RefreshButton>
          <PostJobButton to="/jobs/new">Post New Job</PostJobButton>
          <ProfileButton onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <FiUser />
          </ProfileButton>
          {showProfileMenu && (
            <ProfileDropdown>
              <ProfileLink to="/profile">
                <FiUser /> Profile
              </ProfileLink>
              <MenuButton onClick={handleLogout}>
                Logout
              </MenuButton>
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
            {error.code && <small>Error code: {error.code}</small>}
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

export default Dashboard;