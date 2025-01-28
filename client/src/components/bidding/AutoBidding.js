import React, { useState } from 'react';
import {
    Box,
    Typography,
    Switch,
    TextField,
    Button,
    Alert,
    Paper,
    FormControlLabel,
    CircularProgress
} from '@mui/material';
import { formatCurrency } from '@/utils/format';

const AutoBidding = ({ product, onSetAutoBid, currentAutoBid, isLoading }) => {
    const [maxAmount, setMaxAmount] = useState(currentAutoBid?.maxAmount || '');
    const [enabled, setEnabled] = useState(!!currentAutoBid);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const amount = parseFloat(maxAmount);
        if (isNaN(amount) || amount <= (product.bidding.currentBid || product.bidding.startPrice)) {
            setError('Maximum amount must be greater than current bid');
            return;
        }

        try {
            await onSetAutoBid({
                enabled,
                maxAmount: amount
            });
            if (!enabled) {
                setMaxAmount('');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Automatic Bidding
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
                Set a maximum amount and let the system bid automatically for you up to that amount.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            disabled={isLoading}
                        />
                    }
                    label="Enable Auto-bidding"
                    sx={{ mb: 2 }}
                />

                {enabled && (
                    <TextField
                        fullWidth
                        type="number"
                        label="Maximum Bid Amount"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        disabled={isLoading}
                        InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                        }}
                        sx={{ mb: 2 }}
                    />
                )}

                <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    fullWidth
                >
                    {isLoading ? (
                        <CircularProgress size={24} />
                    ) : (
                        enabled ? 'Update Auto-bid' : 'Disable Auto-bid'
                    )}
                </Button>

                {enabled && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Current bid: {formatCurrency(product.bidding.currentBid || product.bidding.startPrice)}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default AutoBidding; 