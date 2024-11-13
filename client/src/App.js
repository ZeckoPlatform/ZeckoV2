import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider } from '@mui/material/styles';
import muiTheme from './styles/muiTheme';
import { darkTheme } from './styles/theme/darkTheme';
import GlobalStyles from './styles/GlobalStyles';

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiTheme}>
        <StyledThemeProvider theme={darkTheme}>
          <CssBaseline />
          <GlobalStyles />
          {/* Your other components */}
        </StyledThemeProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
