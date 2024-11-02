import io from 'socket.io-client';
import { toast } from 'react-toastify'; // If you're using toast notifications

class NotificationService {
  constructor() {
    this.socket = io('http://localhost:5000');
    this.notifications = [];
    this.listeners = new Set();
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.on('new_notification', (notification) => {
      this.notifications.unshift(notification);
      this.notifyListeners();
      
      // Show toast notification based on type
      switch(notification.type) {
        case 'new_order':
          toast.success(`Order #${notification.metadata.orderNumber} placed successfully!`);
          break;
        case 'order_status':
          toast.info(`Order #${notification.metadata.orderNumber} ${notification.message}`);
          break;
        case 'order_shipped':
          toast.info(`Order #${notification.metadata.orderNumber} has been shipped!`);
          break;
        case 'order_delivered':
          toast.success(`Order #${notification.metadata.orderNumber} has been delivered!`);
          break;
        default:
          toast.info(notification.message);
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification service');
      this.authenticate();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
    });
  }

  authenticate() {
    const token = localStorage.getItem('token');
    if (token) {
      this.socket.emit('authenticate', token);
    }
  }

  async fetchNotifications() {
    try {
      const response = await fetch('http://localhost:5000/api/users/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      this.notifications = data;
      this.notifyListeners();
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await fetch(`http://localhost:5000/api/users/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      this.notifications = this.notifications.map(notification =>
        notification._id === notificationId ? { ...notification, read: true } : notification
      );
      this.notifyListeners();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const response = await fetch('http://localhost:5000/api/users/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      
      this.notifications = this.notifications.map(notification => ({
        ...notification,
        read: true
      }));
      this.notifyListeners();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Create a singleton instance
const notificationService = new NotificationService();
export default notificationService; 