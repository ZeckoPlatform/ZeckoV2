import React, { useState } from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    Card,
    CardContent,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/format';

const AuctionAnalytics = () => {
    const [timeRange, setTimeRange] = useState('7d');

    const { data: analytics, isLoading, error } = useQuery({
        queryKey: ['auctionAnalytics', timeRange],
        queryFn: async () => {
            const response = await fetch(`/api/seller/analytics?timeRange=${timeRange}`);
            if (!response.ok) throw new Error('Failed to fetch analytics');
            return response.json();
        }
    });

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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Auction Analytics</Typography>
                <FormControl size="small" sx={{ width: 120 }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                        value={timeRange}
                        label="Time Range"
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <MenuItem value="7d">7 Days</MenuItem>
                        <MenuItem value="30d">30 Days</MenuItem>
                        <MenuItem value="90d">90 Days</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Revenue
                            </Typography>
                            <Typography variant="h4">
                                {formatCurrency(analytics.data.totalRevenue)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Average Sale Price
                            </Typography>
                            <Typography variant="h4">
                                {formatCurrency(analytics.data.averageSalePrice)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Successful Auctions
                            </Typography>
                            <Typography variant="h4">
                                {analytics.data.successfulAuctions}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Average Bids per Auction
                            </Typography>
                            <Typography variant="h4">
                                {analytics.data.averageBidsPerAuction}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Revenue Trend
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analytics.data.revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Auction Performance
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics.data.auctionPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="successful" name="Successful" fill="#4caf50" />
                                <Bar dataKey="failed" name="Failed" fill="#f44336" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AuctionAnalytics; 