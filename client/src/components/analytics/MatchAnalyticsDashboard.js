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
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Info as InfoIcon,
    TrendingUp,
    TrendingDown,
    Timeline,
    LocationOn,
    Category,
    AttachMoney
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const MatchAnalyticsDashboard = () => {
    const [timeRange, setTimeRange] = useState(30);
    const [activeTab, setActiveTab] = useState(0);

    const { data: analytics, isLoading } = useQuery({
        queryKey: ['matchAnalytics', timeRange],
        queryFn: async () => {
            const response = await fetch(`/api/analytics/matches?timeRange=${timeRange}`);
            if (!response.ok) throw new Error('Failed to fetch analytics');
            return response.json();
        }
    });

    const renderMetricCard = (title, value, trend, info) => (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" color="textSecondary">
                        {title}
                    </Typography>
                    <Tooltip title={info}>
                        <IconButton size="small">
                            <InfoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Typography variant="h4" component="div">
                    {value}
                </Typography>
                {trend && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {trend > 0 ? (
                            <TrendingUp color="success" />
                        ) : (
                            <TrendingDown color="error" />
                        )}
                        <Typography
                            variant="body2"
                            color={trend > 0 ? 'success.main' : 'error.main'}
                            sx={{ ml: 1 }}
                        >
                            {Math.abs(trend)}% vs last period
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    const renderQualityAnalysis = () => (
        <Box>
            <Typography variant="h6" gutterBottom>
                Match Quality Analysis
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.matchQuality.qualityTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <ChartTooltip />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#8884d8"
                                name="Match Quality"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Factor Analysis
                        </Typography>
                        {Object.entries(analytics.matchQuality.factorAnalysis).map(([factor, analysis]) => (
                            <Box key={factor} sx={{ mb: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    {factor.charAt(0).toUpperCase() + factor.slice(1)}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="h6">
                                        {Math.round(analysis.average * 100)}%
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color={analysis.impact > 0 ? 'success.main' : 'error.main'}
                                    >
                                        {analysis.impact > 0 ? '+' : ''}{Math.round(analysis.impact)}% impact
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );

    // Additional rendering methods for other analytics sections...

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Match Analytics</Typography>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        label="Time Range"
                    >
                        <MenuItem value={7}>Last 7 days</MenuItem>
                        <MenuItem value={30}>Last 30 days</MenuItem>
                        <MenuItem value={90}>Last 90 days</MenuItem>
                        <MenuItem value={365}>Last year</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{ mb: 3 }}
            >
                <Tab label="Quality Analysis" />
                <Tab label="Performance Metrics" />
                <Tab label="Lead Insights" />
                <Tab label="Competitive Analysis" />
                <Tab label="Recommendations" />
            </Tabs>

            {activeTab === 0 && renderQualityAnalysis()}
            {/* Render other tabs... */}
        </Box>
    );
};

export default MatchAnalyticsDashboard; 