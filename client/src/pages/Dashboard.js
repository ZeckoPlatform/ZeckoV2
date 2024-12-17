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
    LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useService } from '../contexts/ServiceContext';
import styled from 'styled-components';

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

    const getStats = () => {
        if (user.role === 'vendor') {
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
        }
        return {
            activeRequests: requests.filter(r => r.status === 'active').length,
            receivedQuotes: requests.reduce((acc, r) => acc + r.quotes.length, 0),
            completedJobs: requests.filter(r => r.status === 'completed').length
        };
    };

    const stats = getStats();

    const renderClientDashboard = () => (
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

    const renderProviderDashboard = () => (
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

    return (
        <Container>
            <Box py={4}>
                <Typography variant="h4" gutterBottom>
                    Welcome back, {user.name}!
                </Typography>
                
                {user.role === 'vendor' ? renderProviderDashboard() : renderClientDashboard()}
            </Box>
        </Container>
    );
};

export default Dashboard;