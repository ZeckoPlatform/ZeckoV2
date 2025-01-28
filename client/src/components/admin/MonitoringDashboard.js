import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    IconButton,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Stack
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon,
    Timeline as TimelineIcon,
    Speed as SpeedIcon,
    Memory as MemoryIcon,
    Storage as StorageIcon
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
    AreaChart,
    Area
} from 'recharts';
import { format } from 'date-fns';

const MonitoringDashboard = () => {
    const [timeRange, setTimeRange] = useState('24h');
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [showAlertDialog, setShowAlertDialog] = useState(false);

    const { data: metrics, isLoading, refetch } = useQuery({
        queryKey: ['metrics', timeRange],
        queryFn: async () => {
            const response = await fetch(`/api/monitoring/metrics?timeRange=${timeRange}`);
            if (!response.ok) throw new Error('Failed to fetch metrics');
            return response.json();
        },
        refetchInterval: 60000 // Refresh every minute
    });

    const { data: alerts } = useQuery({
        queryKey: ['alerts'],
        queryFn: async () => {
            const response = await fetch('/api/monitoring/alerts');
            if (!response.ok) throw new Error('Failed to fetch alerts');
            return response.json();
        },
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    const formatMetricValue = (value, type = 'number') => {
        switch (type) {
            case 'percentage':
                return `${value.toFixed(2)}%`;
            case 'time':
                return `${value.toFixed(2)}ms`;
            case 'memory':
                return `${(value / 1024 / 1024).toFixed(2)}MB`;
            default:
                return value.toFixed(2);
        }
    };

    const getMetricColor = (value, thresholds) => {
        if (value >= thresholds.critical) return 'error';
        if (value >= thresholds.warning) return 'warning';
        return 'success';
    };

    const renderMetricCard = (title, value, type, thresholds, icon) => (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                        {title}
                    </Typography>
                </Box>
                <Typography
                    variant="h4"
                    color={getMetricColor(value, thresholds)}
                >
                    {formatMetricValue(value, type)}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">System Monitoring</Typography>
                <Stack direction="row" spacing={2}>
                    <FormControl size="small">
                        <InputLabel>Time Range</InputLabel>
                        <Select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            label="Time Range"
                        >
                            <MenuItem value="1h">Last Hour</MenuItem>
                            <MenuItem value="24h">Last 24 Hours</MenuItem>
                            <MenuItem value="7d">Last 7 Days</MenuItem>
                            <MenuItem value="30d">Last 30 Days</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={() => refetch()}
                    >
                        Refresh
                    </Button>
                </Stack>
            </Box>

            {alerts?.active.length > 0 && (
                <Alert
                    severity="warning"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => setShowAlertDialog(true)}
                        >
                            View Details
                        </Button>
                    }
                    sx={{ mb: 3 }}
                >
                    {alerts.active.length} active alerts detected
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* System Health */}
                <Grid item xs={12} md={3}>
                    {renderMetricCard(
                        'CPU Usage',
                        metrics?.system.cpu.usage,
                        'percentage',
                        { warning: 70, critical: 90 },
                        <SpeedIcon />
                    )}
                </Grid>
                <Grid item xs={12} md={3}>
                    {renderMetricCard(
                        'Memory Usage',
                        metrics?.system.memory.usage,
                        'percentage',
                        { warning: 80, critical: 95 },
                        <MemoryIcon />
                    )}
                </Grid>
                <Grid item xs={12} md={3}>
                    {renderMetricCard(
                        'Disk Usage',
                        metrics?.system.disk.usage,
                        'percentage',
                        { warning: 85, critical: 95 },
                        <StorageIcon />
                    )}
                </Grid>
                <Grid item xs={12} md={3}>
                    {renderMetricCard(
                        'Response Time',
                        metrics?.performance.responseTime.overall,
                        'time',
                        { warning: 500, critical: 1000 },
                        <TimelineIcon />
                    )}
                </Grid>

                {/* Charts */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Match Success Rate
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={metrics?.history.matches}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(time) => format(new Date(time), 'HH:mm')}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(time) => format(new Date(time), 'HH:mm:ss')}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="successRate"
                                    stroke="#4caf50"
                                    fill="#4caf50"
                                    fillOpacity={0.3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            System Performance
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={metrics?.history.performance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(time) => format(new Date(time), 'HH:mm')}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(time) => format(new Date(time), 'HH:mm:ss')}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="responseTime"
                                    stroke="#2196f3"
                                    name="Response Time"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="throughput"
                                    stroke="#ff9800"
                                    name="Throughput"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Error Breakdown */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Error Breakdown
                        </Typography>
                        <Grid container spacing={2}>
                            {metrics?.errors.breakdown.map((error) => (
                                <Grid item xs={12} md={4} key={error._id}>
                                    <Card>
                                        <CardContent>
                                            <Typography color="error" gutterBottom>
                                                {error._id}
                                            </Typography>
                                            <Typography variant="h4">
                                                {error.count}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Latest: {error.examples[0]}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog
                open={showAlertDialog}
                onClose={() => setShowAlertDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Active Alerts</DialogTitle>
                <DialogContent>
                    <List>
                        {alerts?.active.map((alert) => (
                            <ListItem key={alert.id}>
                                <ListItemIcon>
                                    {alert.severity === 'critical' ? (
                                        <ErrorIcon color="error" />
                                    ) : (
                                        <WarningIcon color="warning" />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={alert.message}
                                    secondary={format(
                                        new Date(alert.timestamp),
                                        'MMM d, yyyy HH:mm:ss'
                                    )}
                                />
                                <Chip
                                    label={alert.severity}
                                    color={alert.severity === 'critical' ? 'error' : 'warning'}
                                    size="small"
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowAlertDialog(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MonitoringDashboard; 