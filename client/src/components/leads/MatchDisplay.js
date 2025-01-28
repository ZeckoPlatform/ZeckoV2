import React from 'react';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Grid,
    Chip,
    Button,
    LinearProgress,
    Tooltip,
    Avatar
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot
} from '@mui/lab';
import { useQuery } from '@tanstack/react-query';
import { formatDistance } from 'date-fns';

const MatchDisplay = ({ leadId, businessId }) => {
    const { data: matchData, isLoading } = useQuery({
        queryKey: ['match', leadId, businessId],
        queryFn: async () => {
            const response = await fetch(`/api/matches/${leadId}/${businessId}`);
            if (!response.ok) throw new Error('Failed to fetch match data');
            return response.json();
        }
    });

    const getScoreColor = (score) => {
        if (score >= 0.8) return 'success';
        if (score >= 0.6) return 'warning';
        return 'error';
    };

    const renderScoreDetail = (label, score, description) => (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="textSecondary">
                    {label}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {Math.round(score * 100)}%
                </Typography>
            </Box>
            <Tooltip title={description}>
                <LinearProgress 
                    variant="determinate" 
                    value={score * 100} 
                    color={getScoreColor(score)}
                    sx={{ height: 8, borderRadius: 4 }}
                />
            </Tooltip>
        </Box>
    );

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    const { score, details, matchTimeline } = matchData.data;

    return (
        <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Match Score
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <CircularProgress
                                variant="determinate"
                                value={score * 100}
                                size={120}
                                thickness={4}
                                color={getScoreColor(score)}
                            />
                            <Box
                                sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    component="div"
                                    color="text.secondary"
                                >
                                    {Math.round(score * 100)}%
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                        Match Details
                    </Typography>
                    {renderScoreDetail(
                        'Expertise Match',
                        details.expertise,
                        'Based on business category and required skills'
                    )}
                    {renderScoreDetail(
                        'Availability',
                        details.availability,
                        'Current capacity and resource availability'
                    )}
                    {renderScoreDetail(
                        'Location',
                        details.location,
                        'Proximity to project location'
                    )}
                    {renderScoreDetail(
                        'Response Time',
                        details.responseTime,
                        'Average response time to leads'
                    )}
                    {renderScoreDetail(
                        'Completion Rate',
                        details.completionRate,
                        'Successfully completed projects ratio'
                    )}
                    {renderScoreDetail(
                        'Customer Rating',
                        details.customerRating,
                        'Average rating from previous clients'
                    )}
                </Grid>

                <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>
                        Match Timeline
                    </Typography>
                    <Timeline>
                        {matchTimeline.map((event, index) => (
                            <TimelineItem key={index}>
                                <TimelineSeparator>
                                    <TimelineDot color={event.type === 'success' ? 'success' : 'primary'} />
                                    {index < matchTimeline.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Typography variant="body2">
                                        {event.description}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {formatDistance(new Date(event.timestamp), new Date(), { addSuffix: true })}
                                    </Typography>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>

                    <Box sx={{ mt: 4 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            onClick={() => {/* Handle connection */}}
                        >
                            Connect with Business
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default MatchDisplay; 