import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Alert,
    CircularProgress
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DateRangePicker from '@mui/lab/DateRangePicker';
import { format } from 'date-fns';

const BidHistoryExport = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exportOptions, setExportOptions] = useState({
        format: 'csv',
        dateRange: [null, null],
        includeDetails: true
    });

    const handleExport = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/bidder/export-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    format: exportOptions.format,
                    startDate: exportOptions.dateRange[0],
                    endDate: exportOptions.dateRange[1],
                    includeDetails: exportOptions.includeDetails
                })
            });

            if (!response.ok) {
                throw new Error('Failed to export bid history');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bid-history-${format(new Date(), 'yyyy-MM-dd')}.${exportOptions.format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={() => setOpen(true)}
            >
                Export Bid History
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Export Bid History</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Format</InputLabel>
                            <Select
                                value={exportOptions.format}
                                onChange={(e) => setExportOptions(prev => ({
                                    ...prev,
                                    format: e.target.value
                                }))}
                                label="Format"
                            >
                                <MenuItem value="csv">CSV</MenuItem>
                                <MenuItem value="xlsx">Excel</MenuItem>
                                <MenuItem value="pdf">PDF</MenuItem>
                            </Select>
                        </FormControl>

                        <DateRangePicker
                            startText="Start Date"
                            endText="End Date"
                            value={exportOptions.dateRange}
                            onChange={(newValue) => setExportOptions(prev => ({
                                ...prev,
                                dateRange: newValue
                            }))}
                            renderInput={(startProps, endProps) => (
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <TextField {...startProps} />
                                    <TextField {...endProps} />
                                </Box>
                            )}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Include Details</InputLabel>
                            <Select
                                value={exportOptions.includeDetails}
                                onChange={(e) => setExportOptions(prev => ({
                                    ...prev,
                                    includeDetails: e.target.value
                                }))}
                                label="Include Details"
                            >
                                <MenuItem value={true}>Full Details</MenuItem>
                                <MenuItem value={false}>Basic Information</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleExport}
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        Export
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default BidHistoryExport; 