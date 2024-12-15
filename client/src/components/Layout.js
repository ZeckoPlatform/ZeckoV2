import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navigation from './Navigation';
import { useTheme } from '@mui/material/styles';

const Layout = () => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary
      }}
    >
      <Navigation />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          mt: 8, // Add margin top to account for fixed navbar
          backgroundColor: 'inherit'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
