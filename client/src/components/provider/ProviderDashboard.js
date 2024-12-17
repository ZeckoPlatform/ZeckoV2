import React from 'react';
import { 
    Grid, 
    Paper, 
    Typography, 
    Box, 
    Card, 
    CardContent,
    Button 
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useService } from '../../contexts/ServiceContext';
import styled from 'styled-components';

const DashboardCard = styled(Card)`
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const StatsContainer = styled(Box)`
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const StatItem = styled(Box)`
    text-align: center;
`;

const ProviderDashboard = () => {
    const { user } = useAuth();
    const { requests } = useService();

    const stats = {
        totalLeads: requests.length,
        quotedLeads: requests.filter(r => r.quotes.some(q => 
            q.provider.toString() === user._id)).length,
        activeJobs: requests.filter(r => 
            r.status === 'in_progress' && 
            r.selectedProvider?.toString() === user._id).length,
        responseRate: '85%' // This should be calculated from actual data
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Provider Dashboard
            </Typography>
            
            <StatsContainer>
                <StatItem>
                    <Typography variant="h6">{stats.totalLeads}</Typography>
                    <Typography color="textSecondary">Available Leads</Typography>
                </StatItem>
                <StatItem>
                    <Typography variant="h6">{stats.quotedLeads}</Typography>
                    <Typography color="textSecondary">Quoted</Typography>
                </StatItem>
                <StatItem>
                    <Typography variant="h6">{stats.activeJobs}</Typography>
                    <Typography color="textSecondary">Active Jobs</Typography>
                </StatItem>
                <StatItem>
                    <Typography variant="h6">{stats.responseRate}</Typography>
                    <Typography color="textSecondary">Response Rate</Typography>
                </StatItem>
            </StatsContainer>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <DashboardCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Recent Leads
                            </Typography>
                            {/* Add LeadsList component here */}
                        </CardContent>
                    </DashboardCard>
                </Grid>
                
                <Grid item xs={12} md={4}>
                    <DashboardCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Profile Completion
                            </Typography>
                            {/* Add ProfileCompletion component here */}
                        </CardContent>
                    </DashboardCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProviderDashboard; 