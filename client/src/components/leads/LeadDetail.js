import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Chip
} from '@mui/material';
import api from '../../services/api';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLeadDetail = async () => {
      try {
        if (!id) {
          throw new Error('Lead ID is required');
        }

        const response = await api.get(`/api/leads/${id}`);
        
        if (isMounted && response?.data) {
          setLead(response.data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching lead:', err);
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load lead details');
          setLead(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLeadDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!lead) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          Lead not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
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
        </Box>
        {/* Rest of your render logic */}
      </Box>
    </Container>
  );
};

export default LeadDetail; 