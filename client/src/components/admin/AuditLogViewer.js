import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Download as DownloadIcon,
    Visibility as ViewIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DateRangePicker } from '@mui/lab';

const AuditLogViewer = () => {
    const [filters, setFilters] = useState({
        entityType: '',
        action: '',
        dateRange: null,
        page: 0,
        limit: 25
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['auditLogs', filters],
        queryFn: async () => {
            const params = new URLSearchParams({
                ...filters,
                skip: filters.page * filters.limit
            });
            const response = await fetch(`/api/audit-logs?${params}`);
            if (!response.ok) throw new Error('Failed to fetch audit logs');
            return response.json();
        }
    });

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        
        const response = await fetch(
            `/api/audit-logs/search?q=${encodeURIComponent(searchTerm)}`
        );
        if (!response.ok) throw new Error('Search failed');
        const results = await response.json();
        // Handle search results
    };

    const handleExport = async () => {
        const response = await fetch('/api/audit-logs/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filters)
        });
        
        if (!response.ok) throw new Error('Export failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit-logs.csv';
        a.click();
    };

    const renderActionChip = (action) => {
        const actionColors = {
            create: 'success',
            update: 'info',
            delete: 'error',
            view: 'default'
        };

        return (
            <Chip
                label={action}
                size="small"
                color={actionColors[action.toLowerCase()] || 'default'}
            />
        );
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Audit Logs</Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        startIcon={<FilterIcon />}
                        onClick={() => setShowFilters(true)}
                    >
                        Filters
                    </Button>
                    <Button
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                </Stack>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search audit logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <IconButton size="small" onClick={handleSearch}>
                                <SearchIcon />
                            </IconButton>
                        )
                    }}
                />
            </Box>

            {data?.stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">
                                {data.stats.totalActions}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Actions
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">
                                {data.stats.timeDistribution.last24Hours}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Last 24 Hours
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">
                                {Object.keys(data.stats.actionBreakdown).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Unique Actions
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">
                                {data.stats.userActivityStats.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Active Users
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Entity Type</TableCell>
                            <TableCell>Entity ID</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data?.logs.map((log) => (
                            <TableRow key={log._id}>
                                <TableCell>
                                    {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                                </TableCell>
                                <TableCell>
                                    {renderActionChip(log.action)}
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {log.performedBy.avatar && (
                                            <Avatar
                                                src={log.performedBy.avatar}
                                                sx={{ width: 24, height: 24 }}
                                            />
                                        )}
                                        <Typography variant="body2">
                                            {log.performedBy.name}
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>{log.entityType}</TableCell>
                                <TableCell>{log.entityId}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={data?.totalCount || 0}
                page={filters.page}
                rowsPerPage={filters.limit}
                onPageChange={(_, newPage) => setFilters(prev => ({
                    ...prev,
                    page: newPage
                }))}
                onRowsPerPageChange={(e) => setFilters(prev => ({
                    ...prev,
                    limit: parseInt(e.target.value, 10),
                    page: 0
                }))}
            />

            <FilterDialog
                open={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onApply={(newFilters) => {
                    setFilters(newFilters);
                    setShowFilters(false);
                }}
            />

            <LogDetailsDialog
                open={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                log={selectedLog}
            />
        </Paper>
    );
};

export default AuditLogViewer; 