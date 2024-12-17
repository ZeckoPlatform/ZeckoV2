import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import CategoryList from '../../components/services/CategoryList';
import styled from 'styled-components';

const HeroSection = styled(Box)`
  background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
  color: white;
  padding: 48px 0;
  margin-bottom: 32px;
`;

const Categories = () => {
  return (
    <>
      <HeroSection>
        <Container>
          <Typography variant="h3" gutterBottom>
            Find Local Service Professionals
          </Typography>
          <Typography variant="h6">
            Get free quotes from trusted professionals in your area
          </Typography>
        </Container>
      </HeroSection>
      <Container>
        <CategoryList />
      </Container>
    </>
  );
};

export default Categories; 