import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateLead from './pages/CreateLead';
import LeadDetails from './pages/LeadDetails';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import PostLead from './pages/PostLead';
import LeadList from './pages/LeadList';
import LeadDetail from './pages/LeadDetail';

function App() {
  return (
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
  );
}

export default App;
