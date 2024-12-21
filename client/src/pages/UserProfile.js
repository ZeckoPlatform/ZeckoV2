import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import UserDashboard from '../components/UserDashboard';
import { withErrorBoundary } from '../components/error/withErrorBoundary';
import { Navigate } from 'react-router-dom';

const ProfilePage = styled(motion.div)`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.default};
`;

const UserProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <ProfilePage
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <UserDashboard />
    </ProfilePage>
  );
};

export default withErrorBoundary(UserProfile);