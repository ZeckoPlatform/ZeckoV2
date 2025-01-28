import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../Layout/Sidebar';
import LoadingSpinner from '../common/LoadingSpinner';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme?.colors?.background?.default || '#FFFFFF'};
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme?.spacing?.lg || '24px'};
  margin-left: 280px;
  overflow-y: auto;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const DashboardLayout = ({ children }) => {
  const { userType, loading } = useAuth();

  const sidebarItems = {
    user: [
      { label: 'My Leads', path: '/leads' },
      { label: 'Post Lead', path: '/leads/post' },
      { label: 'Messages', path: '/messages' },
      { label: 'Profile', path: '/profile' }
    ],
    business: [
      { label: 'Overview', path: '/business/dashboard' },
      { label: 'Lead Board', path: '/business/leads' },
      { label: 'Orders', path: '/business/orders' },
      { label: 'Messages', path: '/messages' },
      { label: 'Profile', path: '/business/profile' }
    ],
    vendor: [
      { label: 'Overview', path: '/vendor/dashboard' },
      { label: 'Products', path: '/vendor/products' },
      { label: 'Orders', path: '/vendor/orders' },
      { label: 'Messages', path: '/messages' },
      { label: 'Profile', path: '/vendor/profile' }
    ]
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardContainer>
      <Sidebar items={sidebarItems[userType]} />
      <MainContent>
        {children}
      </MainContent>
    </DashboardContainer>
  );
};

export default DashboardLayout; 