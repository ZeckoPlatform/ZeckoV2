import React from 'react';
import styled from 'styled-components';
import { Card, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { LocationOn, AccessTime, MonetizationOn, Bookmark, BookmarkBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const StyledCard = styled(Card)`
  margin: 1rem 0;
  padding: 1.5rem;
  transition: transform 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`;

const LeadHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 1rem 0;
`;

const MetaData = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LeadCard = ({ lead }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saved, setSaved] = React.useState(lead.saved);

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      const response = await api.post(`/leads/${lead._id}/save`);
      setSaved(response.data.saved);
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  const formatBudget = (budget) => {
    return `$${budget.min.toLocaleString()} - $${budget.max.toLocaleString()}`;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <StyledCard onClick={() => navigate(`/leads/${lead._id}`)}>
      <LeadHeader>
        <div>
          <Title>{lead.title}</Title>
          <Chip 
            size="small" 
            label={lead.category.name} 
            style={{ marginTop: '0.5rem' }}
          />
        </div>
        <Tooltip title={saved ? "Remove from saved" : "Save lead"}>
          <IconButton onClick={handleSave}>
            {saved ? <Bookmark color="primary" /> : <BookmarkBorder />}
          </IconButton>
        </Tooltip>
      </LeadHeader>

      <Description>{lead.description}</Description>

      <MetaData>
        <MetaItem>
          <LocationOn fontSize="small" />
          {lead.location.city}, {lead.location.state}
        </MetaItem>
        <MetaItem>
          <MonetizationOn fontSize="small" />
          {formatBudget(lead.budget)}
        </MetaItem>
        <MetaItem>
          <AccessTime fontSize="small" />
          {getTimeAgo(lead.createdAt)}
        </MetaItem>
      </MetaData>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Chip 
            size="small" 
            label={`${lead.proposals.length} proposals`}
            style={{ marginRight: '0.5rem' }}
          />
          <Chip 
            size="small" 
            label={`${lead.views.length} views`}
          />
        </div>
        <Button 
          variant="contained" 
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/leads/${lead._id}/propose`);
          }}
        >
          Submit Proposal
        </Button>
      </div>
    </StyledCard>
  );
};

export default LeadCard; 