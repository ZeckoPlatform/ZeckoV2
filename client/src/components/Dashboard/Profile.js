import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Avatar,
  Button,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Container
} from '@mui/material';
import styled from 'styled-components';
import DashboardCard from './common/DashboardCard';

const ProfileContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl || '24px'};
  max-width: 800px;
  margin: 0 auto;
`;

const ProfileHeader = styled(DashboardCard)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl || '24px'};
  padding: ${({ theme }) => theme.spacing.xl || '24px'};

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
`;

const StyledAvatar = styled(Avatar)`
  width: 100%;
  height: 100%;
  border: 4px solid ${({ theme }) => theme.colors?.primary?.main || '#4CAF50'};
`;

const AvatarUpload = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background: ${({ theme }) => theme.colors?.primary?.main || '#4CAF50'};
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  input {
    display: none;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = async (event) => {
    try {
      setLoading(true);
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      if (data.avatarUrl) {
        await updateUser({ ...user, avatar: data.avatarUrl });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarContainer>
          <StyledAvatar
            src={user?.avatar || '/default-avatar.png'}
            alt="Profile"
          />
          <AvatarUpload>
            <input
              accept="image/*"
              type="file"
              onChange={handleAvatarChange}
              disabled={loading}
            />
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <i className="fas fa-camera" />
            )}
          </AvatarUpload>
        </AvatarContainer>

        <UserInfo>
          <Typography variant="h5" gutterBottom>
            {user?.username || user?.email}
          </Typography>
          <Typography color="textSecondary">
            {user?.accountType} Account
          </Typography>
          <Typography color="textSecondary">
            Role: {user?.role}
          </Typography>
        </UserInfo>
      </ProfileHeader>

      <DashboardCard>
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            Email: {user?.email}
          </Typography>
          <Typography variant="body1" paragraph>
            Username: {user?.username}
          </Typography>
          <Typography variant="body1" paragraph>
            Account Type: {user?.accountType}
          </Typography>
          <Typography variant="body1">
            Role: {user?.role}
          </Typography>
        </Box>
      </DashboardCard>
    </ProfileContainer>
  );
};

export default Profile; 