import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { muiTheme, theme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';

function App() {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        {/* Your other components */}
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
