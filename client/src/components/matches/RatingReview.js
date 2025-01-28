import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Rating as MuiRating,
    TextField,
    Button,
    Chip,
    Stack,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Tooltip,
    Grid
} from '@mui/material';
import {
    Star as StarIcon,
    ThumbUp as ThumbUpIcon,
    Flag as FlagIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

const RatingForm = ({ initialData, onSubmit, isEdit }) => {
    const [formData, setFormData] = useState(initialData || {
        overall: 0,
        communication: 0,
        professionalism: 0,
        quality: 0,
        valueForMoney: 0,
        timeliness: 0,
        review: '',
        tags: []
    });

    const categories = [
        { name: 'communication', label: 'Communication' },
        { name: 'professionalism', label: 'Professionalism' },
        { name: 'quality', label: 'Quality of Work' },
        { name: 'valueForMoney', label: 'Value for Money' },
        { name: 'timeliness', label: 'Timeliness' }
    ];

    const commonTags = [
        'Responsive',
        'Professional',
        'High Quality',
        'On Time',
        'Good Value',
        'Experienced',
        'Recommended'
    ];

    const handleTagToggle = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    return (
        <Box component="form" onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
        }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Overall Rating
                    </Typography>
                    <MuiRating
                        value={formData.overall}
                        onChange={(_, value) => setFormData(prev => ({
                            ...prev,
                            overall: value
                        }))}
                        size="large"
                    />
                </Grid>

                {categories.map(category => (
                    <Grid item xs={12} sm={6} key={category.name}>
                        <Typography variant="subtitle2" gutterBottom>
                            {category.label}
                        </Typography>
                        <MuiRating
                            value={formData[category.name]}
                            onChange={(_, value) => setFormData(prev => ({
                                ...prev,
                                [category.name]: value
                            }))}
                        />
                    </Grid>
                ))}

                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Your Review
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.review}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            review: e.target.value
                        }))}
                        placeholder="Share your experience..."
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Tags
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {commonTags.map(tag => (
                            <Chip
                                key={tag}
                                label={tag}
                                onClick={() => handleTagToggle(tag)}
                                color={formData.tags.includes(tag) ? 'primary' : 'default'}
                                sx={{ m: 0.5 }}
                            />
                        ))}
                    </Stack>
                </Grid>

                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={!formData.overall}
                    >
                        {isEdit ? 'Update Rating' : 'Submit Rating'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

const RatingReview = ({ matchId }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [selectedRating, setSelectedRating] = useState(null);

    const { data: ratings, isLoading } = useQuery({
        queryKey: ['ratings', matchId],
        queryFn: async () => {
            const response = await fetch(`/api/matches/${matchId}/ratings`);
            if (!response.ok) throw new Error('Failed to fetch ratings');
            return response.json();
        }
    });

    const submitRating = useMutation({
        mutationFn: async (data) => {
            const response = await fetch(`/api/matches/${matchId}/ratings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to submit rating');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['ratings', matchId]);
            setShowForm(false);
        }
    });

    const markHelpful = useMutation({
        mutationFn: async (ratingId) => {
            const response = await fetch(`/api/ratings/${ratingId}/helpful`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to mark as helpful');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['ratings', matchId]);
        }
    });

    const reportRating = useMutation({
        mutationFn: async ({ ratingId, reason }) => {
            const response = await fetch(`/api/ratings/${ratingId}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            if (!response.ok) throw new Error('Failed to report rating');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['ratings', matchId]);
            setShowReportDialog(false);
            setSelectedRating(null);
        }
    });

    const handleReport = (rating) => {
        setSelectedRating(rating);
        setShowReportDialog(true);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Ratings & Reviews</Typography>
                <Button
                    variant="contained"
                    onClick={() => setShowForm(true)}
                    disabled={ratings?.userHasRated}
                >
                    Write a Review
                </Button>
            </Box>

            {ratings?.stats && (
                <Box sx={{ mb: 4 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3">
                                    {ratings.stats.averageRating.toFixed(1)}
                                </Typography>
                                <MuiRating
                                    value={ratings.stats.averageRating}
                                    readOnly
                                    precision={0.1}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    {ratings.stats.totalRatings} reviews
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            {Object.entries(ratings.stats.categoryBreakdown).map(([category, value]) => (
                                <Box key={category} sx={{ mb: 1 }}>
                                    <Typography variant="body2">
                                        {category}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <MuiRating value={value} readOnly size="small" />
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                            ({value.toFixed(1)})
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Grid>
                    </Grid>
                </Box>
            )}

            <List>
                {ratings?.items.map((rating) => (
                    <ListItem
                        key={rating._id}
                        alignItems="flex-start"
                        sx={{ flexDirection: 'column', py: 2 }}
                    >
                        <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                            <ListItemAvatar>
                                <Avatar src={rating.rater.avatar}>
                                    {rating.rater.name[0]}
                                </Avatar>
                            </ListItemAvatar>
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle1">
                                        {rating.rater.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {format(new Date(rating.createdAt), 'MMM d, yyyy')}
                                    </Typography>
                                </Box>
                                <MuiRating value={rating.overallRating} readOnly size="small" />
                            </Box>
                        </Box>

                        <Box sx={{ pl: 7 }}>
                            <Typography variant="body1" paragraph>
                                {rating.review}
                            </Typography>

                            {rating.tags.length > 0 && (
                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    {rating.tags.map((tag, index) => (
                                        <Chip key={index} label={tag} size="small" />
                                    ))}
                                </Stack>
                            )}

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    size="small"
                                    startIcon={<ThumbUpIcon />}
                                    onClick={() => markHelpful.mutate(rating._id)}
                                    disabled={rating.helpfulVotes.includes(user._id)}
                                >
                                    Helpful ({rating.metrics.helpfulCount})
                                </Button>
                                <Button
                                    size="small"
                                    startIcon={<FlagIcon />}
                                    onClick={() => handleReport(rating)}
                                    color="error"
                                >
                                    Report
                                </Button>
                            </Box>
                        </Box>
                    </ListItem>
                ))}
            </List>

            <Dialog
                open={showForm}
                onClose={() => setShowForm(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Write a Review
                </DialogTitle>
                <DialogContent>
                    <RatingForm
                        onSubmit={submitRating.mutate}
                        isEdit={false}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={showReportDialog}
                onClose={() => {
                    setShowReportDialog(false);
                    setSelectedRating(null);
                }}
            >
                <DialogTitle>Report Review</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Reason for reporting"
                        onChange={(e) => setReportReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowReportDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => reportRating.mutate({
                            ratingId: selectedRating._id,
                            reason: reportReason
                        })}
                        color="error"
                    >
                        Report
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default RatingReview; 