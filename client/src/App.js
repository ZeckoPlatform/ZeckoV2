import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LeadList from './pages/LeadList';
import LeadDetail from './components/leads/LeadDetail';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import PostLead from './pages/PostLead';
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    primary: {
      main: '#1976d2',
      dark: '#115293',
    },
    error: {
      main: '#f44336',
    },
    border: '#dddddd',
  },
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/leads/create" element={<PostLead />} />
            <Route path="/leads" element={<LeadList />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
