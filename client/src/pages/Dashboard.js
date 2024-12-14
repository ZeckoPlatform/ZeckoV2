import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import api from '../services/api';
import debounce from 'lodash/debounce';
import { useTheme } from '../contexts/ThemeContext';

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

const Dashboard = () => {
  const { theme, mode, setMode } = useTheme();
  const [userJobs, setUserJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('title');
  const { searchHistory, addToHistory, clearHistory } = useSearchHistory(
    JSON.parse(localStorage.getItem('searchHistory') || '[]')
  );
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileData, setProfileData] = useState({
    profilePicture: null,
    username: ''
  });

  useEffect(() => {
    fetchUserJobs();
    fetchProfileData();
  }, [sortBy, filterStatus]);

  const debouncedSearch = useCallback(
    debounce((term, field) => {
      if (term.length >= 2) {
        fetchUserJobs();
        addToHistory(term, field);
      }
    }, 500),
    [searchHistory]
  );

  const handleSearchChange = (e) => {
    const newTerm = e.target.value;
    setSearchTerm(newTerm);
    debouncedSearch(newTerm, searchField);
  };

  const handleHistoryItemClick = (item) => {
    setSearchTerm(item.term);
    setSearchField(item.field);
    fetchUserJobs();
  };

  const fetchUserJobs = async () => {
    try {
      const response = await api.get('/jobs/user', {
        params: {
          sort: sortBy,
          status: filterStatus,
          search: searchTerm,
          searchField: searchField
        }
      });
      setUserJobs(response.data);
    } catch (err) {
      setError('Failed to fetch your jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await api.delete(`/jobs/${jobId}`);
        setUserJobs(userJobs.filter(job => job._id !== jobId));
      } catch (err) {
        setError('Failed to delete job');
        console.error('Error deleting job:', err);
      }
    }
  };

  const handleStatusUpdate = async (jobId) => {
    try {
      const newStatus = prompt('Enter new status (open/in-progress/completed/cancelled):');
      if (!newStatus) return;

      await api.patch(`/jobs/${jobId}/status`, { status: newStatus });
      fetchUserJobs();
    } catch (err) {
      setError('Failed to update job status');
      console.error('Error updating status:', err);
    }
  };

  // Get current jobs for pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = userJobs.slice(indexOfFirstJob, indexOfLastJob);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Add any other cleanup needed
    window.location.href = '/login';
  };

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfileData(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardContainer>
      <Header>
        <HeaderLeft>
          <h1>Dashboard</h1>
        </HeaderLeft>
        <HeaderRight>
          <ThemeToggle onClick={toggleTheme}>
            {mode === 'light' ? '🌙' : '☀️'}
          </ThemeToggle>
          <PostJobButton to="/post-job">Post New Job</PostJobButton>
          <ProfileMenu>
            <ProfileButton 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              isOpen={showProfileMenu}
            >
              <ProfilePicture 
                src={profileData.profilePicture} 
                alt={profileData.username}
              />
            </ProfileButton>
            {showProfileMenu && (
              <ProfileDropdown>
                <ProfileHeader>
                  <ProfilePicture 
                    src={profileData.profilePicture} 
                    alt={profileData.username}
                    size="48px"
                  />
                  <ProfileName>{profileData.username}</ProfileName>
                </ProfileHeader>
                <ProfileLink to="/profile">Profile</ProfileLink>
                <ProfileLink to="/settings">Settings</ProfileLink>
                <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
              </ProfileDropdown>
            )}
          </ProfileMenu>
        </HeaderRight>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Controls>
        <SearchContainer>
          <SearchForm onSubmit={(e) => e.preventDefault()}>
            <SearchInput
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search jobs..."
            />
            <Select 
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
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

        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Sort by Date</option>
          <option value="budget">Sort by Budget</option>
          <option value="deadline">Sort by Deadline</option>
        </Select>

        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </Controls>

      <Section>
        <h2>Your Posted Jobs</h2>
        <JobsGrid>
          {currentJobs.map(job => (
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
                <DeleteButton onClick={() => handleDelete(job._id)}>
                  Delete
                </DeleteButton>
                <StatusButton onClick={() => handleStatusUpdate(job._id)}>
                  Update Status
                </StatusButton>
              </ButtonGroup>
            </JobCard>
          ))}
        </JobsGrid>

        <Pagination>
          {Array.from({ length: Math.ceil(userJobs.length / jobsPerPage) }).map((_, index) => (
            <PageButton
              key={index}
              active={currentPage === index + 1}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </PageButton>
          ))}
        </Pagination>
      </Section>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
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
  background: ${({ active, theme }) => active ? theme.colors.primary.main : 'white'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.primary};
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

export default Dashboard;