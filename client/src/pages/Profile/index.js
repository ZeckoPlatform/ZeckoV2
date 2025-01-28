import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserProfile from './UserProfile';
import BusinessProfile from './BusinessProfile';
import VendorProfile from './VendorProfile';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  const getProfileComponent = () => {
    switch (user?.accountType) {
      case 'business':
        return <BusinessProfile />;
      case 'vendor':
        return <VendorProfile />;
      default:
        return <UserProfile />;
    }
  };

  return getProfileComponent();
};

export default Profile; 