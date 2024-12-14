import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight, FiEye, FiEdit, FiTrash2, FiUser } from 'react-icons/fi';
import api from '../services/api';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';

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

// Styled components
const DashboardContainer = styled.div`
  padding: 2rem;
`;

// ... rest of styled components ...

export default Dashboard;