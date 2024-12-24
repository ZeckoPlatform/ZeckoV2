import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import {
  Avatar,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Container,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import styled from 'styled-components';
import DashboardCard from './common/DashboardCard';
import axios from 'axios';

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

const AvatarDisplay = () => {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const defaultAvatar = '/default-avatar.png';

  useEffect(() => {
    // Reset error state when user or avatarUrl changes
    if (user?.avatarUrl) {
      setImgError(false);
    }
  }, [user?.avatarUrl]);

  const handleImageError = (e) => {
    console.log('Avatar failed to load:', user?.avatarUrl);
    setImgError(true);
    e.currentTarget.src = defaultAvatar;
  };

  return (
    <StyledAvatar
      src={(!imgError && user?.avatarUrl) ? user.avatarUrl : defaultAvatar}
      alt={user?.username || 'User avatar'}
      onError={handleImageError}
    />
  );
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    address: user?.address || '',
    phone: user?.phone || '',
    businessName: user?.businessName || ''
  });

  useEffect(() => {
    // Update form data when user data changes
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      address: user?.address || '',
      phone: user?.phone || '',
      businessName: user?.businessName || ''
    });
  }, [user]); // Only run when user object changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await api.post('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess('Password updated successfully');
      setOpenPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.message || 'Failed to change password');
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

      const response = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('Avatar upload response:', response.data);

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
          console.error('Failed to load the uploaded image');
          setAvatarError(true);
          setError('Failed to load the uploaded image');
        };
        img.src = response.data.avatarUrl;
      } else {
        throw new Error('No avatar URL in response');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const response = await api.put('/profile', formData);
      
      if (response.data) {
        updateUser(prevUser => ({
          ...prevUser,
          ...response.data
        }));
        setSuccess('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContainer>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <ProfileHeader>
        <AvatarContainer>
          <AvatarDisplay />
          <AvatarUpload disabled={loading}>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              id="avatar-upload"
              disabled={loading}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor="avatar-upload"
              style={{ 
                cursor: loading ? 'wait' : 'pointer',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                '+'
              )}
            </label>
          </AvatarUpload>
        </AvatarContainer>
        <UserInfo>
          <Typography variant="h5">{user?.username}</Typography>
          <Typography variant="body1" color="textSecondary">
            {user?.email}
          </Typography>
        </UserInfo>
      </ProfileHeader>

      <DashboardCard>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                multiline
                rows={2}
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
            {user?.accountType !== 'regular' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setOpenPasswordDialog(true)}
                sx={{ mr: 2 }}
              >
                Change Password
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </DashboardCard>

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button 
            onClick={handlePasswordSubmit}
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </ProfileContainer>
  );
};

export default Profile; 