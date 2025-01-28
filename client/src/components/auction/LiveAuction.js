import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    TextField,
    Chip,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider
} from '@mui/material';
import { formatDistance } from 'date-fns';
import { useBidUpdates } from '@/hooks/useBidUpdates';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/format';
import BidTimer from './BidTimer';
import OptimizedImage from '../common/OptimizedImage';

const LiveAuction = ({ auction }) => {
    const { user } = useAuth();
    const [bidAmount, setBidAmount] = useState('');
    const [error, setError] = useState(null);
    const {
        currentBid,
        bidHistory,
        isLoading,
        placeBid
    } = useBidUpdates(auction._id);

    const handleBid = useCallback(async (e) => {
        e.preventDefault();
        setError(null);

        try {
            if (!bidAmount || parseFloat(bidAmount) <= currentBid) {
                throw new Error('Bid must be higher than current bid');
            }

            await placeBid(parseFloat(bidAmount));
            setBidAmount('');
        } catch (err) {
            setError(err.message);
        }
    }, [currentBid, placeBid]);

    const getMinBidAmount = () => {
        return currentBid ? currentBid + auction.bidding.incrementAmount : auction.bidding.startPrice;
    };

    const isUserHighestBidder = user && currentBid && auction.bidding.currentWinner === user._id;

    return (
        <div className="live-auction">
            <div className="auction-images">
                <OptimizedImage
                    src={auction.mainImage}
                    alt={auction.title}
                    width={600}
                    height={400}
                    className="auction-main-image"
                />
                <div className="auction-thumbnails">
                    {auction.additionalImages?.map((image, index) => (
                        <OptimizedImage
                            key={index}
                            src={image}
                            alt={`${auction.title} view ${index + 1}`}
                            width={100}
                            height={100}
                            className="auction-thumbnail"
                        />
                    ))}
                </div>
            </div>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5">
                                Current Bid: {formatCurrency(currentBid || auction.bidding.startPrice)}
                            </Typography>
                            <BidTimer 
                                endTime={auction.bidding.endTime}
                                onEnd={() => window.location.reload()}
                            />
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {isUserHighestBidder && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                You are the highest bidder!
                            </Alert>
                        )}

                        <form onSubmit={handleBid}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    label="Your Bid"
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: '$',
                                        min: getMinBidAmount()
                                    }}
                                    helperText={`Minimum bid: ${formatCurrency(getMinBidAmount())}`}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={!user || isLoading}
                                >
                                    {isLoading ? <CircularProgress size={24} /> : 'Place Bid'}
                                </Button>
                            </Box>
                        </form>

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Quick Bid
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {[1, 2, 5, 10].map(multiplier => {
                                    const quickBidAmount = getMinBidAmount() * multiplier;
                                    return (
                                        <Button
                                            key={multiplier}
                                            variant="outlined"
                                            onClick={() => setBidAmount(quickBidAmount.toString())}
                                        >
                                            {formatCurrency(quickBidAmount)}
                                        </Button>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Bid History
                        </Typography>
                        {isLoading ? (
                            <CircularProgress />
                        ) : (
                            <List>
                                {bidHistory.map((bid, index) => (
                                    <React.Fragment key={bid._id}>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar src={bid.bidder.avatar} />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={formatCurrency(bid.amount)}
                                                secondary={`${bid.bidder.name} • ${formatDistance(new Date(bid.createdAt), new Date(), { addSuffix: true })}`}
                                            />
                                            {bid.bidder._id === user?._id && (
                                                <Chip size="small" label="Your Bid" color="primary" />
                                            )}
                                        </ListItem>
                                        {index < bidHistory.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Auction Details
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography color="textSecondary" gutterBottom>
                                Starting Price
                            </Typography>
                            <Typography variant="h6">
                                {formatCurrency(auction.bidding.startPrice)}
                            </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography color="textSecondary" gutterBottom>
                                Bid Increment
                            </Typography>
                            <Typography variant="h6">
                                {formatCurrency(auction.bidding.incrementAmount)}
                            </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography color="textSecondary" gutterBottom>
                                Total Bids
                            </Typography>
                            <Typography variant="h6">
                                {bidHistory.length}
                            </Typography>
                        </Box>
                        {auction.bidding.reservePrice && (
                            <Box sx={{ mb: 2 }}>
                                <Typography color="textSecondary" gutterBottom>
                                    Reserve Price
                                </Typography>
                                <Typography variant="h6">
                                    {formatCurrency(auction.bidding.reservePrice)}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default LiveAuction; 