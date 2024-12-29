import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api, { endpoints } from '../../services/api';
import EditIcon from '@mui/icons-material/Edit';
import { Avatar } from '@mui/material';
import styled from 'styled-components';
import DashboardCard from './common/DashboardCard';

// Move styled components to the top
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

const StyledAvatar = styled(Avatar)`
  width: 100%;
  height: 100%;
  border: 4px solid ${({ theme }) => theme.colors?.primary?.main || '#4CAF50'};
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const AvatarUpload = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  background: ${({ theme, disabled }) => 
    disabled ? theme.colors?.grey?.main || '#9e9e9e' : theme.colors?.primary?.main || '#4CAF50'};
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => disabled ? 0.7 : 1};

  &:hover {
    transform: ${({ disabled }) => disabled ? 'none' : 'scale(1.1)'};
  }

  input {
    display: none;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

// Main component
const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setAvatarError(false);

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post(endpoints.users.avatar, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.avatarUrl) {
        // Pre-load the image
        const img = new Image();
        img.onload = () => {
          updateUser(prevUser => ({
            ...prevUser,
            avatarUrl: response.data.avatarUrl
          }));
          setSuccess('Avatar updated successfully!');
          setAvatarError(false);
        };
        img.onerror = () => {
          setAvatarError(true);
          setError('Failed to load the uploaded image');
        };
        img.src = response.data.avatarUrl;
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload avatar');
      setAvatarError(true);
    } finally {
      setLoading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const AvatarContainer = ({ children }) => {
    const fileInputRef = React.useRef(null);

    const handleClick = () => {
      fileInputRef.current?.click();
    };

    return (
      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
        {children}
        <AvatarUpload onClick={handleClick}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
          <EditIcon fontSize="small" />
        </AvatarUpload>
      </div>
    );
  };

  const AvatarDisplay = () => {
    const { user } = useAuth();
    const [imgError, setImgError] = useState(false);
    const defaultAvatar = '/default-avatar.png';

    return (
      <StyledAvatar
        src={(!imgError && user?.avatarUrl) ? user.avatarUrl : defaultAvatar}
        onError={() => setImgError(true)}
        sx={{ 
          width: 120,
          height: 120,
          border: '4px solid',
          borderColor: 'primary.main',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
      />
    );
  };

  // Rest of your component code...

  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarContainer>
          <AvatarDisplay />
        </AvatarContainer>
        <UserInfo>
          {/* User info content */}
        </UserInfo>
      </ProfileHeader>
      {/* Rest of your JSX */}
    </ProfileContainer>
  );
};

export default Profile; 