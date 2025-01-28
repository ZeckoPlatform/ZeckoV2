import React from 'react';
import { 
    Paper, 
    Typography, 
    Button, 
    Box,
    IconButton,
    Card,
    CardContent,
    CardActions
} from '@mui/material';
import { 
    Edit as EditIcon,
    Delete as DeleteIcon,
    Star as StarIcon
} from '@mui/icons-material';
import styled from 'styled-components';

const AddressCard = styled(Card)`
    margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const AddressSection = ({ 
    addresses, 
    onAddAddress, 
    onEditAddress, 
    onDeleteAddress, 
    onSetDefaultAddress 
}) => {
    return (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Business Addresses</Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={onAddAddress}
                >
                    Add New Address
                </Button>
            </Box>

            {addresses.map((address, index) => (
                <AddressCard key={index}>
                    <CardContent>
                        <Typography variant="subtitle1">
                            {address.street}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {address.city}, {address.state} {address.zipCode}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {address.country}
                        </Typography>
                        {address.isDefault && (
                            <Typography 
                                variant="caption" 
                                color="primary"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                                <StarIcon fontSize="small" />
                                Default Address
                            </Typography>
                        )}
                    </CardContent>
                    <CardActions>
                        <IconButton 
                            size="small" 
                            onClick={() => onEditAddress(address)}
                        >
                            <EditIcon />
                        </IconButton>
                        <IconButton 
                            size="small" 
                            onClick={() => onDeleteAddress(address.id)}
                        >
                            <DeleteIcon />
                        </IconButton>
                        {!address.isDefault && (
                            <Button 
                                size="small"
                                onClick={() => onSetDefaultAddress(address.id)}
                            >
                                Set as Default
                            </Button>
                        )}
                    </CardActions>
                </AddressCard>
            ))}
        </Paper>
    );
};

export default AddressSection; 