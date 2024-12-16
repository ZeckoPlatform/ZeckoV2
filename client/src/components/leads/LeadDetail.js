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
  Typography,
  Container,
  CircularProgress
} from '@mui/material';
import { LocationOn, MonetizationOn, Person } from '@mui/icons-material';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const DetailContainer = muiStyled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: `${theme.spacing(3)} auto`,
  maxWidth: '800px'
}));

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeadDetail = async () => {
      try {
        const response = await api.getLeadById(id);
        if (response?.data) {
          setLead(response.data);
        } else {
          setError('No data received');
        }
      } catch (err) {
        console.error('Error fetching lead:', err);
        setError(err?.message || 'Failed to load lead details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLeadDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          Error: {error}
        </Typography>
      </Container>
    );
  }

  if (!lead) {
    return (
      <Container>
        <Typography align="center">
          Lead not found
        </Typography>
      </Container>
    );
  }

  return (
    <DetailContainer elevation={2}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {lead.title || 'Untitled Lead'}
            </Typography>
            {lead.category?.name && (
              <Chip 
                label={lead.category.name} 
                color="primary" 
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(`/leads/${id}/propose`)}
          >
            Submit Proposal
          </Button>
        </Box>

        <Box display="flex" gap={3} mb={3}>
          {lead.location && (
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn color="action" />
              <Typography>
                {[lead.location.city, lead.location.state].filter(Boolean).join(', ') || 'Location not specified'}
              </Typography>
            </Box>
          )}
          
          {lead.budget && (
            <Box display="flex" alignItems="center" gap={1}>
              <MonetizationOn color="action" />
              <Typography>
                ${lead.budget.min?.toLocaleString()} - ${lead.budget.max?.toLocaleString()}
              </Typography>
            </Box>
          )}
          
          <Box display="flex" alignItems="center" gap={1}>
            <Person color="action" />
            <Typography>
              {lead.proposals?.length || 0} proposals
            </Typography>
          </Box>
        </Box>

        <Divider />

        <Box my={3}>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography>
            {lead.description || 'No description provided'}
          </Typography>
        </Box>

        {lead.requirements?.length > 0 && (
          <Box my={3}>
            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
            <List>
              {lead.requirements.map((req, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={req.question || 'Requirement'}
                    secondary={req.answer || 'No answer provided'}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {lead.attachments?.length > 0 && (
          <Box my={3}>
            <Typography variant="h6" gutterBottom>
              Attachments
            </Typography>
            <List>
              {lead.attachments.map((attachment, index) => (
                <ListItem 
                  key={index}
                  button 
                  component="a" 
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ListItemText 
                    primary={attachment.name || 'Unnamed attachment'}
                    secondary={attachment.type || 'Unknown type'}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </DetailContainer>
  );
};

export default LeadDetail; 