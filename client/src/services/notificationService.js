import { socketService } from './socketService';

class NotificationService {
    constructor() {
        this.handlers = new Set();
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        socketService.addNotificationHandler((data) => {
            if (data.type.startsWith('BID_')) {
                this.notifyHandlers(this.formatBidNotification(data));
            }
        });
    }

    formatBidNotification(data) {
        const notifications = {
            BID_PLACED: {
                title: 'New Bid Placed',
                message: `Your bid of ${data.amount} has been placed successfully`,
                type: 'success'
            },
            BID_OUTBID: {
                title: 'You\'ve Been Outbid',
                message: `Someone has placed a higher bid on ${data.productTitle}`,
                type: 'warning'
            },
            BID_WON: {
                title: 'Auction Won',
                message: `Congratulations! You won the auction for ${data.productTitle}`,
                type: 'success'
            },
            BID_ENDED: {
                title: 'Auction Ended',
                message: `The auction for ${data.productTitle} has ended`,
                type: 'info'
            },
            BID_AUTO_PLACED: {
                title: 'Auto-Bid Placed',
                message: `Automatic bid of ${data.amount} placed on ${data.productTitle}`,
                type: 'info'
            }
        };

        return {
            id: Date.now(),
            ...notifications[data.type],
            data: data,
            timestamp: new Date()
        };
    }

    subscribe(handler) {
        this.handlers.add(handler);
        return () => this.handlers.delete(handler);
    }

    notifyHandlers(notification) {
        this.handlers.forEach(handler => handler(notification));
    }

    async checkUserPreferences(type) {
        try {
            const response = await fetch('/api/bidder/preferences');
            if (!response.ok) return true; // Default to showing notifications if fetch fails
            
            const { data } = await response.json();
            
            switch (type) {
                case 'BID_OUTBID':
                    return data.notifyOutbid;
                case 'AUCTION_ENDING':
                    return data.notifyAuctionEnd;
                case 'WATCHED_ITEM':
                    return data.notifyWatchedItems;
                default:
                    return true;
            }
        } catch (error) {
            console.error('Error checking notification preferences:', error);
            return true; // Default to showing notifications on error
        }
    }

    async notify(notification) {
        const shouldNotify = await this.checkUserPreferences(notification.type);
        if (!shouldNotify) return;

        // Your existing notification logic
        this.notifyHandlers(notification);

        // Handle email notifications if enabled
        if (notification.emailNotification) {
            await this.sendEmailNotification(notification);
        }
    }

    async sendEmailNotification(notification) {
        try {
            const response = await fetch('/api/notifications/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notification)
            });
            
            if (!response.ok) {
                throw new Error('Failed to send email notification');
            }
        } catch (error) {
            console.error('Error sending email notification:', error);
        }
    }
}

export const notificationService = new NotificationService();
export default notificationService; 