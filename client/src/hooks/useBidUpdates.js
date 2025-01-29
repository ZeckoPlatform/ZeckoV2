import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '@/services/notificationService';

export const useBidUpdates = (auctionId) => {
    const [currentBid, setCurrentBid] = useState(null);
    const [bidHistory, setBidHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { socket } = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        if (!socket || !auctionId) return;

        // Join auction room
        socket.emit('joinAuction', auctionId);

        // Handle bid updates
        const handleBidUpdate = (data) => {
            setCurrentBid(data.currentBid);
            setBidHistory(prev => [data.bid, ...prev]);

            // Handle notifications
            if (data.bid.bidder !== user?._id) {
                if (data.outbidUserId === user?._id) {
                    notificationService.notify({
                        type: 'BID_OUTBID',
                        title: 'You\'ve Been Outbid!',
                        message: `Someone has placed a higher bid of ${data.currentBid} on this item`,
                        data: {
                            auctionId,
                            amount: data.currentBid
                        }
                    });
                }
            }
        };

        // Handle auction end
        const handleAuctionEnd = (data) => {
            if (data.winnerId === user?._id) {
                notificationService.notify({
                    type: 'AUCTION_WON',
                    title: 'Congratulations!',
                    message: 'You won the auction!',
                    data: {
                        auctionId,
                        finalPrice: data.finalPrice
                    }
                });
            }
        };

        // Fetch initial bid history
        const fetchBidHistory = async () => {
            try {
                const response = await fetch(`/api/auctions/${auctionId}/bids`);
                if (response.ok) {
                    const data = await response.json();
                    setBidHistory(data.data.bids);
                    setCurrentBid(data.data.currentBid);
                }
            } catch (error) {
                console.error('Error fetching bid history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        socket.on('bidUpdate', handleBidUpdate);
        socket.on('auctionEnd', handleAuctionEnd);
        fetchBidHistory();

        return () => {
            socket.off('bidUpdate', handleBidUpdate);
            socket.off('auctionEnd', handleAuctionEnd);
            socket.emit('leaveAuction', auctionId);
        };
    }, [socket, auctionId, user]);

    const placeBid = async (amount) => {
        try {
            const response = await fetch(`/api/auctions/${auctionId}/bids`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to place bid');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    };

    return {
        currentBid,
        bidHistory,
        isLoading,
        placeBid
    };
}; 