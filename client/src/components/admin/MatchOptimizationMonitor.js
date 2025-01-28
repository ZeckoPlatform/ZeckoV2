import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Alert,
    Card,
    CardContent,
    LinearProgress,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Info as InfoIcon,
    TrendingUp,
    TrendingDown,
    Warning
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer
} from 'recharts';

const MatchOptimizationMonitor = () => {
    const queryClient = useQueryClient();
    const [timeRange, setTimeRange] = useState('week');

    const { data: optimizationData, isLoading } = useQuery({
        queryKey: ['matchOptimization', timeRange],
        queryFn: async () => {
            const response = await fetch(`/api/admin/match-optimization?timeRange=${timeRange}`);
            if (!response.ok) throw new Error('Failed to fetch optimization data');
            return response.json();
        }
    });

    const runOptimization = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/admin/match-optimization/run', {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to run optimization');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['matchOptimization']);
        }
    });

    const renderWeightTable = () => (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Factor</TableCell>
                    <TableCell align="right">Current Weight</TableCell>
                    <TableCell align="right">Change</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {optimizationData.weightChanges.map((change) => (
                    <TableRow key={change.factor}>
                        <TableCell>{change.factor}</TableCell>
                        <TableCell align="right">
                            {(change.newWeight * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                {change.change > 0 ? (
                                    <TrendingUp color="success" sx={{ mr: 1 }} />
                                ) : (
                                    <TrendingDown color="error" sx={{ mr: 1 }} />
                                )}
                                {change.change.toFixed(1)}%
                            </Box>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const renderPerformanceMetrics = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Accuracy
                        </Typography>
                        <Typography variant="h4">
                            {(optimizationData.performance.accuracy * 100).toFixed(1)}%
                        </Typography>
                        {optimizationData.performance.improvement && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                {optimizationData.performance.improvement > 0 ? (
                                    <TrendingUp color="success" />
                                ) : (
                                    <TrendingDown color="error" />
                                )}
                                <Typography
                                    variant="body2"
                                    color={optimizationData.performance.improvement > 0 ? 'success.main' : 'error.main'}
                                    sx={{ ml: 1 }}
                                >
                                    {Math.abs(optimizationData.performance.improvement).toFixed(1)}% vs previous
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={8}>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={optimizationData.performance.trend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip />
                        <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#8884d8"
                            name="Accuracy"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Grid>
        </Grid>
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
                <Typography variant="h5">Match Optimization Monitor</Typography>
                <Button
                    variant="contained"
                    onClick={() => runOptimization.mutate()}
                    disabled={runOptimization.isLoading}
                    startIcon={<RefreshIcon />}
                >
                    Run Optimization
                </Button>
            </Box>

            {runOptimization.isSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Optimization completed successfully
                </Alert>
            )}

            {runOptimization.isError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Failed to run optimization: {runOptimization.error.message}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Weight Distribution
                        </Typography>
                        {renderWeightTable()}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Recommendations
                        </Typography>
                        {optimizationData.recommendations.map((rec, index) => (
                            <Alert
                                key={index}
                                severity={rec.type}
                                sx={{ mb: 1 }}
                                icon={rec.type === 'warning' ? <Warning /> : <InfoIcon />}
                            >
                                {rec.message}
                            </Alert>
                        ))}
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Performance Metrics
                        </Typography>
                        {renderPerformanceMetrics()}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MatchOptimizationMonitor; 