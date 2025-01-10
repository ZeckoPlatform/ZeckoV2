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
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        businessName: '',
        phone: '',
        location: '',
        bio: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Load initial data
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const response = await api.get('/api/users/profile');
                console.log('Loaded user data:', response.data);
                
                if (response.data) {
                    setFormData({
                        username: response.data.username || '',
                        email: response.data.email || '',
                        businessName: response.data.businessName || '',
                        phone: response.data.phone || '',
                        location: response.data.location || '',
                        bio: response.data.bio || ''
                    });
                }
            } catch (err) {
                console.error('Error loading user data:', err);
                setError('Failed to load user data');
            }
        };

        loadUserData();
    }, []);

    // Update form when user context changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                username: user.username || prev.username,
                email: user.email || prev.email,
                businessName: user.businessName || prev.businessName,
                phone: user.phone || prev.phone,
                location: user.location || prev.location,
                bio: user.bio || prev.bio
            }));
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
            console.log('Submitting form data:', formData);

            const response = await api.put('/api/users/profile', formData);
            
            console.log('Server response:', response.data);
            
            if (response.data) {
                // Update global context
                updateUser(response.data);
                
                // Update form
                setFormData(prev => ({
                    ...prev,
                    ...response.data
                }));
                
                setSuccess(true);

                // Force reload profile data
                const refreshResponse = await api.get('/api/users/profile');
                if (refreshResponse.data) {
                    setFormData(prev => ({
                        ...prev,
                        ...refreshResponse.data
                    }));
                }
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
