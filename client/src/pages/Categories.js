import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import CategoryList from '../components/categories/CategoryList';

const Categories = () => {
  return (
    <Container>
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Browse Service Categories
        </Typography>
        <CategoryList />
      </Box>
    </Container>
  );
};

export default Categories; 