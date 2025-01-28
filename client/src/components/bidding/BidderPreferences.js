import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Switch,
    FormGroup,
    FormControlLabel,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';

const BidderPreferences = () => {
    const [preferences, setPreferences] = useState({
        notifyOutbid: true,
        notifyAuctionEnd: true,
        notifyWatchedItems: true,
        autoBidEnabled: false,
        maxBidAmount: '',
        bidIncrement: '',
        preferredCategories: [],
        emailNotifications: true
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            return response.json();
        }
    });

    const { data: savedPreferences, isLoading } = useQuery({
        queryKey: ['bidderPreferences'],
        queryFn: async () => {
            const response = await fetch('/api/bidder/preferences');
            if (!response.ok) throw new Error('Failed to fetch preferences');
            return response.json();
        },
        onSuccess: (data) => {
            setPreferences(prev => ({
                ...prev,
                ...data.data
            }));
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (newPreferences) => {
            const response = await fetch('/api/bidder/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPreferences)
            });
            if (!response.ok) throw new Error('Failed to update preferences');
            return response.json();
        }
    });

    const handleChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' 
            ? event.target.checked 
            : event.target.value;

        setPreferences(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(preferences);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Bidding Preferences
            </Typography>

            {updateMutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {updateMutation.error.message}
                </Alert>
            )}

            {updateMutation.isSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Preferences updated successfully
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <FormGroup>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                        Notifications
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={preferences.notifyOutbid}
                                onChange={handleChange('notifyOutbid')}
                            />
                        }
                        label="Notify me when I'm outbid"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={preferences.notifyAuctionEnd}
                                onChange={handleChange('notifyAuctionEnd')}
                            />
                        }
                        label="Notify me when auctions I'm participating in are ending"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={preferences.notifyWatchedItems}
                                onChange={handleChange('notifyWatchedItems')}
                            />
                        }
                        label="Notify me about watched items"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={preferences.emailNotifications}
                                onChange={handleChange('emailNotifications')}
                            />
                        }
                        label="Receive email notifications"
                    />

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" gutterBottom>
                        Auto-Bidding
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={preferences.autoBidEnabled}
                                onChange={handleChange('autoBidEnabled')}
                            />
                        }
                        label="Enable auto-bidding by default"
                    />
                    <TextField
                        label="Default Maximum Bid Amount"
                        type="number"
                        value={preferences.maxBidAmount}
                        onChange={handleChange('maxBidAmount')}
                        disabled={!preferences.autoBidEnabled}
                        sx={{ mt: 2 }}
                        fullWidth
                    />
                    <TextField
                        label="Default Bid Increment"
                        type="number"
                        value={preferences.bidIncrement}
                        onChange={handleChange('bidIncrement')}
                        disabled={!preferences.autoBidEnabled}
                        sx={{ mt: 2 }}
                        fullWidth
                    />

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" gutterBottom>
                        Categories of Interest
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Preferred Categories</InputLabel>
                        <Select
                            multiple
                            value={preferences.preferredCategories}
                            onChange={handleChange('preferredCategories')}
                            label="Preferred Categories"
                        >
                            {categories?.data.map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </FormGroup>

                <Box sx={{ mt: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={updateMutation.isLoading}
                    >
                        {updateMutation.isLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            'Save Preferences'
                        )}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default BidderPreferences; 