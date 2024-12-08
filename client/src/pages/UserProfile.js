import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { fetchData, endpoints } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const ProfileContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const ProfileSection = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const ProfileField = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  strong {
    min-width: 120px;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  padding: 20px;
  background: ${({ theme }) => theme.colors.error}10;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin: 20px 0;
`;

function UserProfile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { error: notify } = useNotification();

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchData(`${endpoints.users.profile}/${user.id}`);
      setProfileData(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load profile data';
      setError(errorMessage);
      notify(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user.id, notify]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user, fetchProfileData]);

  if (loading) {
    return (
      <ProfileContainer>
        <LoadingSpinner>Loading profile data...</LoadingSpinner>
      </ProfileContainer>
    );
  }

  if (error) {
    return (
      <ProfileContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </ProfileContainer>
    );
  }

  if (!profileData) {
    return (
      <ProfileContainer>
        <ErrorMessage>No profile data available</ErrorMessage>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileSection>
        <h2>Profile Information</h2>
        <ProfileField>
          <strong>Name:</strong>
          <span>{profileData.name}</span>
        </ProfileField>
        <ProfileField>
          <strong>Email:</strong>
          <span>{profileData.email}</span>
        </ProfileField>
        <ProfileField>
          <strong>Role:</strong>
          <span>{profileData.role}</span>
        </ProfileField>
      </ProfileSection>

      {profileData.preferences && (
        <ProfileSection>
          <h2>Preferences</h2>
          {Object.entries(profileData.preferences).map(([key, value]) => (
            <ProfileField key={key}>
              <strong>{key}:</strong>
              <span>{value.toString()}</span>
            </ProfileField>
          ))}
        </ProfileSection>
      )}
    </ProfileContainer>
  );
}

export default UserProfile;