import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Snackbar, Alert, Paper, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import ProfileForm from './components/ProfileForm';
import AvatarUpload from './components/AvatarUpload';
import TwoFactorSetup from './components/TwoFactorSetup';
import { updateUserProfile } from '../../services/api';

const UserProfile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        location: '',
        bio: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || '',
                bio: user.bio || ''
            });
            setTwoFactorEnabled(user.twoFactorAuth?.enabled || false);
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
            const updatedUser = await updateUserProfile(formData);
            updateUser(updatedUser);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box py={4}>
                <Typography variant="h4" gutterBottom>
                    Profile Settings
                </Typography>

                <AvatarUpload />

                <ProfileForm
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    loading={loading}
                />

                <Paper sx={{ mt: 4, p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Two-Factor Authentication
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Add an extra layer of security to your account by enabling two-factor authentication.
                    </Typography>
                    
                    {twoFactorEnabled ? (
                        <Button 
                            variant="outlined" 
                            color="error"
                            onClick={() => setShow2FASetup(true)}
                        >
                            Disable Two-Factor Authentication
                        </Button>
                    ) : (
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => setShow2FASetup(true)}
                        >
                            Enable Two-Factor Authentication
                        </Button>
                    )}
                </Paper>

                {show2FASetup && (
                    <TwoFactorSetup
                        open={show2FASetup}
                        onClose={() => setShow2FASetup(false)}
                        enabled={twoFactorEnabled}
                        onSuccess={(enabled) => {
                            setTwoFactorEnabled(enabled);
                            setShow2FASetup(false);
                            setSuccess(true);
                        }}
                    />
                )}
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

export default UserProfile; 