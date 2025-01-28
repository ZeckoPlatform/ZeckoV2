import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Rating,
    TextField,
    Button,
    Chip,
    Stack,
    Slider,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    FormControlLabel,
    Alert,
    CircularProgress
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const metrics = [
    { name: 'communication', label: 'Communication' },
    { name: 'professionalism', label: 'Professionalism' },
    { name: 'expertise', label: 'Expertise' },
    { name: 'overall', label: 'Overall Experience' }
];

const categories = [
    'Response Time',
    'Quality of Communication',
    'Professional Conduct',
    'Technical Knowledge',
    'Problem Solving',
    'Value for Money',
    'Meeting Deadlines',
    'Understanding Requirements'
];

const MatchFeedback = ({ matchId, type, onComplete }) => {
    const queryClient = useQueryClient();
    const [feedback, setFeedback] = useState({
        rating: 0,
        feedback: '',
        categories: [],
        metrics: {
            communication: 0,
            professionalism: 0,
            expertise: 0,
            overall: 0
        }
    });

    const submitFeedback = useMutation({
        mutationFn: async (feedbackData) => {
            const response = await fetch(`/api/matches/${matchId}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type,
                    ...feedbackData
                })
            });
            if (!response.ok) throw new Error('Failed to submit feedback');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['match', matchId]);
            onComplete?.();
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        submitFeedback.mutate(feedback);
    };

    const handleCategoryToggle = (category) => {
        setFeedback(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category]
        }));
    };

    if (submitFeedback.isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Provide Your Feedback
            </Typography>

            {submitFeedback.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to submit feedback. Please try again.
                </Alert>
            )}

            <Box sx={{ mb: 3 }}>
                <Typography component="legend">Overall Rating</Typography>
                <Rating
                    value={feedback.rating}
                    onChange={(_, newValue) => {
                        setFeedback(prev => ({
                            ...prev,
                            rating: newValue
                        }));
                    }}
                    size="large"
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Categories</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {categories.map(category => (
                        <Chip
                            key={category}
                            label={category}
                            onClick={() => handleCategoryToggle(category)}
                            color={feedback.categories.includes(category) ? "primary" : "default"}
                            sx={{ m: 0.5 }}
                        />
                    ))}
                </Stack>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>Detailed Metrics</Typography>
                {metrics.map(metric => (
                    <Box key={metric.name} sx={{ mb: 2 }}>
                        <Typography id={`${metric.name}-slider`} gutterBottom>
                            {metric.label}
                        </Typography>
                        <Slider
                            value={feedback.metrics[metric.name]}
                            onChange={(_, newValue) => {
                                setFeedback(prev => ({
                                    ...prev,
                                    metrics: {
                                        ...prev.metrics,
                                        [metric.name]: newValue
                                    }
                                }));
                            }}
                            aria-labelledby={`${metric.name}-slider`}
                            valueLabelDisplay="auto"
                            step={1}
                            marks
                            min={0}
                            max={5}
                        />
                    </Box>
                ))}
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Additional Feedback"
                    value={feedback.feedback}
                    onChange={(e) => {
                        setFeedback(prev => ({
                            ...prev,
                            feedback: e.target.value
                        }));
                    }}
                    placeholder="Share your experience and suggestions..."
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!feedback.rating || submitFeedback.isLoading}
                >
                    Submit Feedback
                </Button>
            </Box>
        </Paper>
    );
};

export default MatchFeedback; 