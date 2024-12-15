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
  Pagination
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import LeadCard from '../components/leads/LeadCard';
import { api } from '../services/api';

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

const SearchBar = styled.div`
  flex: 1;
  min-width: 300px;
`;

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'newest',
    page: 1
  });
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchLeads();
  }, [filters.page]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        limit: 10,
        ...(filters.search && { search: filters.search }),
        ...(filters.category !== 'all' && { category: filters.category }),
        sortBy: filters.sortBy
      });

      const response = await api.get(`/leads?${params}`);
      setLeads(response.data.leads);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchLeads();
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value, page: 1 });
    fetchLeads();
  };

  return (
    <Container>
      <FiltersContainer>
        <SearchBar>
          <TextField
            fullWidth
            placeholder="Search leads..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              endAdornment: (
                <Button 
                  onClick={handleSearch}
                  startIcon={<Search />}
                >
                  Search
                </Button>
              ),
            }}
          />
        </SearchBar>

        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="budget_high">Highest Budget</MenuItem>
            <MenuItem value="budget_low">Lowest Budget</MenuItem>
            <MenuItem value="proposals">Most Proposals</MenuItem>
          </Select>
        </FormControl>
      </FiltersContainer>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {leads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} />
          ))}
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <Pagination
              count={totalPages}
              page={filters.page}
              onChange={(e, value) => setFilters({ ...filters, page: value })}
              color="primary"
            />
          </div>
        </>
      )}
    </Container>
  );
};

export default LeadsList; 