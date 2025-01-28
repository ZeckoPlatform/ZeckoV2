import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { differenceInSeconds } from 'date-fns';

const BidTimer = ({ endTime, onTimeEnd }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const end = new Date(endTime);
            const diff = differenceInSeconds(end, now);

            if (diff <= 0) {
                onTimeEnd?.();
                return 'Auction ended';
            }

            const days = Math.floor(diff / (24 * 60 * 60));
            const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((diff % (60 * 60)) / 60);
            const seconds = diff % 60;

            if (days > 0) {
                return `${days}d ${hours}h left`;
            } else if (hours > 0) {
                return `${hours}h ${minutes}m left`;
            } else if (minutes > 0) {
                return `${minutes}m ${seconds}s left`;
            } else {
                return `${seconds}s left`;
            }
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime, onTimeEnd]);

    return (
        <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 2,
            py: 0.5,
            borderRadius: 1
        }}>
            <Typography variant="subtitle2">
                {timeLeft}
            </Typography>
        </Box>
    );
};

export default BidTimer; 