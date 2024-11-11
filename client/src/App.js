import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import GlobalStyles from './styles/GlobalStyles';

function App() {
  return (
    <ThemeProvider>
      <GlobalStyles />
      {/* Your other components */}
    </ThemeProvider>
  );
}

export default App;
