import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useBidding } from '../../hooks/useBidding';
import BidHistory from './BidHistory';
import BidTimer from './BidTimer';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';

const BiddingSection = ({ product }) => {
    const [bidAmount, setBidAmount] = useState('');
    const [localError, setLocalError] = useState('');
    const { user } = useAuth();
    const {
        bids,
        isLoading,
        error: bidError,
        placeBid,
        isConnected,
        canBid
    } = useBidding(product?._id);

    const handleBid = async (e) => {
        e.preventDefault();
        setLocalError('');

        const amount = parseFloat(bidAmount);
        if (isNaN(amount) || amount < product.bidding.minimumBid) {
            setLocalError(`Minimum bid amount is ${formatCurrency(product.bidding.minimumBid)}`);
            return;
        }

        try {
            await placeBid(amount);
            setBidAmount('');
        } catch (err) {
            setLocalError(err.message);
        }
    };

    if (!product?.bidding?.enabled) {
        return null;
    }

    const isOwner = user?._id === product.seller._id;
    const error = localError || bidError;

    return (
        <Box sx={{ mt: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Current Bid: {formatCurrency(product.bidding.currentBid || product.bidding.startPrice)}
                </Typography>
                {product.bidding.endTime && (
                    <BidTimer 
                        endTime={product.bidding.endTime} 
                        onTimeEnd={() => window.location.reload()}
                    />
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!isConnected && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Connecting to bid service...
                </Alert>
            )}

            <Box component="form" onSubmit={handleBid} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    label="Your Bid"
                    variant="outlined"
                    size="small"
                    disabled={!canBid || isOwner || isLoading}
                    InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    variant="contained"
                    type="submit"
                    disabled={!canBid || isOwner || isLoading}
                    sx={{ minWidth: 100 }}
                >
                    {isLoading ? <CircularProgress size={24} /> : 'Place Bid'}
                </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Minimum bid: {formatCurrency(product.bidding.minimumBid)}
            </Typography>

            <BidHistory bids={bids} isLoading={isLoading} />
        </Box>
    );
};

export default BiddingSection; 