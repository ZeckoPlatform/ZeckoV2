import React, { useState } from 'react';
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
    Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useService } from '../contexts/ServiceContext';
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
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        businessProfile: user.businessProfile || {
            companyName: '',
            businessType: '',
            services: [],
            coverage: {
                radius: 0,
                locations: []
            }
        }
    });

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
        try {
            const response = await api.patch('/api/users/profile', {
                ...formData,
                username: formData.username.trim()
            });
            
            if (response.data) {
                updateUser(response.data);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <Container>
            <Box py={4}>
                <Typography variant="h4" gutterBottom>Profile Settings</Typography>
                
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Basic Information" />
                    {user.role === 'vendor' && <Tab label="Business Profile" />}
                    <Tab label="Preferences" />
                </Tabs>

                <form onSubmit={handleSubmit}>
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
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        helperText="You can change your username"
                                        required
                                        inputProps={{
                                            minLength: 3,
                                            maxLength: 30
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
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
                                        label="Phone"
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Bio"
                                        name="bio"
                                        value={formData.bio || ''}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={4}
                                    />
                                </Grid>
                            </Grid>
                        </StyledPaper>
                    </TabPanel>

                    {user.role === 'vendor' && (
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

                    <TabPanel value={tabValue} index={user.role === 'vendor' ? 2 : 1}>
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
                        >
                            Save Changes
                        </Button>
                    </Box>
                </form>
            </Box>
        </Container>
    );
};

export default Profile;
