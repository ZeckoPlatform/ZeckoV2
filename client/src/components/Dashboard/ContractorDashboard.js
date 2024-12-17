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
    Chip,
    LinearProgress
} from '@mui/material';
import {
    Work as WorkIcon,
    AttachMoney as MoneyIcon,
    Star as StarIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StyledPaper = styled(Paper)`
    padding: 24px;
    height: 100%;
`;

const StatBox = styled(Box)`
    text-align: center;
    padding: 16px;
`;

const ContractorDashboard = () => {
    const navigate = useNavigate();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                    Contractor Dashboard
                </Typography>
            </Grid>

            {/* Stats Overview */}
            <Grid item xs={12} md={3}>
                <StyledPaper>
                    <StatBox>
                        <Typography variant="h3" color="primary">
                            12
                        </Typography>
                        <Typography color="textSecondary">
                            Active Leads
                        </Typography>
                    </StatBox>
                </StyledPaper>
            </Grid>
            <Grid item xs={12} md={3}>
                <StyledPaper>
                    <StatBox>
                        <Typography variant="h3" color="primary">
                            85%
                        </Typography>
                        <Typography color="textSecondary">
                            Response Rate
                        </Typography>
                    </StatBox>
                </StyledPaper>
            </Grid>
            <Grid item xs={12} md={3}>
                <StyledPaper>
                    <StatBox>
                        <Typography variant="h3" color="primary">
                            4.8
                        </Typography>
                        <Typography color="textSecondary">
                            Rating
                        </Typography>
                    </StatBox>
                </StyledPaper>
            </Grid>
            <Grid item xs={12} md={3}>
                <StyledPaper>
                    <StatBox>
                        <Typography variant="h3" color="primary">
                            £2.4k
                        </Typography>
                        <Typography color="textSecondary">
                            This Month
                        </Typography>
                    </StatBox>
                </StyledPaper>
            </Grid>

            {/* Main Content */}
            <Grid item xs={12} md={8}>
                <StyledPaper>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6">
                            Latest Leads
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/leads')}
                        >
                            View All
                        </Button>
                    </Box>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <WorkIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Kitchen Renovation"
                                secondary="London, SW1 • Posted 2 hours ago"
                            />
                            <Chip label="New" color="primary" size="small" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <WorkIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Bathroom Plumbing"
                                secondary="Manchester, M1 • Posted 5 hours ago"
                            />
                            <Button size="small" variant="outlined">
                                Quote
                            </Button>
                        </ListItem>
                    </List>
                </StyledPaper>

                <Box mt={3}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Performance Overview
                        </Typography>
                        <Box mt={2}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">Response Rate</Typography>
                                <Typography variant="body2">85%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={85} />
                        </Box>
                        <Box mt={2}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">Win Rate</Typography>
                                <Typography variant="body2">65%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={65} />
                        </Box>
                    </StyledPaper>
                </Box>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
                <StyledPaper>
                    <Typography variant="h6" gutterBottom>
                        Active Jobs
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <TimelineIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Home Extension"
                                secondary="In Progress • Due in 5 days"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <TimelineIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Garden Landscaping"
                                secondary="Starting Tomorrow"
                            />
                        </ListItem>
                    </List>
                </StyledPaper>

                <Box mt={3}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Recent Reviews
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <StarIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="5.0 - Excellent Service"
                                    secondary="John D. • 2 days ago"
                                />
                            </ListItem>
                        </List>
                    </StyledPaper>
                </Box>
            </Grid>
        </Grid>
    );
};

export default ContractorDashboard; 