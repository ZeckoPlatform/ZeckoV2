import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ProfileHeader = styled.h1`
  color: var(--primary-color);
  margin-bottom: 30px;
`;

const ProfileForm = styled.form`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: var(--text-color);
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
`;

const AddressSection = styled.div`
  margin-top: 30px;
`;

const AddressCard = styled.div`
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AddressActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

function BusinessProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    businessName: '',
    email: '',
    phone: '',
    description: '',
    website: '',
    category: '',
    addresses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log('Fetching with token:', token); // Debug log

        const response = await fetch('/api/business/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch profile');
        }

        const data = await response.json();
        console.log('Profile data:', data); // Debug log

        setProfile({
            businessName: data.businessName || '',
            email: data.email || '',
            phone: data.phone || '',
            description: data.description || '',
            website: data.website || '',
            category: data.category || '',
            addresses: Array.isArray(data.addresses) ? data.addresses : []
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message || 'Failed to load business profile');
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAddress = async () => {
    try {
      const response = await fetch('/api/business/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          isDefault: profile.addresses.length === 0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add address');
      }

      fetchBusinessProfile(); // Refresh the profile
    } catch (error) {
      console.error('Error adding address:', error);
      setError('Failed to add address');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ProfileContainer>
      <ProfileHeader>Business Profile</ProfileHeader>
      {message && <div style={{ color: 'green', marginBottom: '20px' }}>{message}</div>}
      
      <ProfileForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Business Name</Label>
          <Input
            type="text"
            name="businessName"
            value={profile.businessName}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Phone</Label>
          <Input
            type="tel"
            name="phone"
            value={profile.phone}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Website</Label>
          <Input
            type="url"
            name="website"
            value={profile.website}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Category</Label>
          <Input
            type="text"
            name="category"
            value={profile.category}
            onChange={handleInputChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Description</Label>
          <TextArea
            name="description"
            value={profile.description}
            onChange={handleInputChange}
          />
        </FormGroup>

        <Button type="submit">Save Changes</Button>
      </ProfileForm>

      <AddressSection>
        <h2>Business Addresses</h2>
        <Button onClick={handleAddAddress}>Add New Address</Button>
        
        {profile.addresses.map((address, index) => (
          <AddressCard key={index}>
            <div>{address.street}</div>
            <div>{address.city}, {address.state} {address.zipCode}</div>
            <div>{address.country}</div>
            <AddressActions>
              <Button>Edit</Button>
              <Button>Delete</Button>
              {!address.isDefault && <Button>Set as Default</Button>}
            </AddressActions>
          </AddressCard>
        ))}
      </AddressSection>
    </ProfileContainer>
  );
}

export default BusinessProfile; 