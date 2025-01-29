import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Tooltip,
    LinearProgress,
    Skeleton
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot
} from '@mui/lab';
import { formatCurrency } from '../../utils/format';
import { formatDistance } from 'date-fns';

const BidAnalytics = ({ bids, product, isLoading }) => {
    if (isLoading) {
        return (
            <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>Bid Analytics</Typography>
                <Grid container spacing={2}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid item xs={6} md={3} key={i}>
                            <Skeleton variant="rectangular" height={100} />
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        );
    }

    const totalBids = bids.length;
    const uniqueBidders = new Set(bids.map(bid => bid.bidder._id)).size;
    const averageBid = totalBids > 0
        ? bids.reduce((acc, bid) => acc + bid.amount, 0) / totalBids
        : 0;
    const bidIncrement = totalBids > 1
        ? bids[0].amount - bids[1].amount
        : 0;

    const recentBids = bids.slice(0, 5);
    const maxBid = Math.max(...bids.map(bid => bid.amount), product.bidding.startPrice);

    return (
        <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>Bid Analytics</Typography>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                            Total Bids
                        </Typography>
                        <Typography variant="h4">{totalBids}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                            Unique Bidders
                        </Typography>
                        <Typography variant="h4">{uniqueBidders}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                            Average Bid
                        </Typography>
                        <Typography variant="h4">{formatCurrency(averageBid)}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                            Last Increment
                        </Typography>
                        <Typography variant="h4">{formatCurrency(bidIncrement)}</Typography>
                    </Box>
                </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom>Bid Progress</Typography>
            <Box sx={{ mb: 3 }}>
                <Tooltip title={`Current: ${formatCurrency(product.bidding.currentBid || product.bidding.startPrice)}`}>
                    <LinearProgress
                        variant="determinate"
                        value={((product.bidding.currentBid || product.bidding.startPrice) / maxBid) * 100}
                        sx={{ height: 10, borderRadius: 1 }}
                    />
                </Tooltip>
            </Box>

            <Typography variant="subtitle1" gutterBottom>Recent Activity</Typography>
            <Timeline>
                {recentBids.map((bid, index) => (
                    <TimelineItem key={bid._id}>
                        <TimelineSeparator>
                            <TimelineDot color={index === 0 ? "primary" : "grey"} />
                            {index < recentBids.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                            <Typography variant="body2">
                                {formatCurrency(bid.amount)} by {bid.bidder.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDistance(new Date(bid.createdAt), new Date(), { addSuffix: true })}
                            </Typography>
                        </TimelineContent>
                    </TimelineItem>
                ))}
            </Timeline>
        </Paper>
    );
};

export default BidAnalytics; 