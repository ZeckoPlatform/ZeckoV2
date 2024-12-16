import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import api from '../../services/api';

const LeadDetail = () => {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await api.get(`/api/leads/${id}`);
        setLead(response.data);
      } catch (error) {
        console.error('Error fetching lead:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!lead) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Lead not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6">Lead Details</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography>Name: {lead.name}</Typography>
        <Typography>Email: {lead.email}</Typography>
        <Typography>Phone: {lead.phone}</Typography>
        <Typography>Status: {lead.status}</Typography>
      </Box>
    </Box>
  );
};

export default LeadDetail; 