import React, { useState } from 'react';
import {
    Box,
    Grid,
    Paper,
    Tabs,
    Tab,
    Typography,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Alert
} from '@mui/material';
import BidManagement from './BidManagement';
import BidAnalytics from './BidAnalytics';
import AuctionMonitor from '../auction/AuctionMonitor';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

const TabPanel = ({ children, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        {...other}
    >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
);

const SellerDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);
    const { user } = useAuth();

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['sellerStats'],
        queryFn: async () => {
            const response = await fetch('/api/seller/stats');
            if (!response.ok) throw new Error('Failed to fetch seller stats');
            return response.json();
        }
    });

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error.message}
            </Alert>
        );
    }

    return (
        <Box>
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Active Auctions
                            </Typography>
                            <Typography variant="h4">
                                {stats?.activeAuctions || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Bids Today
                            </Typography>
                            <Typography variant="h4">
                                {stats?.todayBids || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Completed Auctions
                            </Typography>
                            <Typography variant="h4">
                                {stats?.completedAuctions || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Success Rate
                            </Typography>
                            <Typography variant="h4">
                                {stats?.successRate || 0}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ width: '100%', mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="Active Auctions" />
                    <Tab label="Bid Management" />
                    <Tab label="Analytics" />
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                    <AuctionMonitor sellerView={true} />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    <BidManagement />
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                    <BidAnalytics />
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default SellerDashboard; 