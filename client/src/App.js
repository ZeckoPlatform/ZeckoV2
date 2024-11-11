import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { muiTheme } from './styles/muiTheme';
import { darkTheme } from './styles/theme/darkTheme';
import GlobalStyles from './styles/GlobalStyles';

function App() {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={darkTheme}>
        <CssBaseline />
        <GlobalStyles />
        {/* Your other components */}
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
