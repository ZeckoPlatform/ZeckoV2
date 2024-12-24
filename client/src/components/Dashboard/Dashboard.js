import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { fetchData, endpoints } from '../../services/api';
import styled from 'styled-components';
import { Avatar, Typography, Box } from '@mui/material';
import LeadCard from '../LeadCard';

const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: ${({ theme }) => theme?.colors?.background?.paper || '#F5F5F5'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#333333'};
  min-height: calc(100vh - 64px);
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  background: ${({ theme }) => theme?.colors?.primary?.main || '#2962ff'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;

  &:hover {
    background: ${({ theme }) => theme?.colors?.primary?.dark || '#1a45b0'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const Section = styled.section`
  margin-bottom: 30px;
  background: ${({ theme }) => theme?.colors?.background?.paper || '#F5F5F5'};
  padding: 20px;
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
  box-shadow: ${({ theme }) => theme?.shadows?.card || '0 2px 4px rgba(0,0,0,0.1)'};

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.2em;
`;

const JobsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const JobItem = styled.div`
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  
  h3 {
    margin: 0 0 10px 0;
    color: ${({ theme }) => theme?.colors?.primary?.main || '#2962ff'};
  }

  .job-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 10px;
    font-size: 0.9em;
    color: ${({ theme }) => theme?.colors?.text?.secondary || '#666'};
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
`;

const ProfileSummarySection = styled(Section)`
  padding: 20px;
  margin-bottom: 20px;
`;

const ProfileSummary = () => {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const defaultAvatar = '/default-avatar.png';

  // Normalize account type
  const normalizeAccountType = (type) => {
    if (!type) return 'Regular';
    
    // Define valid account types
    const ACCOUNT_TYPES = {
      REGULAR: 'Regular',
      VENDOR: 'Vendor',
      ADMIN: 'Admin'
    };

    // Convert to uppercase for consistent comparison
    const normalizedType = type.toUpperCase();
    
    switch (normalizedType) {
      case 'REGULAR':
        return ACCOUNT_TYPES.REGULAR;
      case 'VENDOR':
        return ACCOUNT_TYPES.VENDOR;
      case 'ADMIN':
        return ACCOUNT_TYPES.ADMIN;
      default:
        console.warn(`Unknown account type: ${type}, defaulting to Regular`);
        return ACCOUNT_TYPES.REGULAR;
    }
  };

  return (
    <ProfileSummarySection>
      <div className="section-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Avatar
            src={(!imgError && user?.avatarUrl) ? user.avatarUrl : defaultAvatar}
            onError={() => setImgError(true)}
            sx={{ 
              width: 50, 
              height: 50,
              border: '2px solid #f0f0f0'
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {user?.name || user?.username?.split('@')[0] || 'User'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Account Type: {normalizeAccountType(user?.accountType)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </div>
    </ProfileSummarySection>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [data, setData] = useState({
    jobs: [],
    products: [],
    orders: [],
    business: null,
    addresses: [],
    cart: null,
    leads: []
  });
  const [loading, setLoading] = useState({
    jobs: true,
    products: true,
    orders: true,
    business: true,
    addresses: true,
    cart: true,
    leads: true
  });

  const loadData = useCallback(async (key, endpoint) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const { data: responseData, error } = await fetchData(endpoint);
      if (error) {
        showNotification(`Failed to load ${key}: ${error}`, 'error');
      } else {
        setData(prev => ({ ...prev, [key]: responseData }));
      }
    } catch (err) {
      showNotification(`Error loading ${key}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [showNotification]);

  useEffect(() => {
    if (user?._id) {
      loadData('leads', endpoints.leads.list);
      loadData('jobs', endpoints.jobs.user(user._id));
      loadData('products', endpoints.products.list({}));
      loadData('orders', endpoints.orders.user);
      loadData('business', endpoints.business);
      loadData('addresses', endpoints.users.addresses);
      loadData('cart', endpoints.cart);
    }
  }, [user, loadData]);

  if (!user) {
    return <LoadingContainer>Please log in to view your dashboard</LoadingContainer>;
  }

  if (Object.values(loading).every(Boolean)) {
    return <LoadingContainer>Loading dashboard...</LoadingContainer>;
  }

  return (
    <DashboardContainer>
      <ProfileSummary />
      <ActionButton onClick={() => navigate('/post-lead')}>
        Post a Lead
      </ActionButton>

      {/* Recent Leads Section */}
      <Section>
        <div className="section-header">
          <h2>Recent Leads</h2>
        </div>
        {loading.leads ? (
          <p>Loading leads...</p>
        ) : data.leads?.length > 0 ? (
          <JobsList>
            {data.leads.map(lead => (
              <LeadCard key={lead._id} lead={lead} />
            ))}
          </JobsList>
        ) : (
          <p>No leads found</p>
        )}
      </Section>

      {/* Jobs Section */}
      <Section>
        <div className="section-header">
          <h2>Your Jobs</h2>
          <ActionButton onClick={() => navigate('/post-job')}>
            Post a New Job
          </ActionButton>
        </div>
        {loading.jobs ? (
          <p>Loading jobs...</p>
        ) : data.jobs?.length > 0 ? (
          <JobsList>
            {data.jobs.map(job => (
              <JobItem key={job._id}>
                <h3>{job.title}</h3>
                <p>{job.description}</p>
                <div className="job-details">
                  {job.budget && <span>Budget: ${job.budget}</span>}
                  {job.deadline && (
                    <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  )}
                  {job.location && <span>Location: {job.location}</span>}
                </div>
              </JobItem>
            ))}
          </JobsList>
        ) : (
          <p>No jobs found. Click "Post a New Job" to get started!</p>
        )}
      </Section>

      {/* Products Section */}
      <Section>
        <div className="section-header">
          <h2>Products</h2>
        </div>
        {loading.products ? (
          <p>Loading products...</p>
        ) : data.products?.length > 0 ? (
          <ProductGrid>
            {data.products.map(product => (
              <ProductCard key={product._id}>
                <h3>{product.name}</h3>
                <p>{product.price}</p>
              </ProductCard>
            ))}
          </ProductGrid>
        ) : (
          <p>No products found</p>
        )}
      </Section>
    </DashboardContainer>
  );
};

export default Dashboard; 