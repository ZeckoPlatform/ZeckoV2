import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress
} from '@mui/material';
import { 
  Notifications,
  Mail,
  MonetizationOn,
  Assignment,
  Check
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';

const NotificationContainer = styled.div`
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  background: ${({ theme }) => theme.palette.background.paper};
  box-shadow: ${({ theme }) => theme.shadows[1]};
`;

const NotificationHeader = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const NotificationItem = styled(ListItem)`
  background: ${({ theme, unread }) => 
    unread ? theme.palette.action.hover : 'transparent'};
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const getNotificationIcon = (type) => {
  switch (type) {
    case 'proposal':
      return <Assignment color="primary" />;
    case 'message':
      return <Mail color="primary" />;
    case 'payment':
      return <MonetizationOn color="primary" />;
    default:
      return <Notifications color="primary" />;
  }
};

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    fetchNotifications();
    
    if (socket) {
      socket.on('notification', handleNewNotification);
      return () => socket.off('notification', handleNewNotification);
    }
  }, [socket]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await api.post(`/notifications/${notification._id}/read`);
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => prev - 1);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    // Navigate to relevant page based on notification type
    setAnchorEl(null);
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={unreadCount} color="primary">
          <Notifications />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <NotificationContainer>
          <NotificationHeader>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                size="small"
                startIcon={<Check />}
                onClick={markAllRead}
              >
                Mark all read
              </Button>
            )}
          </NotificationHeader>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <CircularProgress />
            </div>
          ) : notifications.length > 0 ? (
            <List>
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification._id}
                  unread={!notification.read}
                  button
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={notification.title}
                    secondary={notification.message}
                  />
                </NotificationItem>
              ))}
            </List>
          ) : (
            <EmptyState>
              No notifications
            </EmptyState>
          )}
        </NotificationContainer>
      </Popover>
    </>
  );
};

export default NotificationCenter; 