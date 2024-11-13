import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import muiTheme from './components/styles/muiTheme';
import { darkTheme } from './styles/theme/darkTheme';
import GlobalStyles from './styles/GlobalStyles';

// Ensure theme is created before rendering
const theme = createTheme(muiTheme);

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <StyledThemeProvider theme={darkTheme}>
        <CssBaseline />
        <GlobalStyles />
        {/* Your other components */}
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
