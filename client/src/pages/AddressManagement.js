import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const PageTitle = styled.h1`
  color: var(--primary-color);
  margin-bottom: 20px;
`;

const AddressCard = styled.div`
  background: white;
  border: 1px solid #ddd;
  padding: 20px;
  margin: 10px 0;
  border-radius: 8px;
  position: relative;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const AddressActions = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.danger ? '#dc3545' : props.secondary ? '#6c757d' : 'var(--primary-color)'};
  color: white;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const AddressForm = styled.form`
  display: grid;
  gap: 15px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 20px 0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin: 10px 0;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #dc3545;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  margin: 10px 0;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #28a745;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  margin: 20px 0;
`;

function AddressManagement() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

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
      setAddresses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
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
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to add address');

      const newAddress = await response.json();
      setAddresses([...addresses, newAddress]);
      setIsAddingAddress(false);
      setFormData({
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
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update address');

      const updatedAddress = await response.json();
      setAddresses(addresses.map(addr => 
        addr._id === editingAddressId ? updatedAddress : addr
      ));
      setEditingAddressId(null);
      setFormData({
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

  const startEditAddress = (address) => {
    setEditingAddressId(address._id);
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country
    });
  };

  if (loading) return <Container>Loading...</Container>;
  if (!user) return <Container>Please log in to manage your addresses.</Container>;

  return (
    <Container>
      <PageTitle>Address Management</PageTitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {!isAddingAddress && !editingAddressId && (
        <Button onClick={() => setIsAddingAddress(true)}>Add New Address</Button>
      )}

      {(isAddingAddress || editingAddressId) && (
        <AddressForm onSubmit={editingAddressId ? handleEditAddress : handleAddAddress}>
          <FormGroup>
            <Label>Street Address:</Label>
            <Input
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              required
              placeholder="Enter street address"
            />
          </FormGroup>
          <FormGroup>
            <Label>City:</Label>
            <Input
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              placeholder="Enter city"
            />
          </FormGroup>
          <FormGroup>
            <Label>State:</Label>
            <Input
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
              placeholder="Enter state"
            />
          </FormGroup>
          <FormGroup>
            <Label>ZIP Code:</Label>
            <Input
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              required
              placeholder="Enter ZIP code"
            />
          </FormGroup>
          <FormGroup>
            <Label>Country:</Label>
            <Input
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              placeholder="Enter country"
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
              setFormData({
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

      {addresses.length === 0 && !isAddingAddress ? (
        <EmptyState>
          <h3>No addresses saved yet</h3>
          <p>Add your first address to get started</p>
        </EmptyState>
      ) : (
        addresses.map(address => (
          <AddressCard key={address._id}>
            <h3>Address</h3>
            <p>{address.street}</p>
            <p>{address.city}, {address.state} {address.zipCode}</p>
            <p>{address.country}</p>
            <AddressActions>
              <Button onClick={() => startEditAddress(address)}>Edit</Button>
              <Button danger onClick={() => handleDeleteAddress(address._id)}>Delete</Button>
            </AddressActions>
          </AddressCard>
        ))
      )}
    </Container>
  );
}

export default AddressManagement; 