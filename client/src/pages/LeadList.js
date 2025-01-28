import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import VirtualList from '../components/common/VirtualList';
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
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

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
  const [hasMore, setHasMore] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      const nextPage = filters.page + 1;
      const response = await leadService.getLeads({
        ...filters,
        page: nextPage,
      });
      
      if (mountedRef.current) {
        setLeads(prev => [...prev, ...response.leads]);
        setHasMore(nextPage < response.pages);
        setFilters(prev => ({ ...prev, page: nextPage }));
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Error fetching leads');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters, loading, hasMore]);

  const lastLeadRef = useInfiniteScroll(loadMore, hasMore);

  const renderLead = useCallback((lead) => (
    <LeadCard 
      ref={lead === leads[leads.length - 1] ? lastLeadRef : null}
      key={lead._id} 
      lead={{
        ...lead,
        location: lead.location ? {
          ...lead.location,
          display: getLocationDisplay(lead.location)
        } : null
      }} 
    />
  ), [leads, lastLeadRef]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container>
      <FiltersContainer>
        <TextField
          placeholder="Search leads..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
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
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
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
            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
            label="Sort By"
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="budget_high">Highest Budget</MenuItem>
            <MenuItem value="budget_low">Lowest Budget</MenuItem>
            <MenuItem value="proposals">Most Proposals</MenuItem>
          </Select>
        </FormControl>
      </FiltersContainer>

      {loading && leads.length === 0 ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {leads.length === 0 ? (
            <Alert severity="info">No leads found matching your criteria.</Alert>
          ) : (
            <div style={{ height: 'calc(100vh - 200px)' }}>
              <VirtualList
                items={leads}
                rowHeight={200}
                renderItem={renderLead}
              />
            </div>
          )}
          
          {loading && leads.length > 0 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default LeadsList; 