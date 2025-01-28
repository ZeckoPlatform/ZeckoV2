import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Card,
    CardContent,
    IconButton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    TrendingUp,
    TrendingDown,
    LocationOn,
    Category
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const MatchReportDashboard = () => {
    const [timeRange, setTimeRange] = useState('month');
    const [reportFormat, setReportFormat] = useState('json');

    const { data: reportData, isLoading } = useQuery({
        queryKey: ['matchReport', timeRange],
        queryFn: async () => {
            const response = await fetch(`/api/admin/match-report?timeRange=${timeRange}`);
            if (!response.ok) throw new Error('Failed to fetch report data');
            return response.json();
        }
    });

    const handleDownloadReport = async () => {
        const response = await fetch(
            `/api/admin/match-report/download?timeRange=${timeRange}&format=${reportFormat}`,
            { method: 'POST' }
        );
        
        if (!response.ok) throw new Error('Failed to download report');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `match-report-${timeRange}.${reportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const renderSummaryCards = () => (
        <Grid container spacing={3}>
            {Object.entries(reportData.summary).map(([metric, value]) => (
                <Grid item xs={12} sm={6} md={4} key={metric}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                {metric.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                            <Typography variant="h4">
                                {typeof value === 'number' ? 
                                    value.toFixed(1) + (metric.includes('Rate') ? '%' : '') :
                                    value}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderTrendsChart = () => (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Match Trends
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={reportData.trends.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip />
                    <Legend />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="totalMatches"
                        stroke="#8884d8"
                        name="Total Matches"
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="successRate"
                        stroke="#82ca9d"
                        name="Success Rate (%)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </Paper>
    );

    const renderCategoryAnalysis = () => (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Category Performance
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={reportData.categoryAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name="Total Matches" />
                    <Bar dataKey="successful" fill="#82ca9d" name="Successful Matches" />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );

    const renderLocationAnalysis = () => (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Location Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={reportData.locationAnalysis}
                        dataKey="total"
                        nameKey="region"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        label
                    >
                        {reportData.locationAnalysis.map((entry, index) => (
                            <Cell key={index} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                        ))}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Paper>
    );

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5">Match Report Dashboard</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small">
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
                    <FormControl size="small">
                        <InputLabel>Format</InputLabel>
                        <Select
                            value={reportFormat}
                            onChange={(e) => setReportFormat(e.target.value)}
                            label="Format"
                        >
                            <MenuItem value="excel">Excel</MenuItem>
                            <MenuItem value="pdf">PDF</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadReport}
                    >
                        Download Report
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    {renderSummaryCards()}
                </Grid>
                <Grid item xs={12}>
                    {renderTrendsChart()}
                </Grid>
                <Grid item xs={12} md={6}>
                    {renderCategoryAnalysis()}
                </Grid>
                <Grid item xs={12} md={6}>
                    {renderLocationAnalysis()}
                </Grid>
            </Grid>
        </Box>
    );
};

export default MatchReportDashboard; 