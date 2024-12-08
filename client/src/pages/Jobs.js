import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function Jobs() {
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Jobs
        </Typography>
        {/* Add your jobs content here */}
      </Box>
    </Container>
  );
}

export default Jobs; 