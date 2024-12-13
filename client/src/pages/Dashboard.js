import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Profile from './Profile';
import Orders from './Orders';
import Notifications from './Notifications';
import PostJob from './PostJob';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const canPostJob = user?.role === 'user' || !user?.role;

  const [activeSection, setActiveSection] = useState('profile');

  const handlePostJob = () => {
    navigate('/post-job');
  };

  const renderContent = () => {
    switch(activeSection) {
      case 'profile':
        return <Profile />;
      case 'orders':
        return <Orders />;
      case 'notifications':
        return <Notifications />;
      case 'post-job':
        return <PostJob />;
      default:
        return <Profile />;
    }
  };

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeHeader>
          <h1>Welcome, {user?.username || 'User'}!</h1>
          {canPostJob && (
            <PostJobButton onClick={handlePostJob}>
              Post a Job
            </PostJobButton>
          )}
        </WelcomeHeader>
      </WelcomeSection>

      <DashboardLayout>
        <Sidebar>
          <NavItem 
            active={activeSection === 'profile'} 
            onClick={() => setActiveSection('profile')}
          >
            Profile
          </NavItem>
          <NavItem 
            active={activeSection === 'orders'} 
            onClick={() => setActiveSection('orders')}
          >
            Orders
          </NavItem>
          <NavItem 
            active={activeSection === 'notifications'} 
            onClick={() => setActiveSection('notifications')}
          >
            Notifications
          </NavItem>
          {canPostJob && (
            <NavItem 
              active={activeSection === 'post-job'} 
              onClick={handlePostJob}
            >
              Post a Job
            </NavItem>
          )}
        </Sidebar>

        <ContentArea>
          {renderContent()}
        </ContentArea>
      </DashboardLayout>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardLayout = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
`;

const Sidebar = styled.nav`
  width: 250px;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavItem = styled.div`
  padding: 1rem;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background: ${props => props.active ? props.theme.colors.primary.main : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text.primary};

  &:hover {
    background: ${props => props.active ? props.theme.colors.primary.main : props.theme.colors.background.light};
  }
`;

const ContentArea = styled.main`
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WelcomeSection = styled.div`
  margin-bottom: 2rem;
`;

const WelcomeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PostJobButton = styled.button`
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

export default Dashboard;