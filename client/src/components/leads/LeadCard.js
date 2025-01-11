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

const LeadMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const LeadCard = ({ lead }) => {
  if (!lead) return null;

  const {
    _id,
    title,
    description,
    budget,
    location = {},
    category,
    client,
    status,
    createdAt,
    metrics
  } = lead;

  const renderLocation = () => {
    try {
      const locationParts = [];
      if (location?.city) locationParts.push(location.city);
      if (location?.state) locationParts.push(location.state);
      if (location?.country) locationParts.push(location.country);
      
      const locationString = locationParts.join(', ');
      
      return locationString ? (
        <LeadMeta>
          <LocationOn fontSize="small" />
          <Typography variant="body2">{locationString}</Typography>
        </LeadMeta>
      ) : null;
    } catch (error) {
      console.error('Error rendering location:', error);
      return null;
    }
  };

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>

        <Typography variant="body2" color="textSecondary" paragraph>
          {description}
        </Typography>

        <Box display="flex" flexDirection="column" gap={1} mb={2}>
          <LeadMeta>
            <BusinessCenter fontSize="small" />
            <Typography variant="body2">{category}</Typography>
          </LeadMeta>

          {budget?.min && budget?.max && (
            <LeadMeta>
              <AttachMoney fontSize="small" />
              <Typography variant="body2">
                {`£${budget.min.toLocaleString()} - £${budget.max.toLocaleString()}`}
              </Typography>
            </LeadMeta>
          )}

          {renderLocation()}

          {createdAt && (
            <LeadMeta>
              <Schedule fontSize="small" />
              <Typography variant="body2">
                Posted {format(new Date(createdAt), 'MMM dd, yyyy')}
              </Typography>
            </LeadMeta>
          )}
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
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
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default LeadCard; 