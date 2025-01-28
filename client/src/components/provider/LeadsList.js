import React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Button,
    Chip,
    Typography,
    Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useService } from '../../contexts/ServiceContext';
import styled from 'styled-components';
import { jobCategories } from '../../data/leadCategories';

const LeadItem = styled(ListItem)`
    border-bottom: 1px solid ${props => props.theme.colors.background.paper};
    &:last-child {
        border-bottom: none;
    }
`;

const LeadsList = ({ leads = [] }) => {
    const navigate = useNavigate();

    const handleViewLead = (leadId) => {
        navigate(`/leads/${leadId}`);
    };

    return (
        <List>
            {leads.map((lead) => (
                <LeadItem key={lead._id}>
                    <ListItemText
                        primary={lead.title}
                        secondary={
                            <Box>
                                <Chip
                                    label={lead.status}
                                    size="small"
                                    color={lead.status === 'active' ? 'primary' : 'default'}
                                />
                                <Typography variant="body2" component="span">
                                    {lead.location?.city ? `${lead.location.city} • ` : ''} 
                                    Posted {new Date(lead.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        }
                    />
                    <ListItemSecondaryAction>
                        <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleViewLead(lead._id)}
                        >
                            View Details
                        </Button>
                    </ListItemSecondaryAction>
                </LeadItem>
            ))}
        </List>
    );
};

export default LeadsList; 