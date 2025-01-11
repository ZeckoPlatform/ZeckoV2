import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  Avatar
} from '@mui/material';
import { 
  BusinessCenter,
  LocationOn,
  AttachMoney,
  Schedule,
  Person
} from '@mui/icons-material';

const StyledCard = styled(Card)`
  margin-bottom: 1rem;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`;

const LeadHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const LeadTitle = styled(Typography)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LeadMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0.5rem 0;
`;

const LeadActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const StatusChip = styled(Chip)`
  &.active {
    background-color: ${props => props.theme.colors.success}20;
    color: ${props => props.theme.colors.success};
  }
  
  &.completed {
    background-color: ${props => props.theme.colors.info}20;
    color: ${props => props.theme.colors.info};
  }
  
  &.cancelled {
    background-color: ${props => props.theme.colors.danger}20;
    color: ${props => props.theme.colors.danger};
  }
`;

const LeadCard = ({ lead }) => {
  console.log('Lead Data:', {
    id: lead?._id,
    location: lead?.location,
    fullLead: lead
  });

  if (!lead) {
    return null;
  }

  const {
    _id,
    title,
    description,
    budget,
    location,
    category,
    client,
    status,
    createdAt,
    metrics
  } = lead;

  const renderLocation = () => {
    // Debug log
    console.log('Rendering location:', location);

    // If no location, return null
    if (!location) return null;

    let displayLocation = '';

    try {
      // If location is a string, use it directly
      if (typeof location === 'string') {
        displayLocation = location;
      } 
      // If location is an object
      else if (typeof location === 'object' && location !== null) {
        // First try formatted address
        if (location.formatted) {
          displayLocation = location.formatted;
        } 
        // Then try individual components
        else {
          const parts = [];
          // Only add parts that exist
          if (location.city) parts.push(location.city);
          if (location.state) parts.push(location.state);
          if (location.country) parts.push(location.country);
          // If no parts, try to get a string representation
          displayLocation = parts.length > 0 ? parts.join(', ') : String(location);
        }
      }

      // If we still don't have a display location, return null
      if (!displayLocation) {
        return null;
      }

      return (
        <LeadMeta>
          <LocationOn fontSize="small" />
          <Typography variant="body2">
            {displayLocation}
          </Typography>
        </LeadMeta>
      );
    } catch (error) {
      console.error('Error rendering location:', error, location);
      return null;
    }
  };

  return (
    <StyledCard>
      <CardContent>
        <LeadHeader>
          <div>
            <LeadTitle variant="h6" component={Link} to={`/leads/${_id}`}>
              {title}
            </LeadTitle>
            <LeadMeta>
              <BusinessCenter fontSize="small" />
              <Typography variant="body2">{category?.name || 'Uncategorized'}</Typography>
            </LeadMeta>
            {renderLocation()}
          </div>
          <StatusChip 
            label={status || 'Unknown'}
            className={(status || 'unknown').toLowerCase()}
            size="small"
          />
        </LeadHeader>

        <Typography variant="body2" color="textSecondary" paragraph>
          {description?.length > 200 
            ? `${description.substring(0, 200)}...` 
            : description}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          {budget && (
            <LeadMeta>
              <AttachMoney fontSize="small" />
              <Typography variant="body2">
                Budget: ${budget?.min || 0} - ${budget?.max || 0} {budget?.currency || 'USD'}
              </Typography>
            </LeadMeta>
          )}
          
          {createdAt && (
            <LeadMeta>
              <Schedule fontSize="small" />
              <Typography variant="body2">
                Posted {format(new Date(createdAt), 'MMM dd, yyyy')}
              </Typography>
            </LeadMeta>
          )}
        </Box>

        <LeadActions>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar src={client?.avatar} alt={client?.username || 'User'}>
              <Person />
            </Avatar>
            <Typography variant="body2">
              {client?.businessName || client?.username || 'Anonymous'}
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Button 
              variant="outlined" 
              size="small"
              component={Link}
              to={`/leads/${_id}`}
            >
              View Details
            </Button>
            {metrics?.proposalCount > 0 && (
              <Chip 
                size="small"
                label={`${metrics.proposalCount} Proposals`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </LeadActions>
      </CardContent>
    </StyledCard>
  );
};

export default LeadCard; 