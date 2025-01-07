import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { endpoints } from '../services/api';
import { Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import styled from 'styled-components';
import DashboardCard from '../components/Dashboard/common/DashboardCard';

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
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LeadContent = styled.div`
  flex-grow: 1;
`;

const LeadTitle = styled.h3`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const LeadDetails = styled.div`
  display: flex;
  gap: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9em;
`;

const LeadActions = styled.div`
  display: flex;
  gap: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        if (!user?._id) return;
        
        const response = await api.get(endpoints.leads.list, {
          params: {
            userId: user._id
          }
        });
        setLeads(response.data);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [user]);

  const handlePostLead = () => {
    navigate('/post-lead');
  };

  const handleEditLead = (leadId) => {
    navigate(`/edit-lead/${leadId}`);
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`${endpoints.leads.delete}/${leadId}`);
        fetchUserLeads(); // Refresh the leads list
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h1>My Leads</h1>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handlePostLead}
        >
          Post Lead
        </Button>
      </DashboardHeader>

      <DashboardCard>
        {loading ? (
          <p>Loading leads...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : leads.length > 0 ? (
          <LeadsList>
            {leads.map((lead) => (
              <LeadItem key={lead._id}>
                <LeadContent>
                  <LeadTitle>{lead.title}</LeadTitle>
                  <LeadDetails>
                    <span>Category: {lead.category}</span>
                    <span>Budget: £{lead.budget}</span>
                    <span>Posted: {new Date(lead.createdAt).toLocaleDateString()}</span>
                    <span>Status: {lead.status}</span>
                  </LeadDetails>
                </LeadContent>
                <LeadActions>
                  <IconButton 
                    onClick={() => handleEditLead(lead._id)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteLead(lead._id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </LeadActions>
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