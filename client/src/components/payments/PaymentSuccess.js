import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Verify the session if needed
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
            navigate('/dashboard');
            return;
        }

        // Countdown and redirect
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/dashboard');
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, searchParams]);

    return (
        <div className="payment-success">
            <div className="success-content">
                <i className="fas fa-check-circle success-icon"></i>
                <h2>Payment Successful!</h2>
                <p>Thank you for your purchase. Your credits have been added to your account.</p>
                <p>Redirecting to dashboard in {countdown} seconds...</p>
                <LoadingSpinner />
            </div>
        </div>
    );
};

export default PaymentSuccess; 