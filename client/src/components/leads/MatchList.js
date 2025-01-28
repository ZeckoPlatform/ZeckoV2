import React, { useState } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondary,
    Avatar,
    Typography,
    Chip,
    Button,
    Dialog,
    IconButton,
    Divider
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import MatchDisplay from './MatchDisplay';
import BusinessIcon from '@mui/icons-material/Business';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import OptimizedImage from '../common/OptimizedImage';

const MatchList = ({ leadId }) => {
    const [selectedMatch, setSelectedMatch] = useState(null);

    const { data: matches, isLoading } = useQuery({
        queryKey: ['matches', leadId],
        queryFn: async () => {
            const response = await fetch(`/api/matches/${leadId}`);
            if (!response.ok) throw new Error('Failed to fetch matches');
            return response.json();
        }
    });

    const handleViewMatch = (match) => {
        setSelectedMatch(match);
    };

    if (isLoading) {
        return <Box>Loading matches...</Box>;
    }

    return (
        <>
            <div className="match-list">
                {matches.data.matches.map((match, index) => (
                    <div key={index} className="match-item">
                        <div className="match-profile">
                            <OptimizedImage
                                src={match.business.avatar || '/default-profile.png'}
                                alt={match.business.name}
                                width={60}
                                height={60}
                                className="match-profile-image"
                            />
                        </div>
                        <div className="match-details">
                            <div className="match-header">
                                <Typography variant="subtitle1">
                                    {match.business.name}
                                </Typography>
                                <Chip
                                    size="small"
                                    label={`${Math.round(match.score * 100)}% Match`}
                                    color={match.score >= 0.8 ? 'success' : 'primary'}
                                />
                            </div>
                            <div className="match-info">
                                <div className="match-rating">
                                    <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                                    <Typography variant="body2">
                                        {match.business.rating} ({match.business.reviewCount} reviews)
                                    </Typography>
                                </div>
                                <div className="match-location">
                                    <LocationOnIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                    <Typography variant="body2">
                                        {match.business.location}
                                    </Typography>
                                </div>
                            </div>
                            <Typography variant="body2" color="textSecondary">
                                {match.business.description}
                            </Typography>
                        </div>
                        <div className="match-actions">
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleViewMatch(match)}
                            >
                                View Match
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog
                fullWidth
                maxWidth="md"
                open={Boolean(selectedMatch)}
                onClose={() => setSelectedMatch(null)}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <IconButton onClick={() => setSelectedMatch(null)}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                {selectedMatch && (
                    <Box sx={{ px: 3, pb: 3 }}>
                        <MatchDisplay
                            leadId={leadId}
                            businessId={selectedMatch.business._id}
                        />
                    </Box>
                )}
            </Dialog>
        </>
    );
};

export default MatchList; 