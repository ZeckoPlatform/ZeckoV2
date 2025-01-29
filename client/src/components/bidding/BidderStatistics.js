import React from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '../../utils/format';
import { format } from 'date-fns';

const BidderStatistics = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['bidderStats'],
        queryFn: async () => {
            const response = await fetch('/api/bidder/statistics');
            if (!response.ok) throw new Error('Failed to fetch bidder statistics');
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

    const stats = data.data;

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Bids Placed
                            </Typography>
                            <Typography variant="h4">
                                {stats.totalBids}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Auctions Won
                            </Typography>
                            <Typography variant="h4">
                                {stats.auctionsWon}
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
                                {stats.successRate}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6} lg={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Average Bid Amount
                            </Typography>
                            <Typography variant="h4">
                                {formatCurrency(stats.averageBidAmount)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Bidding Activity
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.biddingHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                />
                                <YAxis />
                                <Tooltip 
                                    formatter={(value) => formatCurrency(value)}
                                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#8884d8" 
                                    name="Bid Amount"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Category Distribution
                        </Typography>
                        <Box sx={{ height: 300, display: 'flex', flexDirection: 'column' }}>
                            {stats.categoryDistribution.map((category) => (
                                <Box 
                                    key={category.name} 
                                    sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 1
                                    }}
                                >
                                    <Typography variant="body2">
                                        {category.name}
                                    </Typography>
                                    <Chip 
                                        label={`${category.percentage}%`}
                                        size="small"
                                        color="primary"
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Auction</TableCell>
                                        <TableCell align="right">Bid Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stats.recentBids.map((bid) => (
                                        <TableRow key={bid._id}>
                                            <TableCell>{bid.auction.title}</TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(bid.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={bid.status}
                                                    color={
                                                        bid.status === 'won' ? 'success' :
                                                        bid.status === 'outbid' ? 'error' :
                                                        'default'
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(bid.createdAt), 'MMM d, yyyy HH:mm')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BidderStatistics; 