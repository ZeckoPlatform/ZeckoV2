import React from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Avatar,
    Chip,
    IconButton
} from '@mui/material';
import {
    Check as CheckIcon,
    Close as CloseIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const MatchNotification = ({ notification, onClose }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleMatchAction = useMutation({
        mutationFn: async (action) => {
            const response = await fetch(`/api/matches/${notification.data.matchId}/${action}`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to process match action');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['matches']);
            queryClient.invalidateQueries(['notifications']);
            onClose?.();
        }
    });

    const handleViewMatch = () => {
        navigate(`/matches/${notification.data.matchId}`);
        onClose?.();
    };

    const renderActionButtons = () => {
        if (notification.type === 'MATCH_FOUND') {
            return (
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleMatchAction.mutate('accept')}
                        startIcon={<CheckIcon />}
                    >
                        Accept Match
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleMatchAction.mutate('decline')}
                        startIcon={<CloseIcon />}
                    >
                        Decline
                    </Button>
                </Box>
            );
        }

        return (
            <Button
                variant="text"
                color="primary"
                onClick={handleViewMatch}
                endIcon={<ArrowForwardIcon />}
            >
                View Details
            </Button>
        );
    };

    return (
        <Paper 
            sx={{ 
                p: 2, 
                mb: 1,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2
            }}
        >
            <Avatar
                src={notification.data.avatar}
                sx={{ 
                    bgcolor: notification.priority === 'high' ? 'success.main' : 'primary.main'
                }}
            >
                {notification.data.businessName?.[0] || notification.data.leadTitle?.[0]}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1">
                        {notification.title}
                    </Typography>
                    {notification.data.score && (
                        <Chip
                            label={`${Math.round(notification.data.score * 100)}% Match`}
                            size="small"
                            color={notification.data.score >= 0.8 ? 'success' : 'primary'}
                        />
                    )}
                </Box>

                <Typography variant="body2" color="textSecondary">
                    {notification.message}
                </Typography>

                {renderActionButtons()}
            </Box>

            <IconButton size="small" onClick={onClose}>
                <CloseIcon fontSize="small" />
            </IconButton>
        </Paper>
    );
};

export default MatchNotification; 