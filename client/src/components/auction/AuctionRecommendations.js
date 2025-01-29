import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActionArea,
    Chip,
    Skeleton,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '../../utils/format';
import BidTimer from '../bidding/BidTimer';
import OptimizedImage from '../common/OptimizedImage';

const AuctionRecommendations = () => {
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery({
        queryKey: ['auctionRecommendations'],
        queryFn: async () => {
            const response = await fetch('/api/auctions/recommendations');
            if (!response.ok) throw new Error('Failed to fetch recommendations');
            return response.json();
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    if (isLoading) {
        return (
            <Grid container spacing={3}>
                {[1, 2, 3, 4].map((skeleton) => (
                    <Grid item xs={12} sm={6} md={3} key={skeleton}>
                        <Card>
                            <Skeleton variant="rectangular" height={140} />
                            <CardContent>
                                <Skeleton variant="text" />
                                <Skeleton variant="text" width="60%" />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error.message}
            </Alert>
        );
    }

    if (!data?.data?.recommendations?.length) {
        return null;
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Recommended Auctions
            </Typography>
            <Grid container spacing={3}>
                {data.data.recommendations.map((auction, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card>
                            <CardActionArea 
                                onClick={() => navigate(`/auctions/${auction._id}`)}
                            >
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={auction.images[0]?.url || '/placeholder.jpg'}
                                    alt={auction.title}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="div" noWrap>
                                        {auction.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Current Bid: {formatCurrency(auction.currentBid)}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <BidTimer endTime={auction.endTime} />
                                        <Chip 
                                            size="small"
                                            label={`${auction.totalBids} bids`}
                                            color="primary"
                                        />
                                    </Box>
                                    {auction.matchReason && (
                                        <Typography 
                                            variant="caption" 
                                            color="text.secondary"
                                            sx={{ display: 'block', mt: 1 }}
                                        >
                                            {auction.matchReason}
                                        </Typography>
                                    )}
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default AuctionRecommendations; 