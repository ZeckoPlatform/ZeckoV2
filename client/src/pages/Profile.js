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
        ...user,
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
            await updateUser(formData);
            // Show success message
        } catch (error) {
            // Show error message
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
                                        label="Email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        name="profile.phone"
                                        value={formData.profile?.phone || ''}
                                        onChange={handleInputChange}
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
