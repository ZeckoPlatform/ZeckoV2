import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createCheckoutSession } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PRICING_PLANS = [
    {
        id: 'price_basic',
        name: 'Basic Plan',
        credits: 100,
        price: 99,
        features: [
            '100 Lead Credits',
            'Basic Support',
            'Access to Lead Marketplace'
        ]
    },
    {
        id: 'price_pro',
        name: 'Pro Plan',
        credits: 250,
        price: 199,
        features: [
            '250 Lead Credits',
            'Priority Support',
            'Advanced Lead Filtering',
            'Proposal Templates'
        ]
    },
    {
        id: 'price_premium',
        name: 'Premium Plan',
        credits: 500,
        price: 399,
        features: [
            '500 Lead Credits',
            '24/7 Premium Support',
            'Custom Lead Alerts',
            'Analytics Dashboard',
            'Unlimited Proposals'
        ]
    }
];

const PaymentCheckout = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubscribe = async (priceId) => {
        setLoading(true);
        setError(null);

        try {
            const stripe = await stripePromise;
            const { sessionId } = await createCheckoutSession(priceId);

            // Redirect to Stripe Checkout
            const { error } = await stripe.redirectToCheckout({
                sessionId
            });

            if (error) {
                throw new Error(error.message);
            }
        } catch (err) {
            setError('Failed to initiate checkout. Please try again.');
            console.error('Checkout error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="payment-checkout">
            <h2>Choose Your Plan</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="pricing-plans">
                {PRICING_PLANS.map((plan) => (
                    <div key={plan.id} className="plan-card">
                        <div className="plan-header">
                            <h3>{plan.name}</h3>
                            <div className="plan-price">
                                <span className="currency">$</span>
                                <span className="amount">{plan.price}</span>
                                <span className="period">/month</span>
                            </div>
                        </div>

                        <div className="plan-features">
                            <ul>
                                {plan.features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => handleSubscribe(plan.id)}
                            className="btn btn-primary btn-subscribe"
                            disabled={loading}
                        >
                            Subscribe Now
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentCheckout; 