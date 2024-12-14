import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import api from '../services/api';
import debounce from 'lodash/debounce';
import { useTheme } from '../contexts/ThemeContext';
import ErrorBoundary from '../components/error/ErrorBoundary';
import { withErrorBoundary } from '../components/error/withErrorBoundary';
import { FiChevronLeft, FiChevronRight, FiEye, FiEdit, FiTrash2, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Animation keyframes
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// ProfilePicture component
const ProfilePicture = ({ src, alt, size = '32px' }) => {
  const [imageError, setImageError] = useState(false);

  return imageError ? (
    <UserIconFallback size={size} />
  ) : (
    <ProfileImage
      src={src}
      alt={alt}
      size={size}
      onError={() => setImageError(true)}
    />
  );
};

const UserIconFallback = ({ size = '32px' }) => (
  <svg 
    width={size}
    height={size}
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

// Move useHistoryItem outside the component
const useSearchHistory = (initialHistory = []) => {
  const [searchHistory, setSearchHistory] = useState(initialHistory);

  const addToHistory = (term, field) => {
    const newHistory = [
      { term, field, timestamp: new Date().toISOString() },
      ...searchHistory
    ].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return { searchHistory, addToHistory, clearHistory };
};

const JobsSection = withErrorBoundary(({ jobs, onDelete, onStatusUpdate }) => (
  <JobsGrid>
    {jobs.map(job => (
      <JobCard key={job._id}>
        <StatusIndicator status={job.status}>{job.status}</StatusIndicator>
        <JobTitle>{job.title}</JobTitle>
        <JobDetail>Company: {job.company}</JobDetail>
        <JobDetail>Category: {job.category}</JobDetail>
        <JobDetail>Budget: £{job.budget}</JobDetail>
        <JobDetail>
          Posted: {new Date(job.createdAt).toLocaleDateString()}
        </JobDetail>
        <ButtonGroup>
          <EditButton to={`/edit-job/${job._id}`}>
            Edit
          </EditButton>
          <DeleteButton onClick={() => onDelete(job._id)}>
            Delete
          </DeleteButton>
          <StatusButton onClick={() => onStatusUpdate(job._id)}>
            Update Status
          </StatusButton>
        </ButtonGroup>
      </JobCard>
    ))}
  </JobsGrid>
), {
  fallback: <div>Error loading jobs. Please try again later.</div>
});

const SearchSection = withErrorBoundary(({ 
  searchTerm, 
  searchField, 
  onSearchChange, 
  onFieldChange 
}) => (
  <SearchContainer>
    <SearchForm onSubmit={(e) => e.preventDefault()}>
      <SearchInput
        type="text"
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search jobs..."
      />
      <Select 
        value={searchField}
        onChange={onFieldChange}
      >
        <option value="title">Title</option>
        <option value="company">Company</option>
        <option value="category">Category</option>
        <option value="location">Location</option>
      </Select>
    </SearchForm>

    {searchHistory.length > 0 && (
      <SearchHistoryContainer>
        <SearchHistoryHeader>
          <h4>Recent Searches</h4>
          <ClearButton onClick={clearHistory}>
            Clear History
          </ClearButton>
        </SearchHistoryHeader>
        <SearchHistoryList>
          {searchHistory.map((item, index) => (
            <SearchHistoryItem 
              key={index}
              onClick={() => handleHistoryItemClick(item)}
            >
              <span>{item.term}</span>
              <SearchHistoryMeta>
                {item.field} • {new Date(item.timestamp).toLocaleDateString()}
              </SearchHistoryMeta>
            </SearchHistoryItem>
          ))}
        </SearchHistoryList>
      </SearchHistoryContainer>
    )}
  </SearchContainer>
), {
  fallback: <div>Search functionality is currently unavailable.</div>
});

const Dashboard = () => {
  const { theme, mode } = useTheme();
  
  // State declarations
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('title');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [editingJob, setEditingJob] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // Handler functions
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
            field: searchField,
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
    [searchField, currentPage, pageSize]
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      fetchJobs(page);
    }
  };

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  // Fetch jobs function
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

  // Effects
  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage, pageSize]);

  // Handler for job details
  const handleViewJob = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  // Enhanced pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Enhanced pagination render
  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pages.push(<PageButton key={1} onClick={() => handlePageChange(1)}>1</PageButton>);
      if (startPage > 2) {
        pages.push(<PaginationEllipsis key="ellipsis1">...</PaginationEllipsis>);
      }
    }

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

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<PaginationEllipsis key="ellipsis2">...</PaginationEllipsis>);
      }
      pages.push(
        <PageButton 
          key={totalPages} 
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </PageButton>
      );
    }

    return (
      <Pagination>
        <PageButton 
          onClick={handlePrevPage} 
          disabled={currentPage === 1}
        >
          <FiChevronLeft />
        </PageButton>
        {pages}
        <PageButton 
          onClick={handleNextPage} 
          disabled={currentPage === totalPages}
        >
          <FiChevronRight />
        </PageButton>
      </Pagination>
    );
  };

  // Edit job functionality
  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowEditModal(true);
  };

  const handleUpdateJob = async (updatedData) => {
    try {
      setActionLoading(prev => ({ ...prev, [editingJob._id]: true }));
      
      const response = await api.put(`/jobs/${editingJob._id}`, updatedData);
      
      // Update jobs list with new data
      setJobs(jobs.map(job => 
        job._id === editingJob._id ? response.data : job
      ));
      
      setShowEditModal(false);
      setEditingJob(null);
      toast.success('Job updated successfully');
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error(error.response?.data?.message || 'Failed to update job');
    } finally {
      setActionLoading(prev => ({ ...prev, [editingJob._id]: false }));
    }
  };

  // Delete job functionality
  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      setActionLoading(prev => ({ ...prev, [jobToDelete._id]: true }));
      
      await api.delete(`/jobs/${jobToDelete._id}`);
      
      // Remove job from list
      setJobs(jobs.filter(job => job._id !== jobToDelete._id));
      
      setShowDeleteConfirm(false);
      setJobToDelete(null);
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(error.response?.data?.message || 'Failed to delete job');
    } finally {
      setActionLoading(prev => ({ ...prev, [jobToDelete._id]: false }));
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <HeaderLeft>
          <h1>Dashboard</h1>
        </HeaderLeft>
        <HeaderRight>
          <PostJobButton to="/post-job">Post New Job</PostJobButton>
          <ProfileMenu>
            <ProfileButton onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <UserIcon />
            </ProfileButton>
            {showProfileMenu && (
              <ProfileDropdown>
                <ProfileLink to="/profile">Profile</ProfileLink>
                <ProfileLink to="/settings">Settings</ProfileLink>
                <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
              </ProfileDropdown>
            )}
          </ProfileMenu>
        </HeaderRight>
      </Header>

      <ErrorBoundary>
        <Controls>
          <SearchContainer>
            <SearchForm onSubmit={(e) => e.preventDefault()}>
              <SearchInput
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search jobs..."
              />
              <SearchButton type="submit">Search</SearchButton>
            </SearchForm>
          </SearchContainer>
        </Controls>

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
                  <JobContent>
                    <JobTitle>{job.title}</JobTitle>
                    <JobCompany>{job.company}</JobCompany>
                    <JobLocation>{job.location}</JobLocation>
                    <StatusIndicator status={job.status}>
                      {job.status}
                    </StatusIndicator>
                  </JobContent>
                  <JobActions>
                    <ActionButton 
                      onClick={() => handleViewJob(job)}
                      disabled={actionLoading[job._id]}
                    >
                      <FiEye />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => handleEditJob(job)}
                      disabled={actionLoading[job._id]}
                    >
                      <FiEdit />
                    </ActionButton>
                    <ActionButton 
                      onClick={() => handleDeleteClick(job)}
                      disabled={actionLoading[job._id]}
                    >
                      <FiTrash2 />
                    </ActionButton>
                  </JobActions>
                </JobCard>
              ))}
            </JobsList>
            {renderPagination()}
          </>
        )}
      </ErrorBoundary>

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <Modal onClose={() => setShowJobDetails(false)}>
          <ModalContent>
            <ModalHeader>
              <h2>{selectedJob.title}</h2>
              <CloseButton onClick={() => setShowJobDetails(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <JobDetailRow>
                <Label>Company:</Label>
                <Value>{selectedJob.company}</Value>
              </JobDetailRow>
              <JobDetailRow>
                <Label>Location:</Label>
                <Value>{selectedJob.location}</Value>
              </JobDetailRow>
              <JobDetailRow>
                <Label>Status:</Label>
                <StatusIndicator status={selectedJob.status}>
                  {selectedJob.status}
                </StatusIndicator>
              </JobDetailRow>
              <JobDetailRow>
                <Label>Description:</Label>
                <Value>{selectedJob.description}</Value>
              </JobDetailRow>
              <JobDetailRow>
                <Label>Requirements:</Label>
                <RequirementsList>
                  {selectedJob.requirements.map((req, index) => (
                    <RequirementItem key={index}>{req}</RequirementItem>
                  ))}
                </RequirementsList>
              </JobDetailRow>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => handleEditJob(selectedJob._id)}>
                Edit Job
              </Button>
              <Button secondary onClick={() => setShowJobDetails(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && editingJob && (
        <Modal onClose={() => !actionLoading[editingJob._id] && setShowEditModal(false)}>
          <ModalContent>
            <ModalHeader>
              <h2>Edit Job</h2>
              <CloseButton 
                onClick={() => !actionLoading[editingJob._id] && setShowEditModal(false)}
                disabled={actionLoading[editingJob._id]}
              >
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <JobForm
                initialData={editingJob}
                onSubmit={handleUpdateJob}
                isLoading={actionLoading[editingJob._id]}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && jobToDelete && (
        <Modal onClose={() => !actionLoading[jobToDelete._id] && setShowDeleteConfirm(false)}>
          <ModalContent>
            <ModalHeader>
              <h2>Confirm Delete</h2>
              <CloseButton 
                onClick={() => !actionLoading[jobToDelete._id] && setShowDeleteConfirm(false)}
                disabled={actionLoading[jobToDelete._id]}
              >
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete "{jobToDelete.title}"?</p>
              <p>This action cannot be undone.</p>
            </ModalBody>
            <ModalFooter>
              <Button 
                onClick={handleDeleteConfirm}
                disabled={actionLoading[jobToDelete._id]}
              >
                {actionLoading[jobToDelete._id] ? <LoadingSpinner small /> : 'Delete'}
              </Button>
              <Button 
                secondary
                onClick={() => setShowDeleteConfirm(false)}
                disabled={actionLoading[jobToDelete._id]}
              >
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </DashboardContainer>
  );
};

// Styled components
const DashboardContainer = styled.div`
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const JobCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const JobTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const JobDetail = styled.p`
  margin: 0.5rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const PostJobButton = styled(Link)`
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const EditButton = styled(Link)`
  background: ${({ theme }) => theme.colors.secondary.main};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  text-align: center;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary.dark};
  }
`;

const DeleteButton = styled.button`
  background: ${({ theme }) => theme.colors.error.main};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.error.dark};
  }
