import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider } from './contexts/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  return (
    <ThemeProvider>
      <MuiThemeProvider theme={theme.muiTheme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Your routes here */}
          </Routes>
        </Router>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;
