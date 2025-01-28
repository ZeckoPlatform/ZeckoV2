import React from 'react';
import { Box, Paper } from '@mui/material';
import BiddingSection from '../bidding/BiddingSection';
import AutoBidding from '../bidding/AutoBidding';
import BidAnalytics from '../bidding/BidAnalytics';
import { useAuth } from '@/contexts/AuthContext';

const BiddingWrapper = ({ product, autoBid, onAutoBidUpdate }) => {
    const { user } = useAuth();
    const isOwner = user?._id === product.seller._id;

    if (!product.bidding?.enabled) {
        return null;
    }

    return (
        <Box>
            {!isOwner && (
                <>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <BiddingSection product={product} />
                    </Paper>
                    
                    {user && (
                        <AutoBidding
                            product={product}
                            currentAutoBid={autoBid}
                            onSetAutoBid={onAutoBidUpdate}
                        />
                    )}
                </>
            )}

            <BidAnalytics
                product={product}
                bids={product.bids || []}
            />
        </Box>
    );
};

export default BiddingWrapper; 