import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Grid
} from '@mui/material';
import {
    Upload as UploadIcon,
    Download as DownloadIcon,
    Description as FileIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';

const MatchExportImport = () => {
    const [exportFormat, setExportFormat] = useState('json');
    const [exportFilters, setExportFilters] = useState({
        dateRange: 'all',
        status: 'all'
    });
    const [importResults, setImportResults] = useState(null);
    const [showImportDialog, setShowImportDialog] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            handleImport(acceptedFiles[0]);
        },
        accept: {
            'application/json': ['.json'],
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        }
    });

    const exportMatches = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/matches/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    format: exportFormat,
                    filters: exportFilters
                })
            });

            if (!response.ok) throw new Error('Export failed');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `matches-export.${exportFormat}`;
            a.click();
        }
    });

    const importMatches = useMutation({
        mutationFn: async (formData) => {
            const response = await fetch('/api/matches/import', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Import failed');
            return response.json();
        },
        onSuccess: (data) => {
            setImportResults(data.results);
            setShowImportDialog(true);
        }
    });

    const handleImport = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', file.name.split('.').pop());
        importMatches.mutate(formData);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Export & Import Matches
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Export Matches
                        </Typography>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Export Format</InputLabel>
                            <Select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                                label="Export Format"
                            >
                                <MenuItem value="json">JSON</MenuItem>
                                <MenuItem value="csv">CSV</MenuItem>
                                <MenuItem value="excel">Excel</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Date Range</InputLabel>
                            <Select
                                value={exportFilters.dateRange}
                                onChange={(e) => setExportFilters(prev => ({
                                    ...prev,
                                    dateRange: e.target.value
                                }))}
                                label="Date Range"
                            >
                                <MenuItem value="all">All Time</MenuItem>
                                <MenuItem value="today">Today</MenuItem>
                                <MenuItem value="week">This Week</MenuItem>
                                <MenuItem value="month">This Month</MenuItem>
                                <MenuItem value="year">This Year</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={() => exportMatches.mutate()}
                            disabled={exportMatches.isLoading}
                            fullWidth
                        >
                            {exportMatches.isLoading ? 'Exporting...' : 'Export Matches'}
                        </Button>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Import Matches
                        </Typography>
                        <Box
                            {...getRootProps()}
                            sx={{
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: 1,
                                p: 3,
                                textAlign: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <input {...getInputProps()} />
                            <UploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                Drag and drop a file here, or click to select
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Supported formats: JSON, CSV, Excel
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Dialog
                open={showImportDialog}
                onClose={() => setShowImportDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Import Results</DialogTitle>
                <DialogContent>
                    {importResults && (
                        <Box>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={3}>
                                    <Typography variant="subtitle2">Total Records</Typography>
                                    <Typography variant="h6">{importResults.total}</Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="subtitle2">Created</Typography>
                                    <Typography variant="h6" color="success.main">
                                        {importResults.created}
                                    </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="subtitle2">Updated</Typography>
                                    <Typography variant="h6" color="info.main">
                                        {importResults.updated}
                                    </Typography>
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography variant="subtitle2">Errors</Typography>
                                    <Typography variant="h6" color="error.main">
                                        {importResults.errors.length}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {importResults.errors.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Error Details
                                    </Typography>
                                    <List>
                                        {importResults.errors.map((error, index) => (
                                            <ListItem key={index}>
                                                <ListItemIcon>
                                                    <ErrorIcon color="error" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={`Error in record ${index + 1}`}
                                                    secondary={error.error}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowImportDialog(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default MatchExportImport; 