import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const ProfileSection = styled.section`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin-right: 10px;
  background-color: ${props => props.danger ? '#dc3545' : 'var(--primary-color)'};
  color: white;
  
  &:hover {
    opacity: 0.9;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin: 10px 0;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  margin: 10px 0;
`;

const AddressSection = styled(ProfileSection)`
  .address-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
`;

const AddressCard = styled.div`
  border: 1px solid #ddd;
  padding: 15px;
  margin: 10px 0;
  border-radius: 4px;
  position: relative;
  
  &:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const AddressActions = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
`;

function UserProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();
        setProfileData(data);
        setEditedData({
          name: data.name || '',
          email: data.email || '',
          phone: data.profile?.phone || '',
          bio: data.profile?.bio || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/users/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch addresses');

      const data = await response.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      setProfileData(updatedData);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/users/profile', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete account');
        }

        await logout();
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(addressForm)
      });

      if (!response.ok) throw new Error('Failed to add address');

      const newAddress = await response.json();
      setAddresses([...addresses, newAddress]);
      setIsAddingAddress(false);
      setAddressForm({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      });
      setSuccess('Address added successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/addresses/${editingAddressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(addressForm)
      });

      if (!response.ok) throw new Error('Failed to update address');

      const updatedAddress = await response.json();
      setAddresses(addresses.map(addr => 
        addr._id === editingAddressId ? updatedAddress : addr
      ));
      setEditingAddressId(null);
      setAddressForm({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      });
      setSuccess('Address updated successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await fetch(`/api/users/addresses/${addressId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to delete address');

        setAddresses(addresses.filter(addr => addr._id !== addressId));
        setSuccess('Address deleted successfully');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please log in to view your profile</div>;

  return (
    <ProfileContainer>
      <h1>User Profile</h1>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <ProfileSection>
        <h2>Personal Information</h2>
        {isEditing ? (
          <>
            <FormGroup>
              <Label>Name:</Label>
              <Input
                type="text"
                name="name"
                value={editedData.name}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Email:</Label>
              <Input
                type="email"
                name="email"
                value={editedData.email}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Phone:</Label>
              <Input
                type="tel"
                name="phone"
                value={editedData.phone}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Bio:</Label>
              <Input
                as="textarea"
                name="bio"
                value={editedData.bio}
                onChange={handleChange}
              />
            </FormGroup>
            <Button onClick={handleSave}>Save Changes</Button>
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          </>
        ) : (
          <>
            <p><strong>Name:</strong> {profileData?.name}</p>
            <p><strong>Email:</strong> {profileData?.email}</p>
            <p><strong>Phone:</strong> {profileData?.profile?.phone || 'Not provided'}</p>
            <p><strong>Bio:</strong> {profileData?.profile?.bio || 'No bio provided'}</p>
            <Button onClick={handleEdit}>Edit Profile</Button>
            <Button danger onClick={handleDeleteAccount}>Delete Account</Button>
          </>
        )}
      </ProfileSection>

      <AddressSection>
        <div className="address-header">
          <h2>Saved Addresses</h2>
          {!isAddingAddress && !editingAddressId && (
            <Button onClick={() => setIsAddingAddress(true)}>Add New Address</Button>
          )}
        </div>

        {(isAddingAddress || editingAddressId) && (
          <AddressForm onSubmit={editingAddressId ? handleEditAddress : handleAddAddress}>
            <FormGroup>
              <Label>Street Address:</Label>
              <Input
                name="street"
                value={addressForm.street}
                onChange={handleAddressChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>City:</Label>
              <Input
                name="city"
                value={addressForm.city}
                onChange={handleAddressChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>State:</Label>
              <Input
                name="state"
                value={addressForm.state}
                onChange={handleAddressChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>ZIP Code:</Label>
              <Input
                name="zipCode"
                value={addressForm.zipCode}
                onChange={handleAddressChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Country:</Label>
              <Input
                name="country"
                value={addressForm.country}
                onChange={handleAddressChange}
                required
              />
            </FormGroup>
            <Button type="submit">
              {editingAddressId ? 'Update Address' : 'Add Address'}
            </Button>
            <Button 
              type="button" 
              secondary 
              onClick={() => {
                setIsAddingAddress(false);
                setEditingAddressId(null);
                setAddressForm({
                  street: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  country: ''
                });
              }}
            >
              Cancel
            </Button>
          </AddressForm>
        )}

        {addresses.length === 0 ? (
          <EmptyState>
            <h3>No addresses saved yet</h3>
            <p>Add your first address to get started</p>
          </EmptyState>
        ) : (
          addresses.map(address => (
            <AddressCard key={address._id}>
              <p>{address.street}</p>
              <p>{address.city}, {address.state} {address.zipCode}</p>
              <p>{address.country}</p>
              <AddressActions>
                <Button onClick={() => {
                  setEditingAddressId(address._id);
                  setAddressForm({
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    zipCode: address.zipCode,
                    country: address.country
                  });
                }}>Edit</Button>
                <Button danger onClick={() => handleDeleteAddress(address._id)}>Delete</Button>
              </AddressActions>
            </AddressCard>
          ))
        )}
      </AddressSection>

      {profileData && (
        <>
          <ProfileSection>
            <h2>Activity</h2>
            <p><strong>Last Login:</strong> {new Date(profileData.activity?.lastLogin).toLocaleDateString()}</p>
            <p><strong>Login Count:</strong> {profileData.activity?.loginCount}</p>
          </ProfileSection>

          <ProfileSection>
            <h2>Settings</h2>
            <p><strong>Email Notifications:</strong> {profileData.preferences?.emailNotifications ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Theme:</strong> {profileData.preferences?.theme}</p>
          </ProfileSection>
        </>
      )}
    </ProfileContainer>
  );
}

export default UserProfile;
