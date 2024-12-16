import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocationOn, MonetizationOn, Person } from '@mui/icons-material';
import api from '../../services/api';

const DetailContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: `${theme.spacing(3)} auto`,
  maxWidth: '800px'
}));

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/leads/${id}`);
        if (response?.data) {
          setLead(response.data);
        }
      } catch (err) {
        setError(err?.message || 'Failed to load lead details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLead();
    }

    return () => {
      // Cleanup if needed
    };
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!lead) {
    return (
      <Box p={3}>
        <Alert severity="info">Lead not found</Alert>
      </Box>
    );
  }

  return (
    <DetailContainer>
      <Box p={2}>
        <Typography variant="h4" gutterBottom>
          {lead.title}
        </Typography>
        
        <Box my={2}>
          <Typography variant="body1">{lead.description}</Typography>
        </Box>

        <Box my={2}>
          {lead.budget && (
            <Chip
              icon={<MonetizationOn />}
              label={`Budget: ${lead.budget}`}
              sx={{ mr: 1, mb: 1 }}
            />
          )}
          {lead.location && (
            <Chip
              icon={<LocationOn />}
              label={lead.location}
              sx={{ mr: 1, mb: 1 }}
            />
          )}
        </Box>

        {lead.attachments?.length > 0 && (
          <Box my={2}>
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

        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Box>
      </Box>
    </DetailContainer>
  );
};

export default LeadDetail; 