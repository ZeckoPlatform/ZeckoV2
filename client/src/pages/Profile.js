import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import styled from 'styled-components';

const StyledPaper = styled(Paper)`
    padding: 24px;
    margin-bottom: 24px;
`;

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState(() => {
        // Try to load from localStorage first
        const savedData = localStorage.getItem('profileFormData');
        return savedData ? JSON.parse(savedData) : {
            username: user?.username || '',
            email: user?.email || '',
            businessName: user?.businessName || '',
            phone: user?.phone || '',
            location: user?.location || '',
            bio: user?.bio || ''
        };
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Save form data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('profileFormData', JSON.stringify(formData));
    }, [formData]);

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
            console.log('Submitting profile data:', formData);

            const response = await api.put('/api/users/profile', formData);
            
            if (response.data) {
                console.log('Server response:', response.data);
                
                // Update both local state and global context
                const updatedData = response.data;
                setFormData(prev => ({
                    ...prev,
                    ...updatedData
                }));
                updateUser(updatedData);
                
                // Clear localStorage after successful save
                localStorage.removeItem('profileFormData');
                
                setSuccess(true);
                
                // Refresh the page to ensure all components update
                window.location.reload();
            }
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.response?.data?.error || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    // Add effect to log when form data changes
    useEffect(() => {
        console.log('Form data changed:', formData);
    }, [formData]);

    // Add effect to log when user data changes
    useEffect(() => {
        console.log('User data changed:', user);
    }, [user]);

    return (
        <Container maxWidth="md">
            <Box py={4}>
                <Typography variant="h4" gutterBottom>
                    Profile Settings
                </Typography>

                <form onSubmit={handleSubmit}>
                    <StyledPaper>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    helperText="Choose a unique username"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    helperText="Email cannot be changed"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Business Name"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                />
                            </Grid>
                        </Grid>
                    </StyledPaper>

                    <Box mt={3} display="flex" justifyContent="flex-end">
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </form>
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

export default Profile;
