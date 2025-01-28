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
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    PlayArrow as RunIcon,
    CheckCircle as PassedIcon,
    Error as FailedIcon,
    Warning as WarningIcon,
    Speed as PerformanceIcon,
    BugReport as TestIcon,
    Timeline as CoverageIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3'];

const TestingSuite = () => {
    const [testConfig, setTestConfig] = useState({
        testType: 'all',
        sampleSize: 100,
        scenarios: ['standard', 'edge', 'error']
    });
    const [selectedTest, setSelectedTest] = useState(null);
    const [showTestDetails, setShowTestDetails] = useState(false);

    const runTests = useMutation({
        mutationFn: async (config) => {
            const response = await fetch('/api/testing/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (!response.ok) throw new Error('Failed to run tests');
            return response.json();
        }
    });

    const { data: testHistory, isLoading: loadingHistory } = useQuery({
        queryKey: ['testHistory'],
        queryFn: async () => {
            const response = await fetch('/api/testing/history');
            if (!response.ok) throw new Error('Failed to fetch test history');
            return response.json();
        }
    });

    const renderTestSummary = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Total Tests
                        </Typography>
                        <Typography variant="h4">
                            {runTests.data?.summary.total || 0}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Passed
                        </Typography>
                        <Typography variant="h4" color="success.main">
                            {runTests.data?.summary.passed || 0}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Failed
                        </Typography>
                        <Typography variant="h4" color="error.main">
                            {runTests.data?.summary.failed || 0}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Duration
                        </Typography>
                        <Typography variant="h4">
                            {((runTests.data?.summary.duration || 0) / 1000).toFixed(2)}s
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderTestResults = () => (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Test Results
            </Typography>
            <List>
                {runTests.data?.tests.map((test, index) => (
                    <ListItem
                        key={index}
                        button
                        onClick={() => {
                            setSelectedTest(test);
                            setShowTestDetails(true);
                        }}
                    >
                        <ListItemIcon>
                            {test.status === 'passed' ? (
                                <PassedIcon color="success" />
                            ) : (
                                <FailedIcon color="error" />
                            )}
                        </ListItemIcon>
                        <ListItemText
                            primary={`${test.type} - ${test.description || `Test #${index + 1}`}`}
                            secondary={test.error || `Duration: ${test.duration}ms`}
                        />
                        <Chip
                            label={test.status}
                            color={test.status === 'passed' ? 'success' : 'error'}
                            size="small"
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );

    const renderCoverageChart = () => (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Test Coverage
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={Object.entries(runTests.data?.coverage.byType || {}).map(([key, value]) => ({
                            name: key,
                            value
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                    >
                        {Object.entries(runTests.data?.coverage.byType || {}).map((entry, index) => (
                            <Cell key={entry[0]} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Paper>
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Testing Suite</Typography>
                <Button
                    variant="contained"
                    startIcon={<RunIcon />}
                    onClick={() => runTests.mutate(testConfig)}
                    disabled={runTests.isLoading}
                >
                    Run Tests
                </Button>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Test Type</InputLabel>
                            <Select
                                value={testConfig.testType}
                                onChange={(e) => setTestConfig(prev => ({
                                    ...prev,
                                    testType: e.target.value
                                }))}
                                label="Test Type"
                            >
                                <MenuItem value="all">All Tests</MenuItem>
                                <MenuItem value="unit">Unit Tests</MenuItem>
                                <MenuItem value="integration">Integration Tests</MenuItem>
                                <MenuItem value="performance">Performance Tests</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Sample Size"
                            type="number"
                            value={testConfig.sampleSize}
                            onChange={(e) => setTestConfig(prev => ({
                                ...prev,
                                sampleSize: parseInt(e.target.value, 10)
                            }))}
                            InputProps={{
                                inputProps: { min: 1, max: 1000 }
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {runTests.isLoading ? (
                <Box sx={{ mt: 3 }}>
                    <LinearProgress />
                    <Typography sx={{ mt: 1 }} align="center">
                        Running tests...
                    </Typography>
                </Box>
            ) : runTests.data ? (
                <>
                    {renderTestSummary()}
                    {renderTestResults()}
                    {renderCoverageChart()}
                </>
            ) : null}

            <Dialog
                open={showTestDetails}
                onClose={() => setShowTestDetails(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Test Details</DialogTitle>
                <DialogContent>
                    {selectedTest && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Type: {selectedTest.type}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Status: {selectedTest.status}
                            </Typography>
                            {selectedTest.error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {selectedTest.error}
                                </Alert>
                            )}
                            <Typography variant="subtitle1" sx={{ mt: 2 }}>
                                Test Data:
                            </Typography>
                            <pre>
                                {JSON.stringify(selectedTest.data, null, 2)}
                            </pre>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowTestDetails(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TestingSuite; 