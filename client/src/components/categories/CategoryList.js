import React from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { useServiceCategories } from '../../contexts/ServiceCategoryContext';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.2s;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CategoryList = () => {
  const { categories, loading, error } = useServiceCategories();

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Grid container spacing={3} padding={3}>
      {categories.map((category) => (
        <Grid item xs={12} sm={6} md={4} key={category._id}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {category.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {category.description}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default CategoryList; 