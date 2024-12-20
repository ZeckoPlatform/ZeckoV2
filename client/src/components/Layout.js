import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navigation from './Navigation';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();

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
      <Navigation isAuthenticated={isAuthenticated} user={user} />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          mt: 8,
          backgroundColor: 'inherit',
          position: 'relative',
          zIndex: 1
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
