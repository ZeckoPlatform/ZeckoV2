import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';

// Direct imports for pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Define your MUI theme
const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#006400',
    },
    background: {
      default: '#ffffff',
    },
  },
});

// Define your styled-components theme
const styledTheme = {
  colors: {
    primary: '#006400',
    text: '#000000',
    background: '#ffffff',
  },
  main: {
    colors: {
      primary: '#006400',
    },
  },
};

function App() {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <StyledThemeProvider theme={styledTheme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
