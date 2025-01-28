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
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Stack,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Security as SecurityIcon,
    Warning as AlertIcon,
    Block as BlockIcon,
    Visibility as MonitorIcon,
    Settings as RulesIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

const SecurityMonitor = () => {
    const [timeRange, setTimeRange] = useState('24h');
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [showRulesDialog, setShowRulesDialog] = useState(false);

    const { data: securityMetrics, isLoading: loadingMetrics } = useQuery({
        queryKey: ['securityMetrics', timeRange],
        queryFn: async () => {
            const response = await fetch(`/api/security/metrics?timeRange=${timeRange}`);
            if (!response.ok) throw new Error('Failed to fetch security metrics');
            return response.json();
        },
        refetchInterval: 30000 // Refresh every 30 seconds
    });

    const { data: securityAlerts } = useQuery({
        queryKey: ['securityAlerts'],
        queryFn: async () => {
            const response = await fetch('/api/security/alerts');
            if (!response.ok) throw new Error('Failed to fetch security alerts');
            return response.json();
        },
        refetchInterval: 15000 // Refresh every 15 seconds
    });

    const handleAlert = useMutation({
        mutationFn: async (alertId) => {
            const response = await fetch(`/api/security/alerts/${alertId}/handle`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to handle alert');
            return response.json();
        }
    });

    const renderMetrics = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Security Score
                        </Typography>
                        <Typography variant="h4" color={
                            securityMetrics?.score > 80 ? 'success.main' :
                            securityMetrics?.score > 60 ? 'warning.main' :
                            'error.main'
                        }>
                            {securityMetrics?.score}%
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Active Threats
                        </Typography>
                        <Typography variant="h4" color="error.main">
                            {securityMetrics?.activeThreats || 0}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Blocked Attempts
                        </Typography>
                        <Typography variant="h4">
                            {securityMetrics?.blockedAttempts || 0}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Active Rules
                        </Typography>
                        <Typography variant="h4">
                            {securityMetrics?.activeRules || 0}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderAlerts = () => (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Security Alerts</Typography>
                <Button
                    startIcon={<RulesIcon />}
                    onClick={() => setShowRulesDialog(true)}
                >
                    Security Rules
                </Button>
            </Box>
            <List>
                {securityAlerts?.map((alert) => (
                    <ListItem
                        key={alert._id}
                        button
                        onClick={() => setSelectedAlert(alert)}
                    >
                        <ListItemIcon>
                            {alert.severity === 'high' ? (
                                <AlertIcon color="error" />
                            ) : alert.severity === 'medium' ? (
                                <AlertIcon color="warning" />
                            ) : (
                                <AlertIcon color="info" />
                            )}
                        </ListItemIcon>
                        <ListItemText
                            primary={alert.type}
                            secondary={format(
                                new Date(alert.timestamp),
                                'MMM d, yyyy HH:mm:ss'
                            )}
                        />
                        <Chip
                            label={alert.status}
                            color={
                                alert.status === 'resolved'
                                    ? 'success'
                                    : alert.status === 'investigating'
                                    ? 'warning'
                                    : 'error'
                            }
                            size="small"
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );

    const renderTimeline = () => (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Security Events Timeline
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={securityMetrics?.timeline || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                    />
                    <YAxis />
                    <Tooltip
                        labelFormatter={(value) => format(
                            new Date(value),
                            'MMM d, yyyy HH:mm:ss'
                        )}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="threats"
                        stroke="#f44336"
                        name="Threats"
                    />
                    <Line
                        type="monotone"
                        dataKey="blocked"
                        stroke="#2196f3"
                        name="Blocked Attempts"
                    />
                </LineChart>
            </ResponsiveContainer>
        </Paper>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Security Monitor</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
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
            </Box>

            {loadingMetrics ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {renderMetrics()}
                    {renderTimeline()}
                    {renderAlerts()}
                </>
            )}

            <Dialog
                open={!!selectedAlert}
                onClose={() => setSelectedAlert(null)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Alert Details</DialogTitle>
                <DialogContent>
                    {selectedAlert && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Type: {selectedAlert.type}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Severity: {selectedAlert.severity}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Status: {selectedAlert.status}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Timestamp: {format(
                                    new Date(selectedAlert.timestamp),
                                    'MMM d, yyyy HH:mm:ss'
                                )}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mt: 2 }}>
                                Details:
                            </Typography>
                            <pre>
                                {JSON.stringify(selectedAlert.details, null, 2)}
                            </pre>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedAlert(null)}>
                        Close
                    </Button>
                    {selectedAlert?.status !== 'resolved' && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                handleAlert.mutate(selectedAlert._id);
                                setSelectedAlert(null);
                            }}
                            disabled={handleAlert.isLoading}
                        >
                            Handle Alert
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog
                open={showRulesDialog}
                onClose={() => setShowRulesDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Security Rules</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Rule</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Last Updated</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {securityMetrics?.rules?.map((rule) => (
                                    <TableRow key={rule._id}>
                                        <TableCell>{rule.name}</TableCell>
                                        <TableCell>{rule.type}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={rule.status}
                                                color={
                                                    rule.status === 'active'
                                                        ? 'success'
                                                        : 'default'
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {format(
                                                new Date(rule.updatedAt),
                                                'MMM d, yyyy'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowRulesDialog(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SecurityMonitor; 