import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, getCurrentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    skills: []
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await getCurrentUser();
        setProfileData(userData);
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          bio: userData.bio || '',
          location: userData.location || '',
          skills: userData.skills || []
        });
        setLoading(false);
      } catch (err) {
        setError('Error loading profile data');
        setLoading(false);
      }
    };

    loadProfile();
  }, [getCurrentUser]);

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
      const response = await api.put('/users/profile', formData);
      setProfileData(response.data);
      setEditing(false);
    } catch (err) {
      setError('Error updating profile');
    }
  };

  if (loading) return <LoadingState>Loading...</LoadingState>;
  if (error) return <ErrorState>{error}</ErrorState>;
  if (!user) return <ErrorState>No user data available</ErrorState>;

  return (
    <ProfileContainer>
      <ProfileHeader>
        <h1>Profile</h1>
        <EditButton onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit Profile'}
        </EditButton>
      </ProfileHeader>

      {editing ? (
        <ProfileForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Username</Label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Bio</Label>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Location</Label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />
          </FormGroup>

          <SaveButton type="submit">Save Changes</SaveButton>
        </ProfileForm>
      ) : (
        <ProfileSection>
          <ProfileField>
            <Label>Username</Label>
            <Value>{profileData?.username}</Value>
          </ProfileField>

          <ProfileField>
            <Label>Email</Label>
            <Value>{profileData?.email}</Value>
          </ProfileField>

          <ProfileField>
            <Label>Bio</Label>
            <Value>{profileData?.bio || 'No bio provided'}</Value>
          </ProfileField>

          <ProfileField>
            <Label>Location</Label>
            <Value>{profileData?.location || 'No location provided'}</Value>
          </ProfileField>

          <ProfileField>
            <Label>Role</Label>
            <Value>{profileData?.role}</Value>
          </ProfileField>
        </ProfileSection>
      )}
    </ProfileContainer>
  );
};

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ProfileSection = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ProfileField = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Value = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
`;

const ProfileForm = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const EditButton = styled(Button)`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.main};

  &:hover {
    background: ${({ theme }) => theme.colors.primary.main};
    color: white;
  }
`;

const SaveButton = styled(Button)`
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.dark};
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.error.main};
`;

export default Profile;
