import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Alert,
  Typography,
  Paper
} from '@mui/material';
import api from '../../services/api';

const LeadDetail = () => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/leads/${id}`);
        setLead(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Error loading lead details');
        setLead(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
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
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Lead Details
        </Typography>
        <Box mt={2}>
          <Typography><strong>Name:</strong> {lead.name}</Typography>
          <Typography><strong>Email:</strong> {lead.email}</Typography>
          <Typography><strong>Phone:</strong> {lead.phone}</Typography>
          <Typography><strong>Status:</strong> {lead.status}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LeadDetail; 