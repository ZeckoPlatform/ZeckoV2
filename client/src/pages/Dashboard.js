import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight, FiEye, FiEdit, FiTrash2, FiUser } from 'react-icons/fi';
import api from '../services/api';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';

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
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 0.5rem;
`;

const ProfileLink = styled(Link)`
  display: block;
  padding: 0.5rem 1rem;
  color: #333;
  text-decoration: none;
  
  &:hover {
    background: #f5f5f5;
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

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearch = useCallback(
    debounce(async (term) => {
      if (!term.trim()) {
        fetchJobs(1);
        return;
      }
      
      try {
        setLoading(true);
        const response = await api.get('/jobs/search', {
          params: { 
            term,
            page: currentPage,
            limit: pageSize
          }
        });
        setJobs(response.data.jobs);
        setTotalPages(Math.ceil(response.data.total / pageSize));
      } catch (err) {
        setError('Failed to search jobs');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    [currentPage, pageSize]
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
      const response = await api.get('/jobs/user', {
        params: {
          page,
          limit: pageSize
        }
      });
      setJobs(response.data.jobs);
      setTotalPages(Math.ceil(response.data.total / pageSize));
    } catch (err) {
      setError('Failed to fetch jobs');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
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

  const handleViewJob = (job) => {
    // Implement view functionality
    console.log('View job:', job);
  };

  const handleEditJob = (job) => {
    // Implement edit functionality
    console.log('Edit job:', job);
  };

  const handleDeleteJob = (job) => {
    // Implement delete functionality
    console.log('Delete job:', job);
  };

  return (
    <DashboardContainer>
      <Header>
        <HeaderLeft>
          <h1>Dashboard</h1>
        </HeaderLeft>
        <HeaderRight>
          <PostJobButton to="/post-job">Post New Job</PostJobButton>
          <ProfileButton onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <FiUser />
          </ProfileButton>
          {showProfileMenu && (
            <ProfileDropdown>
              <ProfileLink to="/profile">Profile</ProfileLink>
              <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
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
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {!loading && !error && jobs.length === 0 && (
        <EmptyState>No jobs found</EmptyState>
      )}
      
      {!loading && !error && jobs.length > 0 && (
        <>
          <JobsList>
            {jobs.map(job => (
              <JobCard key={job._id}>
                <JobTitle>{job.title}</JobTitle>
                <JobCompany>{job.company}</JobCompany>
                <JobActions>
                  <ActionButton onClick={() => handleViewJob(job)}>
                    <FiEye />
                  </ActionButton>
                  <ActionButton onClick={() => handleEditJob(job)}>
                    <FiEdit />
                  </ActionButton>
                  <ActionButton onClick={() => handleDeleteJob(job)}>
                    <FiTrash2 />
                  </ActionButton>
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