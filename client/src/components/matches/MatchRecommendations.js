import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Avatar,
    Rating,
    Tooltip,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Collapse
} from '@mui/material';
import {
    VerifiedUser,
    LocationOn,
    Category,
    Timeline,
    ExpandMore,
    ExpandLess,
    CheckCircle,
    Warning
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import OptimizedImage from '../common/OptimizedImage';

const MatchRecommendations = ({ leadId }) => {
    const [expandedId, setExpandedId] = useState(null);

    const { data: recommendations, isLoading } = useQuery({
        queryKey: ['matchRecommendations', leadId],
        queryFn: async () => {
            const response = await fetch(`/api/leads/${leadId}/recommendations`);
            if (!response.ok) throw new Error('Failed to fetch recommendations');
            return response.json();
        }
    });

    const handleExpand = (businessId) => {
        setExpandedId(expandedId === businessId ? null : businessId);
    };

    const renderConfidenceChip = (confidence) => {
        const colors = {
            high: 'success',
            medium: 'warning',
            low: 'error'
        };

        return (
            <Chip
                icon={confidence === 'high' ? <CheckCircle /> : <Warning />}
                label={`${confidence} confidence`}
                color={colors[confidence]}
                size="small"
            />
        );
    };

    const renderScoreDetails = (scores) => (
        <List dense>
            {Object.entries(scores).map(([factor, score]) => (
                <ListItem key={factor}>
                    <ListItemIcon>
                        <Timeline />
                    </ListItemIcon>
                    <ListItemText
                        primary={factor.replace(/([A-Z])/g, ' $1').trim()}
                        secondary={`${Math.round(score * 100)}%`}
                    />
                </ListItem>
            ))}
        </List>
    );

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Recommended Matches
            </Typography>
            <Grid container spacing={3}>
                {recommendations.map((rec) => (
                    <Grid item xs={12} key={rec.business._id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar src={rec.business.avatar}>
                                            {rec.business.name[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6">
                                                {rec.business.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Rating
                                                    value={rec.metrics.averageRating || 0}
                                                    readOnly
                                                    size="small"
                                                />
                                                <Typography variant="body2" color="textSecondary">
                                                    ({rec.metrics.totalFeedbacks || 0} reviews)
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box>
                                        {renderConfidenceChip(rec.matchConfidence)}
                                        <Typography
                                            variant="h5"
                                            color="primary"
                                            sx={{ mt: 1 }}
                                        >
                                            {Math.round(rec.weightedScore * 100)}%
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {rec.business.categories.map((category) => (
                                        <Chip
                                            key={category}
                                            label={category}
                                            size="small"
                                            icon={<Category />}
                                        />
                                    ))}
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LocationOn color="action" />
                                    <Typography variant="body2" color="textSecondary">
                                        {rec.business.location?.address || 'Location not specified'}
                                    </Typography>
                                </Box>

                                <Collapse in={expandedId === rec.business._id}>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Match Score Breakdown
                                        </Typography>
                                        {renderScoreDetails(rec.scores)}
                                    </Box>
                                </Collapse>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    onClick={() => handleExpand(rec.business._id)}
                                    endIcon={expandedId === rec.business._id ? <ExpandLess /> : <ExpandMore />}
                                >
                                    {expandedId === rec.business._id ? 'Show Less' : 'Show More'}
                                </Button>
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {/* Handle connect action */}}
                                >
                                    Connect
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default MatchRecommendations; 