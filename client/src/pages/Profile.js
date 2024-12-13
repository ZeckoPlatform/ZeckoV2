import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, getCurrentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await getCurrentUser();
        setLoading(false);
      } catch (err) {
        setError('Error loading profile data');
        setLoading(false);
      }
    };

    loadProfile();
  }, [getCurrentUser]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>No user data available</div>;

  return (
    <ProfileContainer>
      <ProfileHeader>
        <h1>Profile</h1>
      </ProfileHeader>
      
      <ProfileSection>
        <h2>Personal Information</h2>
        <ProfileField>
          <Label>Username</Label>
          <Value>{user.username}</Value>
        </ProfileField>
        <ProfileField>
          <Label>Email</Label>
          <Value>{user.email}</Value>
        </ProfileField>
        <ProfileField>
          <Label>Role</Label>
          <Value>{user.role}</Value>
        </ProfileField>
      </ProfileSection>
    </ProfileContainer>
  );
};

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const ProfileHeader = styled.div`
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
  
  h2 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 1.5rem;
  }
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

export default Profile;
