import React, { useState } from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Switch,
    FormControlLabel
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { addHours, addDays } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const AuctionScheduler = ({ productId, onScheduled }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        startTime: addHours(new Date(), 1),
        endTime: addDays(new Date(), 7),
        startPrice: '',
        reservePrice: '',
        automaticStart: true,
        incrementAmount: '',
        duration: '7d'
    });
    const [error, setError] = useState(null);

    const scheduleMutation = useMutation({
        mutationFn: async (data) => {
            const response = await fetch(`/api/auctions/${productId}/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to schedule auction');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['product', productId]);
            onScheduled && onScheduled();
        },
        onError: (error) => {
            setError(error.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        scheduleMutation.mutate(formData);
    };

    const handleDurationChange = (duration) => {
        const endTime = {
            '1d': addDays(formData.startTime, 1),
            '3d': addDays(formData.startTime, 3),
            '7d': addDays(formData.startTime, 7),
            '14d': addDays(formData.startTime, 14),
        }[duration];

        setFormData(prev => ({
            ...prev,
            duration,
            endTime
        }));
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Schedule Auction
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <DateTimePicker
                            label="Start Time"
                            value={formData.startTime}
                            onChange={(newValue) => setFormData(prev => ({
                                ...prev,
                                startTime: newValue
                            }))}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            minDateTime={addHours(new Date(), 1)}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Duration</InputLabel>
                            <Select
                                value={formData.duration}
                                label="Duration"
                                onChange={(e) => handleDurationChange(e.target.value)}
                            >
                                <MenuItem value="1d">1 Day</MenuItem>
                                <MenuItem value="3d">3 Days</MenuItem>
                                <MenuItem value="7d">7 Days</MenuItem>
                                <MenuItem value="14d">14 Days</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Starting Price"
                            type="number"
                            value={formData.startPrice}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                startPrice: e.target.value
                            }))}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Reserve Price (Optional)"
                            type="number"
                            value={formData.reservePrice}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                reservePrice: e.target.value
                            }))}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Minimum Bid Increment"
                            type="number"
                            value={formData.incrementAmount}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                incrementAmount: e.target.value
                            }))}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.automaticStart}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        automaticStart: e.target.checked
                                    }))}
                                />
                            }
                            label="Start auction automatically at scheduled time"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={scheduleMutation.isLoading}
                            sx={{ mr: 2 }}
                        >
                            {scheduleMutation.isLoading ? (
                                <CircularProgress size={24} />
                            ) : (
                                'Schedule Auction'
                            )}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default AuctionScheduler; 