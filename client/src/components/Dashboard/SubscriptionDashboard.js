import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider
} from '@mui/material';
import {
    Search as SearchIcon,
    Assignment as AssignmentIcon,
    Star as StarIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StyledPaper = styled(Paper)`
    padding: 24px;
    height: 100%;
`;

const SubscriptionDashboard = () => {
    const navigate = useNavigate();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                    My Dashboard
                </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
                <StyledPaper>
                    <Typography variant="h6" gutterBottom>
                        Quick Actions
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<SearchIcon />}
                                onClick={() => navigate('/services')}
                            >
                                Find Services
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<AssignmentIcon />}
                                onClick={() => navigate('/requests')}
                            >
                                My Requests
                            </Button>
                        </Grid>
                    </Grid>

                    <Box mt={4}>
                        <Typography variant="h6" gutterBottom>
                            Recent Activity
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <AssignmentIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Service Request: Plumbing"
                                    secondary="2 new quotes received"
                                />
                                <Button size="small">View</Button>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemIcon>
                                    <StarIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Review Requested"
                                    secondary="Please rate your experience with John's Electrical"
                                />
                                <Button size="small" color="primary">
                                    Review
                                </Button>
                            </ListItem>
                        </List>
                    </Box>
                </StyledPaper>
            </Grid>

            <Grid item xs={12} md={4}>
                <StyledPaper>
                    <Typography variant="h6" gutterBottom>
                        Subscription Status
                    </Typography>
                    <Box mb={3}>
                        <Typography variant="subtitle1" color="primary">
                            Current Plan: Premium
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Valid until: Dec 31, 2024
                        </Typography>
                    </Box>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate('/subscription')}
                    >
                        Manage Subscription
                    </Button>
                </StyledPaper>

                <Box mt={3}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Recent Orders
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <HistoryIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Order #12345"
                                    secondary="£99.99 - Completed"
                                />
                            </ListItem>
                        </List>
                    </StyledPaper>
                </Box>
            </Grid>
        </Grid>
    );
};

export default SubscriptionDashboard; 