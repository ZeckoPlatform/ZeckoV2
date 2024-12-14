import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight, FiEye, FiEdit, FiTrash2, FiUser, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
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

const PostLeadButton = styled(Link)`
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border-radius: 4px;
  text-decoration: none;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const ProfileButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: ${props => props.theme.colors.text};
`;

const ProfileDropdown = styled.div`
  position: absolute;
  right: 2rem;
  top: 4rem;
  background: white;
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
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: ${props => props.theme.colors.danger};
  cursor: pointer;
  text-align: left;
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ErrorContainer = styled.div`
  padding: 1rem;
  background: ${props => props.theme.colors.danger}10;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
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
  margin-top: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.textLight};
`;

const LeadsList = styled.div`
  display: grid;
  gap: 1rem;
`;

const LeadCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const LeadContent = styled.div`
  flex: 1;
`;

const LeadTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const LeadCompany = styled.p`
  margin: 0.5rem 0;
  color: ${props => props.theme.colors.textLight};
`;

const LeadStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background: ${props => 
    props.status === 'active' ? props.theme.colors.success + '20' :
    props.status === 'closed' ? props.theme.colors.danger + '20' :
    props.theme.colors.warning + '20'
  };
  color: ${props => 
    props.status === 'active' ? props.theme.colors.success :
    props.status === 'closed' ? props.theme.colors.danger :
    props.theme.colors.warning
  };
`;

const LeadActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  
  &:disabled {
    color: ${props => props.theme.colors.textLight};
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: ${props => props.theme.colors.text};
`;

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pageSize = 10;
  const navigate = useNavigate();

  const fetchLeads = async (page) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getLeads({ 
        page, 
        limit: pageSize,
        userId: localStorage.getItem('userId') // Add user filter
      });
      
      if (response.data && Array.isArray(response.data.leads)) {
        setLeads(response.data.leads);
        setTotalPages(Math.ceil(response.data.total / pageSize));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError({
        message: 'Failed to load leads',
        details: err.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage]);

  const handleSearch = useCallback(
    debounce(async (term) => {
      if (term) {
        try {
          const response = await api.searchLeads({ term });
          setLeads(response.data.leads);
        } catch (err) {
          console.error('Search error:', err);
        }
      } else {
        fetchLeads(currentPage);
      }
    }, 500),
    []
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleViewLead = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  const handleEditLead = (leadId) => {
    navigate(`/leads/edit/${leadId}`);
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.deleteLead(leadId);
        toast.success('Lead deleted successfully');
        fetchLeads(currentPage);
      } catch (err) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const renderActionButton = (lead, label, icon, handler) => (
    <ActionButton
      onClick={() => handler(lead._id)}
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
      <PageInfo>
        Page {currentPage} of {totalPages}
      </PageInfo>
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
          <h1>Dashboard</h1>
        </HeaderLeft>
        <HeaderRight>
          <PostLeadButton to="/leads/new">Post New Lead</PostLeadButton>
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
          placeholder="Search leads..."
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(e.target.value);
          }}
          value={searchTerm}
        />
      </SearchContainer>

      {loading && <LoadingSpinner />}
      
      {error && (
        <ErrorContainer>
          <ErrorMessage>
            <h4>{error.message}</h4>
            <p>{error.details}</p>
            <RetryButton onClick={() => fetchLeads(currentPage)}>
              <FiRefreshCw /> Retry
            </RetryButton>
          </ErrorMessage>
        </ErrorContainer>
      )}
      
      {!loading && !error && leads.length === 0 && (
        <EmptyState>
          <p>No leads found. Create your first lead!</p>
          <PostLeadButton to="/leads/new">Create Lead</PostLeadButton>
        </EmptyState>
      )}
      
      {!loading && !error && leads.length > 0 && (
        <AnimatePresence>
          <LeadsList>
            {leads.map(lead => (
              <LeadCard
                key={lead._id}
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <LeadContent>
                  <LeadTitle>{lead.title}</LeadTitle>
                  <LeadCompany>{lead.company}</LeadCompany>
                  <LeadStatus status={lead.status}>
                    {lead.status || 'Active'}
                  </LeadStatus>
                </LeadContent>
                <LeadActions>
                  {renderActionButton(lead, 'View', <FiEye />, handleViewLead)}
                  {renderActionButton(lead, 'Edit', <FiEdit />, handleEditLead)}
                  {renderActionButton(lead, 'Delete', <FiTrash2 />, handleDeleteLead)}
                </LeadActions>
              </LeadCard>
            ))}
          </LeadsList>
          {renderPagination()}
        </AnimatePresence>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;