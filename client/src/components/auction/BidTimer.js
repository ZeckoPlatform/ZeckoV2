import React, { useState, useEffect } from 'react';
import { Typography, Box, Chip } from '@mui/material';
import { differenceInSeconds, formatDistance } from 'date-fns';

const BidTimer = ({ endTime, onEnd }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isEnding, setIsEnding] = useState(false);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const end = new Date(endTime);
            const secondsLeft = differenceInSeconds(end, now);

            if (secondsLeft <= 0) {
                setTimeLeft('Ended');
                onEnd?.();
                return;
            }

            setTimeLeft(formatDistance(end, now, { addSuffix: true }));
            setIsEnding(secondsLeft <= 300); // 5 minutes
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [endTime, onEnd]);

    return (
        <Box>
            <Chip
                label={timeLeft}
                color={isEnding ? 'error' : 'default'}
                variant={isEnding ? 'filled' : 'outlined'}
            />
        </Box>
    );
};

export default BidTimer; 