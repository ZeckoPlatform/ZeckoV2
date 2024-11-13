import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import muiTheme from './styles/theme';
import { darkTheme } from './styles/theme/darkTheme';
import GlobalStyles from './styles/GlobalStyles';

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={darkTheme}>
        <CssBaseline />
        <GlobalStyles />
        {/* Your other components */}
      </StyledThemeProvider>
    </ThemeProvider>
  );
}

export default App;
