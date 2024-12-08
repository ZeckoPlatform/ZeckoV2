import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Button, 
  CircularProgress, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { LocationOn, MonetizationOn, Person, Description } from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const DetailContainer = styled(Paper)`
  padding: 2rem;
  margin: 2rem auto;
  max-width: 800px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MetaData = styled.div`
  display: flex;
  gap: 2rem;
  margin: 1.5rem 0;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Section = styled.div`
  margin: 2rem 0;
`;

const RequirementsList = styled(List)`
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      const response = await api.get(`/leads/${id}`);
      setLead(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <div>Error: {error}</div>;
  if (!lead) return <div>Lead not found</div>;

  return (
    <DetailContainer>
      <Header>
        <div>
          <Title>{lead.title}</Title>
          <Chip 
            label={lead.category.name} 
            style={{ marginTop: '1rem' }}
          />
        </div>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate(`/leads/${id}/propose`)}
        >
          Submit Proposal
        </Button>
      </Header>

      <MetaData>
        <MetaItem>
          <LocationOn />
          {lead.location.city}, {lead.location.state}
        </MetaItem>
        <MetaItem>
          <MonetizationOn />
          ${lead.budget.min.toLocaleString()} - ${lead.budget.max.toLocaleString()}
        </MetaItem>
        <MetaItem>
          <Person />
          {lead.proposals.length} proposals
        </MetaItem>
      </MetaData>

      <Divider />

      <Section>
        <h3>Description</h3>
        <Description>{lead.description}</Description>
      </Section>

      <Section>
        <h3>Requirements</h3>
        <RequirementsList>
          {lead.requirements.map((req, index) => (
            <ListItem key={index}>
              <ListItemText 
                primary={req.question}
                secondary={req.answer}
              />
            </ListItem>
          ))}
        </RequirementsList>
      </Section>

      {lead.attachments.length > 0 && (
        <Section>
          <h3>Attachments</h3>
          <List>
            {lead.attachments.map((attachment, index) => (
              <ListItem 
                key={index}
                button 
                component="a" 
                href={attachment.url}
                target="_blank"
              >
                <ListItemText 
                  primary={attachment.name}
                  secondary={attachment.type}
                />
              </ListItem>
            ))}
          </List>
        </Section>
      )}
    </DetailContainer>
  );
};

export default LeadDetail; 