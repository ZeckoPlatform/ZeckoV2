import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import DashboardHome from './Dashboard/Dashboard';
import Products from '../components/Dashboard/Products';
import Profile from '../components/dashboard/Profile';
import Settings from '../components/dashboard/Settings';

function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="products" element={<Products />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </DashboardLayout>
  );
}

export default Dashboard;
