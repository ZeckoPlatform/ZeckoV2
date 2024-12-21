import React from 'react';
import { Navigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper,
    Button,
    Card,
    CardContent,
    CardActions
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    console.log('Dashboard user:', user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const renderRegularDashboard = () => (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" gutterBottom>
                    Welcome back, {user.username}!
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/leads/new')}
                >
                    Add New Lead
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Quick Actions */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Quick Actions
                        </Typography>
                        <Box display="flex" gap={2}>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/leads/new')}
                            >
                                Post Lead
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ViewIcon />}
                                onClick={() => navigate('/leads')}
                            >
                                View Leads
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => navigate('/profile')}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Recent Leads */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Leads
                        </Typography>
                        <Grid container spacing={2}>
                            {/* Sample Lead Cards - Replace with actual data */}
                            {[1, 2, 3].map((item) => (
                                <Grid item xs={12} key={item}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6">
                                                Sample Lead {item}
                                            </Typography>
                                            <Typography color="textSecondary">
                                                Posted: {new Date().toLocaleDateString()}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button size="small" startIcon={<ViewIcon />}>
                                                View
                                            </Button>
                                            <Button size="small" startIcon={<EditIcon />}>
                                                Edit
                                            </Button>
                                            <Button size="small" startIcon={<DeleteIcon />}>
                                                Delete
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Profile Summary */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Profile Summary
                        </Typography>
                        <Box>
                            <Typography>
                                <strong>Email:</strong> {user.email}
                            </Typography>
                            <Typography>
                                <strong>Account Type:</strong> {user.accountType}
                            </Typography>
                            <Typography>
                                <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
                            </Typography>
                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={() => navigate('/profile')}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
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
        console.log('Account type:', user.accountType);

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