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
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Chip,
    Stack,
    Card,
    CardContent,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    DateRangePicker,
    LocalizationProvider
} from '@mui/x-date-pickers-pro';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    DownloadOutlined as DownloadIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    PictureAsPdf as PdfIcon,
    TableChart as ExcelIcon,
    Code as JsonIcon,
    TrendingUp as TrendingUpIcon,
    Assessment as AssessmentIcon,
    LocationOn as LocationIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const MatchReportDashboard = () => {
    const [timeRange, setTimeRange] = useState('month');
    const [filters, setFilters] = useState({});
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [exportFormat, setExportFormat] = useState('pdf');
    const [selectedView, setSelectedView] = useState('summary');

    const { data: report, isLoading, refetch } = useQuery({
        queryKey: ['matchReport', timeRange, filters],
        queryFn: async () => {
            const response = await fetch('/api/matches/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timeRange,
                    filters
                })
            });
            if (!response.ok) throw new Error('Failed to fetch report');
            return response.json();
        }
    });

    const exportReport = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/matches/reports/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timeRange,
                    filters,
                    format: exportFormat
                })
            });
            
            if (!response.ok) throw new Error('Failed to export report');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `match-report-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
            a.click();
        }
    });

    const renderSummaryMetrics = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Total Matches
                        </Typography>
                        <Typography variant="h4">
                            {report?.summary.totalMatches}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Success Rate
                        </Typography>
                        <Typography variant="h4">
                            {report?.summary.successRate.toFixed(1)}%
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Average Score
                        </Typography>
                        <Typography variant="h4">
                            {report?.summary.averageMatchScore.toFixed(1)}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Avg. Completion Time
                        </Typography>
                        <Typography variant="h4">
                            {report?.summary.averageCompletionTime.toFixed(1)} days
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderTrendsChart = () => (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Match Trends
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={report?.trends.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip />
                    <Legend />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="totalMatches"
                        stroke="#2196f3"
                        name="Total Matches"
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="successRate"
                        stroke="#4caf50"
                        name="Success Rate (%)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </Paper>
    );

    const renderCategoryAnalysis = () => (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Category Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={report?.categoryAnalysis}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        label
                    >
                        {report?.categoryAnalysis.map((entry, index) => (
                            <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Paper>
    );

    const renderLocationAnalysis = () => (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Location Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={report?.locationAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#2196f3" name="Total Matches" />
                    <Bar dataKey="successful" fill="#4caf50" name="Successful Matches" />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Match Reports</Typography>
                <Stack direction="row" spacing={2}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
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
                    <Button
                        startIcon={<FilterIcon />}
                        onClick={() => setShowFilterDialog(true)}
                    >
                        Filters
                    </Button>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={() => refetch()}
                    >
                        Refresh
                    </Button>
                    <Button
                        startIcon={<DownloadIcon />}
                        onClick={() => exportReport.mutate()}
                        disabled={exportReport.isLoading}
                    >
                        Export
                    </Button>
                </Stack>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {renderSummaryMetrics()}
                    {renderTrendsChart()}
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            {renderCategoryAnalysis()}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {renderLocationAnalysis()}
                        </Grid>
                    </Grid>
                </>
            )}

            <Dialog
                open={showFilterDialog}
                onClose={() => setShowFilterDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Filter Report</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status || ''}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        status: e.target.value
                                    }))}
                                    label="Status"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="failed">Failed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Minimum Score"
                                type="number"
                                value={filters.minScore || ''}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    minScore: e.target.value
                                }))}
                                InputProps={{
                                    inputProps: { min: 0, max: 100 }
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowFilterDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setShowFilterDialog(false);
                            refetch();
                        }}
                    >
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MatchReportDashboard; 