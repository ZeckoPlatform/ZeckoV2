import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Chip,
    Paper
} from '@mui/material';
import { Slider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '../../utils/format';

const AuctionSearch = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        priceRange: [0, 10000],
        status: 'active',
        sortBy: 'endingSoon'
    });
    const [showFilters, setShowFilters] = useState(false);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            return response.json();
        }
    });

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, filters]);

    const handleSearch = () => {
        const searchParams = new URLSearchParams({
            q: searchTerm,
            category: filters.category,
            minPrice: filters.priceRange[0],
            maxPrice: filters.priceRange[1],
            status: filters.status,
            sortBy: filters.sortBy
        });

        onSearch(searchParams.toString());
    };

    const handleFilterChange = (field) => (event) => {
        setFilters(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handlePriceChange = (event, newValue) => {
        setFilters(prev => ({
            ...prev,
            priceRange: newValue
        }));
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            priceRange: [0, 10000],
            status: 'active',
            sortBy: 'endingSoon'
        });
        setSearchTerm('');
    };

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            placeholder="Search auctions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <IconButton 
                            onClick={() => setShowFilters(!showFilters)}
                            color={showFilters ? 'primary' : 'default'}
                        >
                            <FilterListIcon />
                        </IconButton>
                    </Box>
                </Grid>

                {showFilters && (
                    <>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={filters.category}
                                    onChange={handleFilterChange('category')}
                                    label="Category"
                                >
                                    <MenuItem value="">All Categories</MenuItem>
                                    {categories?.data.map((category) => (
                                        <MenuItem key={category._id} value={category._id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    onChange={handleFilterChange('status')}
                                    label="Status"
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="ending">Ending Soon</MenuItem>
                                    <MenuItem value="upcoming">Upcoming</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    value={filters.sortBy}
                                    onChange={handleFilterChange('sortBy')}
                                    label="Sort By"
                                >
                                    <MenuItem value="endingSoon">Ending Soon</MenuItem>
                                    <MenuItem value="priceLow">Price: Low to High</MenuItem>
                                    <MenuItem value="priceHigh">Price: High to Low</MenuItem>
                                    <MenuItem value="newest">Newest</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Typography gutterBottom>
                                Price Range
                            </Typography>
                            <Slider
                                value={filters.priceRange}
                                onChange={handlePriceChange}
                                valueLabelDisplay="auto"
                                min={0}
                                max={10000}
                                valueLabelFormat={(value) => formatCurrency(value)}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    onClick={clearFilters}
                                    startIcon={<CloseIcon />}
                                >
                                    Clear Filters
                                </Button>
                                {Object.entries(filters).map(([key, value]) => {
                                    if (!value || (Array.isArray(value) && value.every(v => v === 0))) return null;
                                    return (
                                        <Chip
                                            key={key}
                                            label={`${key}: ${Array.isArray(value) ? 
                                                `${formatCurrency(value[0])} - ${formatCurrency(value[1])}` : 
                                                value}`}
                                            onDelete={() => handleFilterChange(key)({ target: { value: '' } })}
                                            size="small"
                                        />
                                    );
                                })}
                            </Box>
                        </Grid>
                    </>
                )}
            </Grid>
        </Paper>
    );
};

export default AuctionSearch; 