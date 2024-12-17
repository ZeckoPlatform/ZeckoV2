import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    Button,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Switch,
    Chip
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import styled from 'styled-components';

const PlanCard = styled(Paper)`
    padding: 24px;
    height: 100%;
    display: flex;
    flex-direction: column;
    ${props => props.featured && `
        border: 2px solid ${props.theme.palette.primary.main};
        transform: scale(1.05);
    `}
`;

const PriceText = styled(Typography)`
    font-size: 48px;
    font-weight: bold;
    color: ${props => props.theme.palette.primary.main};
`;

const PlanSelector = ({ plans, selectedPlan, onSelectPlan, billingCycle, onChangeBillingCycle }) => {
    return (
        <Box>
            <Box display="flex" justifyContent="center" mb={4}>
                <Typography component="span" mr={1}>Monthly</Typography>
                <Switch
                    checked={billingCycle === 'yearly'}
                    onChange={(e) => onChangeBillingCycle(e.target.checked ? 'yearly' : 'monthly')}
                />
                <Typography component="span" ml={1}>
                    Yearly <Chip size="small" label="Save 20%" color="primary" />
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {plans.map((plan) => (
                    <Grid item xs={12} md={4} key={plan._id}>
                        <PlanCard featured={plan.name === 'Professional'}>
                            <Typography variant="h5" gutterBottom>
                                {plan.name}
                            </Typography>
                            
                            <PriceText>
                                £{billingCycle === 'yearly' ? plan.price.yearly / 12 : plan.price.monthly}
                            </PriceText>
                            <Typography color="textSecondary" gutterBottom>
                                per month
                            </Typography>

                            {billingCycle === 'yearly' && (
                                <Typography variant="body2" color="primary" gutterBottom>
                                    Billed £{plan.price.yearly} yearly
                                </Typography>
                            )}

                            <List>
                                {plan.features.map((feature, index) => (
                                    <ListItem key={index} dense>
                                        <ListItemIcon>
                                            {feature.included ? (
                                                <CheckIcon color="primary" />
                                            ) : (
                                                <CloseIcon color="disabled" />
                                            )}
                                        </ListItemIcon>
                                        <ListItemText primary={feature.name} />
                                    </ListItem>
                                ))}
                            </List>

                            <Box mt="auto" pt={2}>
                                <Button
                                    fullWidth
                                    variant={selectedPlan === plan._id ? "contained" : "outlined"}
                                    color="primary"
                                    onClick={() => onSelectPlan(plan._id)}
                                >
                                    {selectedPlan === plan._id ? 'Current Plan' : 'Select Plan'}
                                </Button>
                            </Box>
                        </PlanCard>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default PlanSelector; 