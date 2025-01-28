import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent,
    Chip,
    Divider,
    Rating,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

const MatchHistory = ({ matchId }) => {
    const { data: history, isLoading } = useQuery({
        queryKey: ['matchHistory', matchId],
        queryFn: async () => {
            const response = await fetch(`/api/matches/${matchId}/history`);
            if (!response.ok) throw new Error('Failed to fetch match history');
            return response.json();
        }
    });

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            accepted: 'info',
            connected: 'success',
            declined: 'error',
            completed: 'success',
            expired: 'error'
        };
        return colors[status] || 'default';
    };

    const getTimelineIcon = (action) => {
        // Return appropriate icon based on action
        // Implementation details...
    };

    if (isLoading) {
        return <Box>Loading history...</Box>;
    }

    return (
        <Box>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Match Overview
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography color="textSecondary" gutterBottom>
                                    Current Status
                                </Typography>
                                <Chip
                                    label={history.status.toUpperCase()}
                                    color={getStatusColor(history.status)}
                                />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography color="textSecondary" gutterBottom>
                                    Match Score
                                </Typography>
                                <Typography variant="h4">
                                    {Math.round(history.score * 100)}%
                                </Typography>
                            </Box>
                            {history.feedback && (
                                <Box>
                                    <Typography color="textSecondary" gutterBottom>
                                        Feedback
                                    </Typography>
                                    <Rating
                                        value={history.feedback.rating}
                                        readOnly
                                        size="small"
                                    />
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Timeline
                        </Typography>
                        <Timeline>
                            {history.timeline.map((event, index) => (
                                <TimelineItem key={index}>
                                    <TimelineOppositeContent color="textSecondary">
                                        {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')}
                                    </TimelineOppositeContent>
                                    <TimelineSeparator>
                                        <TimelineDot color={getStatusColor(event.action)}>
                                            {getTimelineIcon(event.action)}
                                        </TimelineDot>
                                        {index < history.timeline.length - 1 && (
                                            <TimelineConnector />
                                        )}
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        <Typography variant="body1">
                                            {event.action.replace(/_/g, ' ')}
                                        </Typography>
                                        {event.details && (
                                            <Typography variant="body2" color="textSecondary">
                                                {JSON.stringify(event.details)}
                                            </Typography>
                                        )}
                                        {event.performedBy && (
                                            <Typography variant="caption" color="textSecondary">
                                                by {event.performedBy.name}
                                            </Typography>
                                        )}
                                    </TimelineContent>
                                </TimelineItem>
                            ))}
                        </Timeline>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MatchHistory; 