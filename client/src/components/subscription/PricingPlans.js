import React from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PricingPlans = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const plans = [
        {
            name: 'Basic',
            price: 29.99,
            period: 'month',
            features: [
                'Up to 10 leads per month',
                'Basic auction participation',
                'Standard support',
                'Basic analytics'
            ],
            leadsIncluded: 10,
            auctionLimit: 5,
            recommended: false
        },
        {
            name: 'Professional',
            price: 79.99,
            period: 'month',
            features: [
                'Up to 50 leads per month',
                'Priority auction access',
                'Priority support',
                'Advanced analytics',
                'Featured profile listing',
                'Custom notifications'
            ],
            leadsIncluded: 50,
            auctionLimit: 20,
            recommended: true
        },
        {
            name: 'Enterprise',
            price: 199.99,
            period: 'month',
            features: [
                'Unlimited leads',
                'Premium auction features',
                '24/7 dedicated support',
                'Advanced analytics & reporting',
                'Featured profile listing',
                'Custom notifications',
                'API access',
                'Custom integration support'
            ],
            leadsIncluded: 'Unlimited',
            auctionLimit: 'Unlimited',
            recommended: false
        }
    ];

    const handleSubscribe = (plan) => {
        navigate('/subscription/checkout', { 
            state: { selectedPlan: plan }
        });
    };

    return (
        <Box py={4}>
            <Typography variant="h4" align="center" gutterBottom>
                Choose Your Plan
            </Typography>
            <Typography variant="subtitle1" align="center" color="textSecondary" mb={6}>
                Get access to leads and auction features that suit your business
            </Typography>

            <Grid container spacing={4} justifyContent="center">
                {plans.map((plan) => (
                    <Grid item xs={12} md={4} key={plan.name}>
                        <Card 
                            elevation={plan.recommended ? 8 : 2}
                            sx={{
                                height: '100%',
                                position: 'relative',
                                transform: plan.recommended ? 'scale(1.05)' : 'none',
                                transition: 'transform 0.2s ease-in-out'
                            }}
                        >
                            {plan.recommended && (
                                <Chip
                                    label="Recommended"
                                    color="primary"
                                    sx={{
                                        position: 'absolute',
                                        top: -12,
                                        right: 20
                                    }}
                                />
                            )}
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" component="h2" gutterBottom>
                                    {plan.name}
                                </Typography>
                                <Typography variant="h3" component="div" gutterBottom>
                                    ${plan.price}
                                    <Typography variant="subtitle1" component="span" color="textSecondary">
                                        /{plan.period}
                                    </Typography>
                                </Typography>

                                <List>
                                    {plan.features.map((feature) => (
                                        <ListItem key={feature} disableGutters>
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <CheckCircleIcon color="primary" />
                                            </ListItemIcon>
                                            <ListItemText primary={feature} />
                                        </ListItem>
                                    ))}
                                </List>

                                <Button
                                    variant={plan.recommended ? "contained" : "outlined"}
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    onClick={() => handleSubscribe(plan)}
                                    sx={{ mt: 2 }}
                                >
                                    {user?.subscription?.plan === plan.name 
                                        ? 'Current Plan' 
                                        : 'Subscribe Now'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default PricingPlans; 