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
              <Typography variant="body2">{category?.name}</Typography>
              {location?.city && (
                <>
                  <LocationOn fontSize="small" />
                  <Typography variant="body2">
                    {location.city}, {location.country}
                  </Typography>
                </>
              )}
            </LeadMeta>
          </div>
          <StatusChip 
            label={status}
            className={status.toLowerCase()}
            size="small"
          />
        </LeadHeader>

        <Typography variant="body2" color="textSecondary" paragraph>
          {description.length > 200 
            ? `${description.substring(0, 200)}...` 
            : description}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <LeadMeta>
            <AttachMoney fontSize="small" />
            <Typography variant="body2">
              Budget: ${budget.min} - ${budget.max} {budget.currency}
            </Typography>
          </LeadMeta>
          
          <LeadMeta>
            <Schedule fontSize="small" />
            <Typography variant="body2">
              Posted {format(new Date(createdAt), 'MMM dd, yyyy')}
            </Typography>
          </LeadMeta>
        </Box>

        <LeadActions>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar src={client?.avatar} alt={client?.username}>
              <Person />
            </Avatar>
            <Typography variant="body2">
              {client?.businessName || client?.username}
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