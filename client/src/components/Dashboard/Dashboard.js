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

  // Simple account type display - no complex logic
  const displayAccountType = user?.accountType || 'Regular';

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
              Account Type: {displayAccountType}
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
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserLeads = async () => {
      try {
        // Update this to fetch only user's leads
        const response = await api.get(`${endpoints.leads.list}?userId=${user.id}`);
        setLeads(response.data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      }
    };

    if (user) {
      fetchUserLeads();
    }
  }, [user]);

  const handlePostLead = () => {
    navigate('/post-lead'); // Update this to the correct path
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h1>Dashboard</h1>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handlePostLead}
        >
          Post Lead
        </Button>
      </DashboardHeader>

      {/* Recent Leads Section */}
      <DashboardCard>
        <CardHeader>
          <h2>Your Recent Leads</h2>
        </CardHeader>
        <CardContent>
          {leads.length > 0 ? (
            <LeadsList>
              {leads.map((lead) => (
                <LeadItem key={lead._id}>
                  <LeadTitle>{lead.title}</LeadTitle>
                  <LeadDetails>
                    <span>{lead.category}</span>
                    <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                    <span>{lead.status}</span>
                  </LeadDetails>
                </LeadItem>
              ))}
            </LeadsList>
          ) : (
            <EmptyState>
              No leads posted yet. Click "Post Lead" to create your first lead.
            </EmptyState>
          )}
        </CardContent>
      </DashboardCard>
      
      {/* ... rest of your dashboard components ... */}
    </DashboardContainer>
  );
};

export default Dashboard; 