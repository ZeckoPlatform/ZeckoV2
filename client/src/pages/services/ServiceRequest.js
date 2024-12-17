import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ServiceRequestForm from '../../components/services/ServiceRequestForm';
import { useService } from '../../contexts/ServiceContext';
import { useParams } from 'react-router-dom';

const ServiceRequest = () => {
  const { categoryId } = useParams();
  const { categories } = useService();
  
  const category = categories.find(cat => cat._id === categoryId);

  return (
    <Container>
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          {category ? `Request ${category.name}` : 'Request Service'}
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Fill in the details below and we'll match you with the right professionals
        </Typography>
        <ServiceRequestForm />
      </Box>
    </Container>
  );
};

export default ServiceRequest; 