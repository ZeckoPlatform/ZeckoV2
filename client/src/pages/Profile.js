import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { userAPI, ordersAPI } from '../services/api';
import { CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ProfileSection = styled.section`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const OrderHistory = styled.div`
  margin-top: 20px;
`;

const OrderCard = styled.div`
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 4px;

  &:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;

  &:disabled {
    background-color: #ccc;
  }
`;

const ActionButton = styled(Button)`
  background-color: ${props => props.danger ? '#dc3545' : props.secondary ? '#6c757d' : 'var(--primary-color)'};
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
`;

const AddressCard = styled.div`
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 15px;
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

const Message = styled.div`
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SuccessMessage = styled(Message)`
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
`;

const ErrorMessage = styled(Message)`
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
`;

function Profile() {
  const [profileData, setProfileData] = useState({
    user: null,
    orders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const [userRes, ordersRes] = await Promise.all([
          userAPI.getCurrentUser(),
          ordersAPI.getAll()
        ]);

        setProfileData({
          user: userRes.data,
          orders: ordersRes.data
        });
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ProfileContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <ProfileSection>
        <h1>My Profile</h1>
        {isEditingProfile ? (
          <form onSubmit={handleUpdateProfile}>
            <FormGroup>
              <Label>Name:</Label>
              <Input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Email:</Label>
              <Input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Phone:</Label>
              <Input
                type="tel"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Bio:</Label>
              <Input
                as="textarea"
                name="bio"
                value={profileForm.bio}
                onChange={handleProfileChange}
              />
            </FormGroup>
            <ActionButton type="submit">Save Changes</ActionButton>
            <ActionButton type="button" secondary onClick={() => setIsEditingProfile(false)}>
              Cancel
            </ActionButton>
          </form>
        ) : (
          <div>
            <h2>Account Information</h2>
            <p><strong>Name:</strong> {profileData.user?.name}</p>
            <p><strong>Email:</strong> {profileData.user?.email}</p>
            <p><strong>Phone:</strong> {profileData.user?.phone || 'Not provided'}</p>
            <p><strong>Bio:</strong> {profileData.user?.bio || 'No bio provided'}</p>
            <ActionButton onClick={() => setIsEditingProfile(true)}>Edit Profile</ActionButton>
            <ActionButton onClick={() => logout()}>Logout</ActionButton>
            <ActionButton danger onClick={() => handleDeleteAccount()}>Delete Account</ActionButton>
          </div>
        )}
      </ProfileSection>

      <ProfileSection>
        <h2>Saved Addresses</h2>
        {isAddingAddress ? (
          <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress}>
            <FormGroup>
              <Label>Street:</Label>
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
            <ActionButton type="submit">
              {editingAddressId ? 'Update Address' : 'Save Address'}
            </ActionButton>
            <ActionButton 
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
            </ActionButton>
          </form>
        ) : (
          <ActionButton onClick={() => setIsAddingAddress(true)}>Add New Address</ActionButton>
        )}
        
        {addresses.map(address => (
          <AddressCard key={address._id}>
            <p>{address.street}</p>
            <p>{address.city}, {address.state} {address.zipCode}</p>
            <p>{address.country}</p>
            <AddressActions>
              <ActionButton onClick={() => handleEditAddress(address)}>Edit</ActionButton>
              <ActionButton danger onClick={() => handleDeleteAddress(address._id)}>Delete</ActionButton>
            </AddressActions>
          </AddressCard>
        ))}
      </ProfileSection>

      <ProfileSection>
        <h2>Order History</h2>
        <OrderHistory>
          {profileData.orders.length === 0 ? (
            <div>
              <p>No orders yet.</p>
              <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
            </div>
          ) : (
            profileData.orders.map(order => (
              <OrderCard key={order._id}>
                <h3>Order #{order._id}</h3>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                <Link to={`/order/${order._id}`}>View Details</Link>
              </OrderCard>
            ))
          )}
        </OrderHistory>
      </ProfileSection>

      <ProfileSection>
        <h2>Payment Methods</h2>
        {/* Add payment methods functionality here */}
        <p>Coming soon...</p>
      </ProfileSection>
    </ProfileContainer>
  );
}

export default Profile;
