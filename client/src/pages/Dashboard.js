import React from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    LinearProgress,
    Navigate
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useService } from '../contexts/ServiceContext';
import styled from 'styled-components';
import api from '../services/api';

const StyledCard = styled(Card)`
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const StatNumber = styled(Typography)`
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.theme.palette.primary.main};
`;

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { requests } = useService();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const stats = getStats();

    const getStats = () => {
        switch (user.accountType) {
            case 'vendor':
                return {
                    totalLeads: requests.length,
                    activeQuotes: requests.filter(r => 
                        r.quotes.some(q => q.provider.toString() === user._id && q.status === 'pending')
                    ).length,
                    wonJobs: requests.filter(r => 
                        r.selectedProvider?.toString() === user._id
                    ).length,
                    responseRate: Math.round(
                        (requests.filter(r => 
                            r.quotes.some(q => q.provider.toString() === user._id)
                        ).length / requests.length) * 100
                    )
                };
            case 'business':
                return {
                    activeRequests: requests.filter(r => r.status === 'active').length,
                    receivedQuotes: requests.reduce((acc, r) => acc + r.quotes.length, 0),
                    completedJobs: requests.filter(r => r.status === 'completed').length,
                    totalSpent: requests
                        .filter(r => r.status === 'completed')
                        .reduce((acc, r) => acc + (r.finalPrice || 0), 0)
                };
            case 'personal':
                return {
                    activeRequests: requests.filter(r => r.status === 'active').length,
                    receivedQuotes: requests.reduce((acc, r) => acc + r.quotes.length, 0),
                    completedJobs: requests.filter(r => r.status === 'completed').length
                };
            default:
                return {};
        }
    };

    const renderVendorDashboard = () => (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Available Leads
                            </Typography>
                            <StatNumber>{stats.totalLeads}</StatNumber>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Active Quotes
                            </Typography>
                            <StatNumber>{stats.activeQuotes}</StatNumber>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Won Jobs
                            </Typography>
                            <StatNumber>{stats.wonJobs}</StatNumber>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Response Rate
                            </Typography>
                            <Box display="flex" alignItems="center">
                                <StatNumber>{stats.responseRate}%</StatNumber>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={stats.responseRate} 
                                    sx={{ ml: 2, flexGrow: 1 }}
                                />
                            </Box>
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>

            <Box mt={4}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    onClick={() => navigate('/lead')}
                >
                    View Available Leads
                </Button>
            </Box>
        </>
    );

    const renderBusinessDashboard = () => (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Active Requests
                            </Typography>
                            <StatNumber>{stats.activeRequests}</StatNumber>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Received Quotes
                            </Typography>
                            <StatNumber>{stats.receivedQuotes}</StatNumber>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Completed Jobs
                            </Typography>
                            <StatNumber>{stats.completedJobs}</StatNumber>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={3}>
                    <StyledCard>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Spent
                            </Typography>
                            <StatNumber>${stats.totalSpent.toFixed(2)}</StatNumber>
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>

            <Box mt={4} display="flex" gap={2}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    onClick={() => navigate('/services')}
                >
                    Post New Request
                </Button>
                <Button 
                    variant="outlined" 
                    color="primary" 
                    size="large"
                    onClick={() => navigate('/business/analytics')}
                >
                    View Analytics
                </Button>
            </Box>
        </>
    );

    const renderPersonalDashboard = () => (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Active Requests
                            </Typography>
                            <StatNumber>{stats.activeRequests}</StatNumber>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Received Quotes
                            </Typography>
                            <StatNumber>{stats.receivedQuotes}</StatNumber>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={4}>
                    <StyledCard>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Completed Jobs
                            </Typography>
                            <StatNumber>{stats.completedJobs}</StatNumber>
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>

            <Box mt={4}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    onClick={() => navigate('/services')}
                >
                    Post New Request
                </Button>
            </Box>
        </>
    );

    const getDashboardByAccountType = () => {
        switch (user.accountType) {
            case 'vendor':
                return renderVendorDashboard();
            case 'business':
                return renderBusinessDashboard();
            case 'personal':
                return renderPersonalDashboard();
            case 'admin':
                return <Navigate to="/admin" replace />;
            default:
                return (
                    <Typography color="error">
                        Account type not recognized: {user.accountType}
                    </Typography>
                );
        }
    };

    return (
        <Container>
            <Box py={4}>
                <Typography variant="h4" gutterBottom>
                    Welcome back, {user.name}!
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                    {user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)} Account
                </Typography>
                
                {getDashboardByAccountType()}
            </Box>
        </Container>
    );
};

export default Dashboard;