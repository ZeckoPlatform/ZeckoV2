import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  BarChart2, 
  Settings 
} from 'react-feather';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { 
  getSocket, 
  subscribeToActivityUpdates, 
  unsubscribeFromActivityUpdates 
} from '../../utils/socket.io';
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
  
  ${({ $active }) => $active ? `
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

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleActivityUpdate = useCallback((activity) => {
    activityLogService.addActivity(activity);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    
    if (socket && user?.role === 'admin') {
      subscribeToActivityUpdates(socket, handleActivityUpdate);
      
      return () => {
        unsubscribeFromActivityUpdates(socket, handleActivityUpdate);
      };
    }
  }, [user, handleActivityUpdate]);

  const getCurrentSection = useCallback(() => {
    const path = location.pathname.split('/');
    return path[2] || 'dashboard';
  }, [location.pathname]);

  const menuItems = [
    { to: '/admin/dashboard', icon: <BarChart2 />, label: 'Dashboard' },
    { to: '/admin/users', icon: <Users />, label: 'Users' },
    { to: '/admin/products', icon: <Package />, label: 'Products' },
    { to: '/admin/orders', icon: <ShoppingBag />, label: 'Orders' },
    { to: '/admin/settings', icon: <Settings />, label: 'Settings' }
  ];

  return (
    <DashboardContainer>
      <Sidebar>
        {menuItems.map(({ to, icon, label }) => (
          <MenuItem 
            key={to} 
            to={to} 
            $active={getCurrentSection() === to.split('/')[2]}
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