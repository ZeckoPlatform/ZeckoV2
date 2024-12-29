import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { endpoints } from '../services/api';
import { Button } from '@mui/material';
import styled from 'styled-components';
import DashboardCard from '../components/Dashboard/common/DashboardCard';
import Profile from '../components/Dashboard/Profile';

const DashboardContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const LeadsList = styled.div`
  display: grid;
  gap: 16px;
`;

const LeadItem = styled.div`
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const LeadTitle = styled.h3`
  margin: 0 0 8px 0;
`;

const LeadDetails = styled.div`
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 0.9em;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: #666;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserLeads = async () => {
      try {
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
    navigate('/post-lead');
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

      {/* Profile Section */}
      <Profile />

      {/* User's Leads Section */}
      <DashboardCard>
        <h2>Your Recent Leads</h2>
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
      </DashboardCard>
    </DashboardContainer>
  );
};

export default Dashboard;