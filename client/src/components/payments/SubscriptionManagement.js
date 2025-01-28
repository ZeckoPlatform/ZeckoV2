import { useState, useEffect } from 'react';
import { getSubscriptionDetails, cancelSubscription } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const SubscriptionManagement = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const data = await getSubscriptionDetails();
            setSubscription(data);
        } catch (err) {
            setError('Error loading subscription details');
            console.error('Subscription details error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('Are you sure you want to cancel your subscription?')) {
            return;
        }

        setCancelling(true);
        try {
            await cancelSubscription();
            await fetchSubscription(); // Refresh subscription details
        } catch (err) {
            setError('Error cancelling subscription');
            console.error('Cancel subscription error:', err);
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!subscription) return <div>No active subscription found</div>;

    return (
        <div className="subscription-management">
            <h3>Subscription Details</h3>
            
            <div className="subscription-details">
                <div className="detail-row">
                    <span>Plan:</span>
                    <strong>{subscription.planName}</strong>
                </div>
                <div className="detail-row">
                    <span>Status:</span>
                    <span className={`badge bg-${subscription.status === 'active' ? 'success' : 'warning'}`}>
                        {subscription.status}
                    </span>
                </div>
                <div className="detail-row">
                    <span>Next Billing Date:</span>
                    <strong>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</strong>
                </div>
                <div className="detail-row">
                    <span>Monthly Amount:</span>
                    <strong>${subscription.amount}</strong>
                </div>
            </div>

            {subscription.status === 'active' && (
                <div className="subscription-actions mt-4">
                    <button
                        onClick={handleCancelSubscription}
                        className="btn btn-danger"
                        disabled={cancelling}
                    >
                        {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                    <p className="text-muted mt-2">
                        Your subscription will remain active until the end of the current billing period.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement; 