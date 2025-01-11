import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Button,
  CircularProgress,
  Pagination,
  Box,
  Alert
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import LeadCard from '../components/leads/LeadCard';
import leadService from '../services/leadService';
import { useAuth } from '../contexts/AuthContext';
import { getLocationDisplay } from '../utils/locationHelpers';
import { jobCategories } from '../data/leadCategories';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const LeadsList = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'active',
    sort: 'newest',
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await leadService.getLeads({
          ...filters,
          category: filters.category === 'all' ? undefined : filters.category,
          status: filters.status === 'all' ? undefined : filters.status
        });
        
        setLeads(response.leads);
        setTotalPages(response.pages);
      } catch (err) {
        setError(err.message || 'Error fetching leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: name === 'page' ? value : 1 // Reset page when other filters change
    }));
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container>
      <FiltersContainer>
        <TextField
          placeholder="Search leads..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: <Search color="action" />,
          }}
          size="small"
          sx={{ flexGrow: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            label="Category"
          >
            <MenuItem value="all">All Categories</MenuItem>
            {/* Add your categories here */}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            label="Sort By"
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="budget_high">Highest Budget</MenuItem>
            <MenuItem value="budget_low">Lowest Budget</MenuItem>
            <MenuItem value="proposals">Most Proposals</MenuItem>
          </Select>
        </FormControl>
      </FiltersContainer>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {leads.length === 0 ? (
            <Alert severity="info">No leads found matching your criteria.</Alert>
          ) : (
            leads.map((lead) => (
              <LeadCard 
                key={lead._id} 
                lead={{
                  ...lead,
                  location: lead.location ? {
                    ...lead.location,
                    display: getLocationDisplay(lead.location)
                  } : null
                }} 
              />
            ))
          )}
          
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={filters.page}
              onChange={(e, value) => handleFilterChange('page', value)}
              color="primary"
              size="large"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default LeadsList; 