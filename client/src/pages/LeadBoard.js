import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import leadService from '../services/leadService';
import { getLocationDisplay } from '../utils/locationHelpers';
import {
  Box,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';

const BoardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const LeadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const LeadCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

const LeadMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
`;

const LeadBoard = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserLeads = async () => {
      try {
        setLoading(true);
        const response = await leadService.getUserLeads(user.id);
        setLeads(response.leads);
      } catch (err) {
        setError(err.message || 'Error fetching your leads');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserLeads();
    }
  }, [user]);

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await leadService.deleteLead(leadId);
      setLeads(leads.filter(lead => lead._id !== leadId));
    } catch (err) {
      setError(err.message || 'Error deleting lead');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <BoardContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">My Leads</Typography>
        <Button 
          variant="contained" 
          color="primary"
          href="/leads/new"
        >
          Post New Lead
        </Button>
      </Box>

      {leads.length === 0 ? (
        <Alert severity="info">
          You haven't posted any leads yet. Create your first lead to get started!
        </Alert>
      ) : (
        <LeadGrid>
          {leads.map(lead => (
            <LeadCard key={lead._id}>
              <Typography variant="h6">{lead.title}</Typography>
              
              <LeadMeta>
                <Typography variant="body2">
                  {getLocationDisplay(lead.location)}
                </Typography>
              </LeadMeta>

              <LeadMeta>
                <Typography variant="body2">
                  Budget: £{lead.budget?.min?.toLocaleString()} - £{lead.budget?.max?.toLocaleString()}
                </Typography>
              </LeadMeta>

              <Box mt={1} mb={2}>
                <Chip 
                  size="small"
                  label={`${lead.proposals?.length || 0} Proposals`}
                  color="primary"
                  variant="outlined"
                />
                <Chip 
                  size="small"
                  label={lead.status.toUpperCase()}
                  color={lead.status === 'active' ? 'success' : 'default'}
                  sx={{ ml: 1 }}
                />
              </Box>

              <ButtonGroup>
                <Button 
                  variant="outlined"
                  size="small"
                  href={`/leads/${lead._id}`}
                >
                  View Details
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleDeleteLead(lead._id)}
                >
                  Delete
                </Button>
              </ButtonGroup>
            </LeadCard>
          ))}
        </LeadGrid>
      )}
    </BoardContainer>
  );
};

export default LeadBoard;
