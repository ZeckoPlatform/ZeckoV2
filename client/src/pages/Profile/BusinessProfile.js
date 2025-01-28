import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Snackbar, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import ProfileForm from './components/ProfileForm';
import AddressSection from './components/AddressSection';
import AvatarUpload from './components/AvatarUpload';
import { 
    updateBusinessProfile, 
    addBusinessAddress,
    updateBusinessAddress,
    deleteBusinessAddress,
    setDefaultAddress
} from '../../services/api';

const BusinessProfile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        businessName: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        description: '',
        category: ''
    });
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                businessName: user.businessName || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || '',
                website: user.website || '',
                description: user.description || '',
                category: user.category || ''
            });
            setAddresses(user.addresses || []);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const updatedUser = await updateBusinessProfile(formData);
            updateUser(updatedUser);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async () => {
        try {
            const newAddress = await addBusinessAddress({
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                isDefault: addresses.length === 0
            });
            setAddresses([...addresses, newAddress]);
        } catch (err) {
            setError('Error adding address');
        }
    };

    const handleEditAddress = async (address) => {
        try {
            const updatedAddress = await updateBusinessAddress(address.id, address);
            setAddresses(addresses.map(addr => 
                addr.id === address.id ? updatedAddress : addr
            ));
        } catch (err) {
            setError('Error updating address');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            await deleteBusinessAddress(addressId);
            setAddresses(addresses.filter(addr => addr.id !== addressId));
        } catch (err) {
            setError('Error deleting address');
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            await setDefaultAddress(addressId);
            setAddresses(addresses.map(addr => ({
                ...addr,
                isDefault: addr.id === addressId
            })));
        } catch (err) {
            setError('Error setting default address');
        }
    };

    return (
        <Container maxWidth="md">
            <Box py={4}>
                <Typography variant="h4" gutterBottom>
                    Business Profile
                </Typography>

                <AvatarUpload />

                <ProfileForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    loading={loading}
                    showBusinessFields={true}
                    fields={['email', 'businessName', 'phone', 'location', 'website', 'category', 'description']}
                />

                <AddressSection
                    addresses={addresses}
                    onAddAddress={handleAddAddress}
                    onEditAddress={handleEditAddress}
                    onDeleteAddress={handleDeleteAddress}
                    onSetDefaultAddress={handleSetDefaultAddress}
                />
            </Box>

            <Snackbar 
                open={success} 
                autoHideDuration={6000} 
                onClose={() => setSuccess(false)}
            >
                <Alert severity="success" onClose={() => setSuccess(false)}>
                    Profile updated successfully!
                </Alert>
            </Snackbar>

            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError(null)}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default BusinessProfile; 