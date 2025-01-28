import React, { useState } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Tabs,
    Tab,
    CircularProgress,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip
} from '@mui/material';
import {
    Timeline,
    TrendingUp,
    Assessment,
    Star
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const BusinessMatchDashboard = () => {
    const [timeRange, setTimeRange] = useState('month');
    const [activeTab, setActiveTab] = useState(0);

    const { data: metrics, isLoading } = useQuery({
        queryKey: ['matchMetrics', timeRange],
        queryFn: async () => {
            const response = await fetch(`/api/business/matches/metrics?timeRange=${timeRange}`);
            if (!response.ok) throw new Error('Failed to fetch match metrics');
            return response.json();
        }
    });

    const { data: recentMatches } = useQuery({
        queryKey: ['recentMatches'],
        queryFn: async () => {
            const response = await fetch('/api/business/matches/recent');
            if (!response.ok) throw new Error('Failed to fetch recent matches');
            return response.json();
        }
    });

    const renderMetricCard = (title, value, icon, color) => (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="textSecondary" variant="h6">
                        {title}
                    </Typography>
                    {icon}
                </Box>
                <Typography variant="h4" component="div">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    const renderMatchQualityChart = () => (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics?.qualityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8884d8" 
                    name="Match Quality"
                />
            </LineChart>
        </ResponsiveContainer>
    );

    const renderMatchStatusDistribution = () => (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={metrics?.statusDistribution}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label
                >
                    {metrics?.statusDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Match Dashboard</Typography>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        label="Time Range"
                    >
                        <MenuItem value="week">Last Week</MenuItem>
                        <MenuItem value="month">Last Month</MenuItem>
                        <MenuItem value="quarter">Last Quarter</MenuItem>
                        <MenuItem value="year">Last Year</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    {renderMetricCard(
                        'Match Success Rate',
                        `${metrics.successRate}%`,
                        <TrendingUp color="primary" />,
                        'primary'
                    )}
                </Grid>
                <Grid item xs={12} md={3}>
                    {renderMetricCard(
                        'Average Match Score',
                        `${metrics.averageScore}%`,
                        <Star color="warning" />,
                        'warning'
                    )}
                </Grid>
                <Grid item xs={12} md={3}>
                    {renderMetricCard(
                        'Active Matches',
                        metrics.activeMatches,
                        <Timeline color="info" />,
                        'info'
                    )}
                </Grid>
                <Grid item xs={12} md={3}>
                    {renderMetricCard(
                        'Conversion Rate',
                        `${metrics.conversionRate}%`,
                        <Assessment color="success" />,
                        'success'
                    )}
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_, newValue) => setActiveTab(newValue)}
                            sx={{ mb: 3 }}
                        >
                            <Tab label="Match Quality Trend" />
                            <Tab label="Status Distribution" />
                            <Tab label="Recent Matches" />
                        </Tabs>

                        {activeTab === 0 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Match Quality Over Time
                                </Typography>
                                {renderMatchQualityChart()}
                            </Box>
                        )}

                        {activeTab === 1 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Match Status Distribution
                                </Typography>
                                {renderMatchStatusDistribution()}
                            </Box>
                        )}

                        {activeTab === 2 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    Recent Matches
                                </Typography>
                                {recentMatches?.map((match) => (
                                    <Paper
                                        key={match._id}
                                        sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}
                                    >
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1">
                                                {match.lead.title}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Matched {match.timeAgo}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`${Math.round(match.score * 100)}% Match`}
                                            color={match.score >= 0.8 ? 'success' : 'primary'}
                                            sx={{ mr: 2 }}
                                        />
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => navigate(`/matches/${match._id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </Paper>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BusinessMatchDashboard; 