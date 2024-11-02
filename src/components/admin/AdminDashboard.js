import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  BarChart2, 
  Settings 
} from 'react-feather';
import UserManagement from './UserManagement';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import DashboardStats from './DashboardStats';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { getSocket } from '../../utils/socket.io';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 5px;
  
  ${props => props.active ? `
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
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = getSocket();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'dashboard':
        return <DashboardStats />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <h2 style={{ marginBottom: '30px' }}>Admin Panel</h2>
        
        <MenuItem 
          active={activeSection === 'dashboard'}
          onClick={() => setActiveSection('dashboard')}
        >
          <BarChart2 size={20} />
          Dashboard
        </MenuItem>

        <MenuItem 
          active={activeSection === 'users'}
          onClick={() => setActiveSection('users')}
        >
          <Users size={20} />
          User Management
        </MenuItem>

        <MenuItem 
          active={activeSection === 'products'}
          onClick={() => setActiveSection('products')}
        >
          <Package size={20} />
          Product Management
        </MenuItem>

        <MenuItem 
          active={activeSection === 'orders'}
          onClick={() => setActiveSection('orders')}
        >
          <ShoppingBag size={20} />
          Order Management
        </MenuItem>

        <MenuItem 
          active={activeSection === 'settings'}
          onClick={() => setActiveSection('settings')}
        >
          <Settings size={20} />
          Settings
        </MenuItem>
      </Sidebar>

      <MainContent>
        <AdminHeader>
          <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
        </AdminHeader>
        {renderContent()}
      </MainContent>
    </DashboardContainer>
  );
}

export default AdminDashboard; 