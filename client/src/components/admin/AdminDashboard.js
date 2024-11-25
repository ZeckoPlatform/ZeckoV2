import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  BarChart2, 
  Settings 
} from 'react-feather';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { getSocket, subscribeToActivityUpdates, unsubscribeFromActivityUpdates } from '../../utils/socket.io';
import { activityLogService } from '../../services/activityLogService';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background: #1a1a1a;
  color: white;
  padding: 20px;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
  overflow-y: auto;
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 5px;
  text-decoration: none;
  color: inherit;
  
  ${props => props.$active ? `
    background: var(--primary-color);
    color: white;
  ` : `
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

const AdminHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ddd;
`;

const menuItems = [
  { path: '', icon: <BarChart2 size={20} />, label: 'Dashboard' },
  { path: 'users', icon: <Users size={20} />, label: 'User Management' },
  { path: 'products', icon: <Package size={20} />, label: 'Product Management' },
  { path: 'orders', icon: <ShoppingBag size={20} />, label: 'Order Management' },
  { path: 'settings', icon: <Settings size={20} />, label: 'Settings' }
];

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const socket = getSocket();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleActivity = (data) => {
      console.log('New activity:', data);
    };

    subscribeToActivityUpdates(handleActivity);
    return () => unsubscribeFromActivityUpdates();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activities = await activityLogService.getActivities();
        // Handle activities data
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchActivities();
  }, []);

  const getCurrentSection = () => {
    const path = location.pathname.split('/').pop();
    return path || 'dashboard';
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <h2 style={{ marginBottom: '30px' }}>Admin Panel</h2>
        
        {menuItems.map(({ path, icon, label }) => (
          <MenuItem 
            key={path}
            to={`/admin/${path}`}
            $active={getCurrentSection() === (path || 'dashboard')}
          >
            {icon}
            {label}
          </MenuItem>
        ))}
      </Sidebar>

      <MainContent>
        <AdminHeader>
          <h1>{getCurrentSection().charAt(0).toUpperCase() + getCurrentSection().slice(1)}</h1>
        </AdminHeader>
        <Outlet />
      </MainContent>
    </DashboardContainer>
  );
}

export default AdminDashboard; 