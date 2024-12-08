import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function Contractors() {
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Contractors
        </Typography>
        {/* Add your contractors content here */}
      </Box>
    </Container>
  );
}

export default Contractors; 