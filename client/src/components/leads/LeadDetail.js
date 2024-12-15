import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styled as muiStyled } from '@mui/material/styles';
import { 
  Button, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Typography
} from '@mui/material';
import { LocationOn, MonetizationOn, Person, Description } from '@mui/icons-material';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DetailContainer = muiStyled(Paper)(({ theme }) => ({
  padding: '2rem',
  margin: '2rem auto',
  maxWidth: '800px'
}));

const Header = muiStyled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '2rem'
}));

const MetaData = muiStyled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '2rem',
  margin: '1.5rem 0'
}));

const MetaItem = muiStyled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: theme.palette.text.secondary
}));

const Section = muiStyled(Box)(({ theme }) => ({
  margin: '2rem 0'
}));

const RequirementsList = muiStyled(List)(({ theme }) => ({
  background: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius
}));

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeadDetail();
  }, [id]);

  const fetchLeadDetail = async () => {
    try {
      const response = await api.getLeadById(id);
      setLead(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!lead) return <Typography>Lead not found</Typography>;

  return (
    <DetailContainer>
      <Header>
        <Box>
          <Typography variant="h4" component="h1">{lead.title}</Typography>
          <Chip 
            label={lead.category.name} 
            sx={{ marginTop: 1 }}
          />
        </Box>
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
          <Typography>{lead.location.city}, {lead.location.state}</Typography>
        </MetaItem>
        <MetaItem>
          <MonetizationOn />
          <Typography>${lead.budget.min.toLocaleString()} - ${lead.budget.max.toLocaleString()}</Typography>
        </MetaItem>
        <MetaItem>
          <Person />
          <Typography>{lead.proposals.length} proposals</Typography>
        </MetaItem>
      </MetaData>

      <Divider />

      <Section>
        <Typography variant="h6">Description</Typography>
        <Typography>{lead.description}</Typography>
      </Section>

      <Section>
        <Typography variant="h6">Requirements</Typography>
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

      {lead.attachments?.length > 0 && (
        <Section>
          <Typography variant="h6">Attachments</Typography>
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