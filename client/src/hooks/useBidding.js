import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

export const useBidding = (productId) => {
    const [bids, setBids] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { socket, connected } = useSocket();
    const { user } = useAuth();

    // Fetch initial bids
    useEffect(() => {
        const fetchBids = async () => {
            try {
                const response = await fetch(`/api/bids/product/${productId}`);
                if (!response.ok) throw new Error('Failed to fetch bids');
                const data = await response.json();
                setBids(data.data.bids);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (productId) {
            fetchBids();
        }
    }, [productId]);

    // Socket connection for real-time updates
    useEffect(() => {
        if (!socket || !connected || !productId) return;

        // Join product room
        socket.emit('join:userType', 'product', productId);

        const handleBidUpdate = (data) => {
            if (data.type === 'NEW_BID' && data.data.product._id === productId) {
                setBids(prev => [data.data.bid, ...prev]);
            }
        };

        socket.on('activityUpdate', handleBidUpdate);

        return () => {
            socket.off('activityUpdate', handleBidUpdate);
            socket.emit('leave:userType', 'product', productId);
        };
    }, [socket, connected, productId]);

    const placeBid = useCallback(async (amount) => {
        try {
            setError(null);
            const response = await fetch('/api/bids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product: productId,
                    amount: parseFloat(amount)
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to place bid');
            }

            const data = await response.json();
            return data.data.bid;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [productId]);

    return {
        bids,
        isLoading,
        error,
        placeBid,
        isConnected: connected,
        canBid: user && connected
    };
}; 