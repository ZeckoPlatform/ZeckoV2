import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import DashboardCard from './Dashboard/common/DashboardCard';
import Profile from './Dashboard/Profile';
import { FiUser, FiSettings, FiFileText, FiMessageSquare } from 'react-icons/fi';

const DashboardContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const StatsCard = styled(motion(DashboardCard))`
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};

  svg {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const StatInfo = styled.div`
  h3 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.9rem;
  }

  p {
    margin: ${({ theme }) => theme.spacing.xs} 0 0;
    font-size: 1.5rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardContainer>
      <h1>Welcome, {user?.firstName || 'User'}!</h1>
      
      <DashboardGrid>
        <StatsCard
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiFileText />
          <StatInfo>
            <h3>Service Requests</h3>
            <p>5</p>
          </StatInfo>
        </StatsCard>

        <StatsCard
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiMessageSquare />
          <StatInfo>
            <h3>Messages</h3>
            <p>3</p>
          </StatInfo>
        </StatsCard>

        <StatsCard
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiSettings />
          <StatInfo>
            <h3>Active Services</h3>
            <p>2</p>
          </StatInfo>
        </StatsCard>
      </DashboardGrid>

      {/* Profile Section */}
      <Profile />
    </DashboardContainer>
  );
};

export default UserDashboard; 