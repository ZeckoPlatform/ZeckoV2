import React from 'react';
import { 
    Box, 
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemAvatar,
    Avatar,
    Skeleton,
    Paper
} from '@mui/material';
import { formatDistance } from 'date-fns';
import { formatCurrency } from '@/utils/format';
import OptimizedImage from '../common/OptimizedImage';

const BidHistory = ({ bids, isLoading }) => {
    if (isLoading) {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>Bid History</Typography>
                {[1, 2, 3].map((i) => (
                    <ListItem key={i}>
                        <ListItemAvatar>
                            <Skeleton variant="circular" width={40} height={40} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={<Skeleton width="60%" />}
                            secondary={<Skeleton width="40%" />}
                        />
                    </ListItem>
                ))}
            </Box>
        );
    }

    if (!bids?.length) {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>Bid History</Typography>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No bids yet. Be the first to bid!
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Bid History</Typography>
            <List>
                {bids.map((bid, index) => (
                    <ListItem key={index} divider>
                        <ListItemAvatar>
                            <OptimizedImage
                                src={bid.bidder.avatar || '/default-avatar.png'}
                                alt={bid.bidder.name}
                                width={40}
                                height={40}
                                className="bidder-avatar"
                            />
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography>
                                    {formatCurrency(bid.amount)} by {bid.bidder.name}
                                </Typography>
                            }
                            secondary={
                                <Typography variant="caption" color="text.secondary">
                                    {formatDistance(new Date(bid.createdAt), new Date(), { addSuffix: true })}
                                </Typography>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default BidHistory; 