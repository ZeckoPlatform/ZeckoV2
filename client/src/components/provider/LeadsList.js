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

const LeadItem = styled(ListItem)`
    border-bottom: 1px solid ${props => props.theme.colors.background.paper};
    &:last-child {
        border-bottom: none;
    }
`;

const StatusChip = styled(Chip)`
    margin-right: 8px;
`;

const LeadsList = () => {
    const { requests } = useService();
    const navigate = useNavigate();

    const handleViewLead = (leadId) => {
        navigate(`/provider/leads/${leadId}`);
    };

    return (
        <List>
            {requests.map((lead) => (
                <LeadItem key={lead._id}>
                    <ListItemText
                        primary={
                            <Typography variant="subtitle1">
                                {lead.title}
                            </Typography>
                        }
                        secondary={
                            <Box>
                                <StatusChip 
                                    size="small"
                                    label={lead.status}
                                    color={lead.status === 'active' ? 'primary' : 'default'}
                                />
                                <Typography variant="body2" component="span">
                                    {lead.location.city} • Posted {new Date(lead.createdAt).toLocaleDateString()}
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