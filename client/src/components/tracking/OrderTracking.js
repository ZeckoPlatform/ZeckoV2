import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Grid,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { formatDistance } from 'date-fns';
import styled from 'styled-components';

const StyledPaper = styled(Paper)`
    padding: 24px;
    margin-bottom: 24px;
`;

const steps = [
    { label: 'Order Placed', description: 'Your order has been received' },
    { label: 'Processing', description: 'Order is being prepared' },
    { label: 'Shipped', description: 'Order has been shipped' },
    { label: 'Delivered', description: 'Order has been delivered' }
];

const OrderTracking = ({ order }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [trackingEvents, setTrackingEvents] = useState([]);

    useEffect(() => {
        // Set current step based on order status
        const stepIndex = steps.findIndex(step => 
            step.label.toLowerCase() === order.status.toLowerCase()
        );
        setCurrentStep(stepIndex);

        // Simulate tracking events (replace with actual tracking API integration)
        const events = [
            {
                date: order.createdAt,
                status: 'Order Placed',
                location: 'Online'
            },
            {
                date: order.updatedAt,
                status: order.status,
                location: order.shipping?.address?.city || 'Processing Center'
            }
        ];
        setTrackingEvents(events);
    }, [order]);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <StyledPaper>
                    <Typography variant="h5" gutterBottom>
                        Track Order #{order.orderNumber}
                    </Typography>
                    <Box mt={4}>
                        <Stepper activeStep={currentStep} alternativeLabel>
                            {steps.map((step, index) => (
                                <Step key={step.label}>
                                    <StepLabel>
                                        {step.label}
                                        <Typography variant="caption" display="block">
                                            {step.description}
                                        </Typography>
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                </StyledPaper>
            </Grid>

            <Grid item xs={12} md={8}>
                <StyledPaper>
                    <Typography variant="h6" gutterBottom>
                        Tracking History
                    </Typography>
                    <Timeline>
                        {trackingEvents.map((event, index) => (
                            <TimelineItem key={index}>
                                <TimelineSeparator>
                                    <TimelineDot color="primary" />
                                    {index < trackingEvents.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Typography variant="subtitle2">
                                        {event.status}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {event.location} • {formatDistance(new Date(event.date), new Date(), { addSuffix: true })}
                                    </Typography>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                </StyledPaper>
            </Grid>

            <Grid item xs={12} md={4}>
                <StyledPaper>
                    <Typography variant="h6" gutterBottom>
                        Shipping Details
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Delivery Address"
                                secondary={`${order.shipping.address.street}, ${order.shipping.address.city}, ${order.shipping.address.postcode}`}
                            />
                        </ListItem>
                        <Divider />
                        {order.shipping.trackingNumber && (
                            <ListItem>
                                <ListItemText
                                    primary="Tracking Number"
                                    secondary={order.shipping.trackingNumber}
                                />
                            </ListItem>
                        )}
                    </List>
                </StyledPaper>
            </Grid>
        </Grid>
    );
};

export default OrderTracking; 