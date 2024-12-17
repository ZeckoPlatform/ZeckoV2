import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';

function AppContent() {
  const { muiTheme } = useTheme();
  
  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Your routes here */}
        </Routes>
      </Router>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