`;

const NoJobs = styled.div`
  text-align: center;
  padding: 2rem;
  grid-column: 1 / -1;
  
  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    margin-left: 0.5rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error.main};
  background: ${({ theme }) => theme.colors.error.light};
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 4px;
`;

const StatusIndicator = styled.div`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'open':
        return `
          background: ${theme.colors.success.light};
          color: ${theme.colors.success.main};
        `;
      case 'in-progress':
        return `
          background: ${theme.colors.warning.light};
          color: ${theme.colors.warning.main};
        `;
      case 'completed':
        return `
          background: ${theme.colors.info.light};
          color: ${theme.colors.info.main};
        `;
      case 'cancelled':
        return `
          background: ${theme.colors.error.light};
          color: ${theme.colors.error.main};
        `;
      default:
        return '';
    }
  }}
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 4px;
  background: ${({ active, theme }) => 
    active ? theme.colors.primary.main : 'white'};
  color: ${({ active, theme }) => 
    active ? 'white' : theme.colors.text.primary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.light};
    color: white;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 0.5rem;
  flex: 1;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 4px;
  flex: 1;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const SearchButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
`;

const SearchHistoryContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 4px;
  margin-top: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const SearchHistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};

  h4 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SearchHistoryList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const SearchHistoryItem = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &:hover {
    background: ${({ theme }) => theme.colors.background.light};
  }
`;

