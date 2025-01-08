import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Tabs,
    Tab,
    FormControlLabel,
    Switch,
    Chip,
    Alert,
    Snackbar
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useService } from '../contexts/ServiceContext';
import api from '../services/api';
import styled from 'styled-components';

const StyledPaper = styled(Paper)`
    padding: 24px;
    margin-bottom: 24px;
`;

const TabPanel = ({ children, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        {...other}
    >
        {value === index && <Box p={3}>{children}</Box>}
    </div>
);

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { categories } = useService();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        businessProfile: user?.businessProfile || {
            companyName: '',
            businessType: '',
            services: [],
            coverage: {
                radius: 0,
                locations: []
            }
        },
        preferences: user?.preferences || {
            emailNotifications: true
        }
    });

    // Update form data when user data changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                businessProfile: user.businessProfile || prev.businessProfile,
                preferences: user.preferences || prev.preferences
            }));
        }
    }, [user]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBusinessProfileChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            businessProfile: {
                ...prev.businessProfile,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.patch('/api/users/profile', {
                name: formData.name,
                username: formData.username,
                phone: formData.phone,
                bio: formData.bio,
                businessProfile: formData.businessProfile,
                preferences: formData.preferences
            });

            if (response.data) {
                updateUser(response.data);
                setSuccess(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box py={4}>
                <form onSubmit={handleSubmit}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        centered
                    >
                        <Tab label="Profile" />
                        {user?.role === 'vendor' && <Tab label="Business Profile" />}
                        <Tab label="Settings" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <StyledPaper>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                        helperText="You can change your username"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        value={formData.email}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        helperText="Email cannot be changed"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={4}
                                    />
                                </Grid>
                            </Grid>
                        </StyledPaper>
                    </TabPanel>

                    {user?.role === 'vendor' && (
                        <TabPanel value={tabValue} index={1}>
                            <StyledPaper>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Company Name"
                                            name="companyName"
                                            value={formData.businessProfile.companyName}
                                            onChange={handleBusinessProfileChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Business Type"
                                            name="businessType"
                                            value={formData.businessProfile.businessType}
                                            onChange={handleBusinessProfileChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom>
                                            Service Categories
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                            {categories.map(category => (
                                                <Chip
                                                    key={category._id}
                                                    label={category.name}
                                                    onClick={() => {/* Handle category selection */}}
                                                    color={formData.businessProfile.services.includes(category._id) ? "primary" : "default"}
                                                />
                                            ))}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </StyledPaper>
                        </TabPanel>
                    )}

                    <TabPanel value={tabValue} index={user?.role === 'vendor' ? 2 : 1}>
                        <StyledPaper>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.preferences?.emailNotifications}
                                                onChange={(e) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        preferences: {
                                                            ...prev.preferences,
                                                            emailNotifications: e.target.checked
                                                        }
                                                    }));
                                                }}
                                            />
                                        }
                                        label="Email Notifications"
                                    />
                                </Grid>
                            </Grid>
                        </StyledPaper>
                    </TabPanel>

                    <Box display="flex" justifyContent="flex-end" mt={3}>
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
