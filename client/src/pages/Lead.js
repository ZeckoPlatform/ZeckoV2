import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useService } from '../contexts/ServiceContext';
import { useAuth } from '../contexts/AuthContext';

const Lead = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { categories, requests, loading } = useService();
    const [filter, setFilter] = useState({
        category: 'all',
        status: 'active'
    });

    const filteredRequests = requests.filter(request => {
        if (filter.category !== 'all' && request.category !== filter.category) return false;
        if (filter.status !== 'all' && request.status !== filter.status) return false;
        return true;
    });

    const handleFilterChange = (event) => {
        setFilter({
            ...filter,
            [event.target.name]: event.target.value
        });
    };

    return (
        <Container>
            <Box py={4}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h4">
                                {user.role === 'vendor' ? 'Available Leads' : 'My Requests'}
                            </Typography>
                            {user.role !== 'vendor' && (
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={() => navigate('/services')}
                                >
                                    Post New Request
                                </Button>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            name="category"
                                            value={filter.category}
                                            onChange={handleFilterChange}
                                        >
                                            <MenuItem value="all">All Categories</MenuItem>
                                            {categories.map(category => (
                                                <MenuItem key={category._id} value={category._id}>
                                                    {category.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            name="status"
                                            value={filter.status}
                                            onChange={handleFilterChange}
                                        >
                                            <MenuItem value="all">All Status</MenuItem>
                                            <MenuItem value="active">Active</MenuItem>
                                            <MenuItem value="in_progress">In Progress</MenuItem>
                                            <MenuItem value="completed">Completed</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {filteredRequests.map(request => (
                        <Grid item xs={12} key={request._id}>
                            <Paper 
                                sx={{ 
                                    p: 3, 
                                    cursor: 'pointer',
                                    '&:hover': { boxShadow: 3 }
                                }}
                                onClick={() => navigate(`/lead/${request._id}`)}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={8}>
                                        <Typography variant="h6" gutterBottom>
                                            {request.title}
                                        </Typography>
                                        <Typography color="textSecondary" gutterBottom>
                                            {request.location.city} • Posted {new Date(request.createdAt).toLocaleDateString()}
                                        </Typography>
                                        <Typography noWrap>
                                            {request.description}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box display="flex" justifyContent="flex-end" alignItems="center" height="100%">
                                            <Typography color="primary" variant="h6">
                                                {request.quotes?.length || 0} quotes
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default Lead; 