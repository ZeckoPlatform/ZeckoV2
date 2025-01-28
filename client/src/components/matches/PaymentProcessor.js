import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Stepper,
    Step,
    StepLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider
} from '@mui/material';
import {
    Payment as PaymentIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { format } from 'date-fns';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ matchId, amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message);
            setProcessing(false);
            return;
        }

        const { clientSecret } = await fetch(`/api/matches/${matchId}/payments/intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        }).then(r => r.json());

        const { error: confirmError } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `${window.location.origin}/matches/${matchId}/payment-confirmation`
            }
        });

        if (confirmError) {
            setError(confirmError.message);
            onError(confirmError);
        } else {
            onSuccess();
        }

        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
            <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!stripe || processing}
                startIcon={processing ? <CircularProgress size={20} /> : <PaymentIcon />}
                sx={{ mt: 3 }}
            >
                {processing ? 'Processing...' : `Pay ${amount} USD`}
            </Button>
        </form>
    );
};

const PaymentHistory = ({ matchId }) => {
    const { data: history, isLoading } = useQuery({
        queryKey: ['paymentHistory', matchId],
        queryFn: async () => {
            const response = await fetch(`/api/matches/${matchId}/payments/history`);
            if (!response.ok) throw new Error('Failed to fetch payment history');
            return response.json();
        }
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Payment History
            </Typography>
            <List>
                {history.payments.map((payment) => (
                    <ListItem key={payment._id}>
                        <ListItemText
                            primary={`${payment.amount} ${payment.currency.toUpperCase()}`}
                            secondary={format(new Date(payment.createdAt), 'MMM d, yyyy HH:mm')}
                        />
                        <Chip
                            label={payment.status.toUpperCase()}
                            color={payment.status === 'completed' ? 'success' : 'error'}
                            icon={payment.status === 'completed' ? <CheckCircleIcon /> : <ErrorIcon />}
                        />
                    </ListItem>
                ))}
            </List>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Payment Statistics
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                            Total Amount
                        </Typography>
                        <Typography variant="h6">
                            ${history.stats.totalAmount}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                            Successful Payments
                        </Typography>
                        <Typography variant="h6">
                            {history.stats.successfulPayments}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

const PaymentProcessor = ({ matchId, amount }) => {
    const [showHistory, setShowHistory] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handlePaymentSuccess = () => {
        setPaymentSuccess(true);
    };

    const handlePaymentError = (error) => {
        console.error('Payment failed:', error);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Payment Processing</Typography>
                <Button
                    variant="outlined"
                    onClick={() => setShowHistory(true)}
                >
                    View History
                </Button>
            </Box>

            {paymentSuccess ? (
                <Alert
                    severity="success"
                    icon={<CheckCircleIcon />}
                    sx={{ mb: 3 }}
                >
                    Payment processed successfully!
                </Alert>
            ) : (
                <Elements stripe={stripePromise}>
                    <PaymentForm
                        matchId={matchId}
                        amount={amount}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                    />
                </Elements>
            )}

            <Dialog
                open={showHistory}
                onClose={() => setShowHistory(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Payment History</DialogTitle>
                <DialogContent>
                    <PaymentHistory matchId={matchId} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowHistory(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default PaymentProcessor; 