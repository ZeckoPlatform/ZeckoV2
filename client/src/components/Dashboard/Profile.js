import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api, { endpoints } from '../../services/api';
import EditIcon from '@mui/icons-material/Edit';
import { Avatar, TextField, Button, Grid, Alert } from '@mui/material';
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

// Add this styled component for the form
const StyledForm = styled.form`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.md || '16px'};
`;

// Main component
const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    phone: user?.profile?.phone || '',
    bio: user?.profile?.bio || ''
  });

  // Add this useEffect to update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.profile?.phone || '',
        bio: user.profile?.bio || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await api.put(endpoints.users.profile, formData);
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
          <StyledForm onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                />
              </Grid>
              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}
              {success && (
                <Grid item xs={12}>
                  <Alert severity="success">{success}</Alert>
                </Grid>
              )}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </StyledForm>
        </UserInfo>
      </ProfileHeader>
      {/* Rest of your JSX */}
    </ProfileContainer>
  );
};

export default Profile; 