const SearchHistoryMeta = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ClearButton = styled.button`
  padding: 0.25rem 0.5rem;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.error.main};
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    text-decoration: underline;
  }
`;

const StatusButton = styled.button`
  background: ${({ theme }) => theme.colors.warning.main};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.warning.dark};
  }
`;

const ProfileMenu = styled.div`
  position: relative;
`;

const ProfileButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
  color: ${({ theme }) => theme.colors.text.primary};
  
  ${({ isOpen }) => isOpen && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      height: 2px;
      background: ${({ theme }) => theme.colors.primary.main};
      animation: ${pulse} 1s ease infinite;
    }
  `}
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ProfileHeader = styled.div`
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
`;

const ProfileName = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ProfileDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  opacity: 0;
  transform: translateY(-10px);
  animation: dropdownAppear 0.3s ease forwards;
`;

const ProfileLink = styled(Link)`
  display: block;
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.light};
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.error.main};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.light};
  }
`;

const ProfileImage = styled.img`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.primary.main};
  transition: all 0.3s ease;
  
  &:hover {
    animation: ${pulse} 1s ease infinite;
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.paper};
    transform: scale(1.1);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalBody = styled.div`
  padding: 1rem;
`;

const ModalFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border.main};
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const JobDetailRow = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
`;

