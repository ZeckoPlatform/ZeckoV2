import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import DashboardCard from './common/DashboardCard';
import { FiCamera, FiLock, FiMail, FiPhone, FiUser } from 'react-icons/fi';

const ProfileContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: 800px;
  margin: 0 auto;
`;

const ProfileHeader = styled(DashboardCard)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xl};

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

const Avatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.main};
  border: 4px solid ${({ theme }) => theme.colors.primary.main};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarUpload = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.primary.main};
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormSection = styled(DashboardCard)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.text.disabled}40;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.main};
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light}20;
  }
`;

const Button = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme, variant }) =>
    variant === 'outlined'
      ? 'transparent'
      : theme.colors.primary.gradient};
  color: ${({ theme, variant }) =>
    variant === 'outlined'
      ? theme.colors.primary.main
      : theme.colors.primary.text};
  border: ${({ theme, variant }) =>
    variant === 'outlined'
      ? `1px solid ${theme.colors.primary.main}`
      : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        // Replace with your actual API call
        await fetch('/api/profile/avatar', {
          method: 'POST',
          body: formData
        });
        // Update user avatar in context
      } catch (error) {
        console.error('Error uploading avatar:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarContainer>
          <Avatar>
            <img src={user?.avatar || '/default-avatar.png'} alt="Profile" />
          </Avatar>
          <AvatarUpload>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <FiCamera />
          </AvatarUpload>
        </AvatarContainer>
        <UserInfo>
          <h2>{`${user?.firstName} ${user?.lastName}`}</h2>
          <p>{user?.email}</p>
        </UserInfo>
      </ProfileHeader>

      <Form onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>
            <FiUser /> Personal Information
          </SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>First Name</Label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Last Name</Label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FiMail /> Contact Information
          </SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Phone</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FiLock /> Change Password
          </SectionTitle>
          <FormRow>
            <FormGroup>
              <Label>Current Password</Label>
              <Input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>New Password</Label>
              <Input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </FormGroup>
          </FormRow>
        </FormSection>

        <ButtonGroup>
          <Button
            type="button"
            variant="outlined"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </ButtonGroup>
      </Form>
    </ProfileContainer>
  );
};

export default Profile; 