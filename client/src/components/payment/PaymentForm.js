import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    PaymentElement,
    useStripe,
    useElements,
    Elements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentFormContent = ({ amount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message);
            setProcessing(false);
            return;
        }

        const { error: confirmError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment/complete`,
            },
        });

        if (confirmError) {
            setError(confirmError.message);
        } else {
            onSuccess();
        }

        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                    Payment Details
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                    Amount to pay: £{amount}
                </Typography>
            </Box>

            <PaymentElement />

            {error && (
                <Box mt={2}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}

            <Box mt={3}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={!stripe || processing}
                >
                    {processing ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        `Pay £${amount}`
                    )}
                </Button>
            </Box>
        </form>
    );
};

const PaymentForm = ({ clientSecret, amount, onSuccess }) => {
    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#1976d2',
            },
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <PaymentFormContent amount={amount} onSuccess={onSuccess} />
        </Elements>
    );
};

export default PaymentForm; 