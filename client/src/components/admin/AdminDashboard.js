import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Menu,
    MenuItem
} from '@mui/material';
import {
    MoreVert as MoreIcon,
    TrendingUp,
    People,
    Store,
    Assignment
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';

const StyledPaper = styled(Paper)`
    padding: 24px;
    height: 100%;
`;

const StatCard = styled(Card)`
    background: ${props => props.bgcolor || props.theme.palette.primary.main};
    color: white;
`;

const AdminDashboard = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [timeRange, setTimeRange] = useState('week');
    const [stats, setStats] = useState({
        users: 0,
        vendors: 0,
        orders: 0,
        revenue: 0
    });

    useEffect(() => {
        // Fetch dashboard stats
        fetchDashboardStats();
    }, [timeRange]);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch(`/api/admin/stats?range=${timeRange}`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
        handleMenuClose();
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">Admin Dashboard</Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            endIcon={<MoreIcon />}
                            onClick={handleMenuOpen}
                        >
                            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={() => handleTimeRangeChange('day')}>Today</MenuItem>
                            <MenuItem onClick={() => handleTimeRangeChange('week')}>This Week</MenuItem>
                            <MenuItem onClick={() => handleTimeRangeChange('month')}>This Month</MenuItem>
                            <MenuItem onClick={() => handleTimeRangeChange('year')}>This Year</MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Grid>

            {/* Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <People />
                            <Typography variant="subtitle1" ml={1}>Users</Typography>
                        </Box>
                        <Typography variant="h4">{stats.users}</Typography>
                        <Typography variant="body2">Total registered users</Typography>
                    </CardContent>
                </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <StatCard bgcolor="#2196f3">
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Store />
                            <Typography variant="subtitle1" ml={1}>Vendors</Typography>
                        </Box>
                        <Typography variant="h4">{stats.vendors}</Typography>
                        <Typography variant="body2">Active vendors</Typography>
                    </CardContent>
                </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <StatCard bgcolor="#4caf50">
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <Assignment />
                            <Typography variant="subtitle1" ml={1}>Orders</Typography>
                        </Box>
                        <Typography variant="h4">{stats.orders}</Typography>
                        <Typography variant="body2">Total orders</Typography>
                    </CardContent>
                </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <StatCard bgcolor="#ff9800">
                    <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                            <TrendingUp />
                            <Typography variant="subtitle1" ml={1}>Revenue</Typography>
                        </Box>
                        <Typography variant="h4">£{stats.revenue.toLocaleString()}</Typography>
                        <Typography variant="body2">Total revenue</Typography>
                    </CardContent>
                </StatCard>
            </Grid>

            {/* Charts */}
            <Grid item xs={12}>
                <StyledPaper>
                    <Typography variant="h6" gutterBottom>Revenue Overview</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.revenueChart}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </StyledPaper>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
                <StyledPaper>
                    <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Action</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Details</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats.recentActivity?.map((activity) => (
                                <TableRow key={activity._id}>
                                    <TableCell>{activity.action}</TableCell>
                                    <TableCell>{activity.user}</TableCell>
                                    <TableCell>{activity.details}</TableCell>
                                    <TableCell>{new Date(activity.date).toLocaleString()}</TableCell>
                                    <TableCell>{activity.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </StyledPaper>
            </Grid>
        </Grid>
    );
};

export default AdminDashboard; 