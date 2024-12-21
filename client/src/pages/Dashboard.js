import React from 'react';
import { Navigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    console.log('Dashboard user:', user); // Debug log

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const renderRegularDashboard = () => (
        <Box>
            <Typography variant="h4" gutterBottom>
                Welcome back, {user.username}!
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Regular Account
            </Typography>
            <Grid container spacing={3}>
                {/* Regular user dashboard content */}
            </Grid>
        </Box>
    );

    const renderBusinessDashboard = () => (
        <Box>
            <Typography variant="h4" gutterBottom>
                Welcome back, {user.username}!
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Business Account
            </Typography>
            <Grid container spacing={3}>
                {/* Business dashboard content */}
            </Grid>
        </Box>
    );

    const renderVendorDashboard = () => (
        <Box>
            <Typography variant="h4" gutterBottom>
                Welcome back, {user.username}!
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Vendor Account
            </Typography>
            <Grid container spacing={3}>
                {/* Vendor dashboard content */}
            </Grid>
        </Box>
    );

    const getDashboardContent = () => {
        console.log('Account type:', user.accountType); // Debug log

        switch (user.accountType) {
            case 'regular':
                return renderRegularDashboard();
            case 'business':
                return renderBusinessDashboard();
            case 'vendor':
                return renderVendorDashboard();
            default:
                console.error('Unknown account type:', user.accountType);
                return (
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Welcome back, {user.username}!
                        </Typography>
                        <Typography variant="subtitle1" color="error">
                            Account type not recognized: {user.accountType}
                        </Typography>
                    </Box>
                );
        }
    };

    return (
        <Container>
            <Box py={4}>
                {getDashboardContent()}
            </Box>
        </Container>
    );
};

export default Dashboard;