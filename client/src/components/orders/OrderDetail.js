import React, { useState } from 'react';
import {
    Paper,
    Grid,
    Typography,
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/format';

const steps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];

const OrderDetail = ({ order, onUpdateStatus }) => {
    const { user } = useAuth();
    const [trackingDialog, setTrackingDialog] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const isVendor = user.role === 'vendor';

    const currentStep = steps.indexOf(order.status.charAt(0).toUpperCase() + order.status.slice(1));

    const handleUpdateStatus = async (newStatus) => {
        if (newStatus === 'shipped' && !order.shipping.trackingNumber) {
            setTrackingDialog(true);
            return;
        }
        await onUpdateStatus(newStatus);
    };

    const handleTrackingSubmit = async () => {
        await onUpdateStatus('shipped', trackingNumber);
        setTrackingDialog(false);
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5">
                            Order #{order.orderNumber}
                        </Typography>
                        <Typography color="textSecondary">
                            {new Date(order.createdAt).toLocaleString()}
                        </Typography>
                    </Box>

                    <Stepper activeStep={currentStep}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {isVendor && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <Box mt={3} display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                onClick={() => handleUpdateStatus(steps[currentStep + 1].toLowerCase())}
                            >
                                Mark as {steps[currentStep + 1]}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Order Items
                    </Typography>
                    <List>
                        {order.items.map((item) => (
                            <ListItem key={item._id}>
                                <ListItemText
                                    primary={item.product.name}
                                    secondary={`Quantity: ${item.quantity}`}
                                />
                                <Typography>
                                    {formatCurrency(item.price * item.quantity)}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                    <Divider />
                    <Box mt={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography>Subtotal:</Typography>
                                <Typography>Shipping:</Typography>
                                <Typography variant="h6" mt={1}>Total:</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography>{formatCurrency(order.subtotal)}</Typography>
                                <Typography>{formatCurrency(order.shipping.cost)}</Typography>
                                <Typography variant="h6" mt={1}>{formatCurrency(order.total)}</Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Shipping Details
                    </Typography>
                    <Typography>
                        {order.shipping.address.street}<br />
                        {order.shipping.address.city}<br />
                        {order.shipping.address.state} {order.shipping.address.postcode}<br />
                        {order.shipping.address.country}
                    </Typography>
                    {order.shipping.trackingNumber && (
                        <Box mt={2}>
                            <Typography color="textSecondary">
                                Tracking Number:
                            </Typography>
                            <Typography>
                                {order.shipping.trackingNumber}
                            </Typography>
                        </Box>
                    )}
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Payment Information
                    </Typography>
                    <Typography>
                        Method: {order.payment.method}<br />
                        Status: {order.payment.status}<br />
                        Transaction ID: {order.payment.transactionId}
                    </Typography>
                </Paper>
            </Grid>

            <Dialog open={trackingDialog} onClose={() => setTrackingDialog(false)}>
                <DialogTitle>Enter Tracking Number</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Tracking Number"
                        fullWidth
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTrackingDialog(false)}>Cancel</Button>
                    <Button onClick={handleTrackingSubmit} variant="contained">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default OrderDetail; 