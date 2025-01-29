import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '@/services/notificationService';

export const useAuctionNotifications = () => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!socket || !user) return;

        const handleAuctionEvent = (data) => {
            switch (data.type) {
                case 'BID_OUTBID':
                case 'AUCTION_ENDING':
                case 'AUCTION_WON':
                case 'BID_ACCEPTED':
                case 'NEW_BID':
                    notificationService.notifyHandlers({
                        id: Date.now(),
                        type: data.type,
                        title: getNotificationTitle(data.type),
                        message: formatNotificationMessage(data),
                        data: data,
                        timestamp: new Date()
                    });
                    break;
                default:
                    break;
            }
        };

        socket.on('auctionEvent', handleAuctionEvent);

        return () => {
            socket.off('auctionEvent', handleAuctionEvent);
        };
    }, [socket, user]);

    const getNotificationTitle = (type) => {
        const titles = {
            BID_OUTBID: "You've Been Outbid!",
            AUCTION_ENDING: "Auction Ending Soon",
            AUCTION_WON: "Congratulations! You Won",
            BID_ACCEPTED: "Bid Accepted",
            NEW_BID: "New Bid Received"
        };
        return titles[type] || 'Auction Update';
    };

    const formatNotificationMessage = (data) => {
        switch (data.type) {
            case 'BID_OUTBID':
                return `Someone has placed a higher bid of ${data.amount} on ${data.productTitle}`;
            case 'AUCTION_ENDING':
                return `${data.productTitle} auction ends in ${data.timeLeft}`;
            case 'AUCTION_WON':
                return `You won the auction for ${data.productTitle}`;
            case 'BID_ACCEPTED':
                return `Your bid of ${data.amount} was accepted for ${data.productTitle}`;
            case 'NEW_BID':
                return `New bid of ${data.amount} received for ${data.productTitle}`;
            default:
                return data.message || 'New auction update';
        }
    };

    return { notifications };
}; 