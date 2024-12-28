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
import EditIcon from '@mui/icons-material/Edit';
import { endpoints } from '../../services/api';

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

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
    ...(user?.accountType !== 'Regular' && { businessName: user?.businessName || '' })
  });

  useEffect(() => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      address: user?.address || '',
      phone: user?.phone || '',
      ...(user?.accountType !== 'Regular' && { businessName: user?.businessName || '' })
    });
  }, [user]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/profile', formData);
      updateUser(prev => ({ ...prev, ...formData }));
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarContainer>
          <AvatarDisplay />
        </AvatarContainer>
        
        <UserInfo>
          <Typography variant="h5">Profile Information</Typography>
          <Box sx={{ mt: 2 }}>
            {!isEditing ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : null}
          </Box>
        </UserInfo>
      </ProfileHeader>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <DashboardCard>
        {!isEditing ? (
          // View Mode
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Username</Typography>
              <Typography>{formData.username}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Email</Typography>
              <Typography>{formData.email}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">Address</Typography>
              <Typography>{formData.address || 'No address provided'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
              <Typography>{formData.phone || 'No phone provided'}</Typography>
            </Grid>
            {user?.accountType !== 'Regular' && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Business Name</Typography>
                <Typography>{formData.businessName || 'No business name provided'}</Typography>
              </Grid>
            )}
          </Grid>
        ) : (
          // Edit Mode
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
              {user?.accountType !== 'Regular' && (
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
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
      </DashboardCard>

      <Button
        variant="outlined"
        color="primary"
        onClick={() => setOpenPasswordDialog(true)}
        sx={{ mt: 2 }}
      >
        Change Password
      </Button>

      {/* Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordSubmit} color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </ProfileContainer>
  );
};

export default Profile; 