const Value = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RequirementsList = styled.ul`
  margin: 0;
  padding-left: 1.5rem;
`;

const RequirementItem = styled.li`
  margin-bottom: 0.5rem;
`;

const PaginationEllipsis = styled.span`
  padding: 0.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingSpinner = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
  width: ${({ small }) => small ? '16px' : '24px'};
  height: ${({ small }) => small ? '16px' : '24px'};
  animation: spin 1s linear infinite;
  margin: ${({ small }) => small ? '0' : '2rem auto'};

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const JobsList = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

const JobContent = styled.div`
  flex: 1;
`;

const JobCompany = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.25rem;
`;

const JobLocation = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const JobActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background: ${({ theme }) => theme.colors.background.light};
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${({ secondary, theme }) => 
    secondary ? 'white' : theme.colors.primary.main};
  color: ${({ secondary, theme }) => 
    secondary ? theme.colors.text.primary : 'white'};
  border: 1px solid ${({ secondary, theme }) => 
    secondary ? theme.colors.border.main : 'transparent'};

  &:hover {
    background: ${({ secondary, theme }) => 
      secondary ? theme.colors.background.light : theme.colors.primary.dark};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const UserIcon = styled(FiUser)`
  width: 24px;
  height: 24px;
`;

const JobForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export default withErrorBoundary(Dashboard, {
  fallback: <div>Dashboard is currently unavailable. Please try again later.</div>,
  onError: (error, errorInfo) => {
    console.error('Dashboard Error:', error, errorInfo);
  }
});