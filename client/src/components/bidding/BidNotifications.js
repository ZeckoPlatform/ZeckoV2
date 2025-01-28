import React, { useState, useEffect } from 'react';
import {
    Snackbar,
    Alert,
    Badge,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { formatDistance } from 'date-fns';
import { notificationService } from '@/services/notificationService';

const BidNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentSnackbar, setCurrentSnackbar] = useState(null);

    useEffect(() => {
        const unsubscribe = notificationService.subscribe(notification => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            setCurrentSnackbar(notification);
        });

        return () => unsubscribe();
    }, []);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setUnreadCount(0);
    };

    const handleSnackbarClose = () => {
        setCurrentSnackbar(null);
    };

    const handleNotificationClick = (notification) => {
        // Navigate to relevant product/bid page
        if (notification.data.productId) {
            window.location.href = `/products/${notification.data.productId}`;
        }
        handleMenuClose();
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleMenuOpen}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        maxHeight: 400,
                        width: 360
                    }
                }}
            >
                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2">No notifications</Typography>
                    </MenuItem>
                ) : (
                    notifications.map((notification, index) => (
                        <React.Fragment key={notification.id}>
                            <MenuItem 
                                onClick={() => handleNotificationClick(notification)}
                                sx={{ 
                                    display: 'block',
                                    py: 1,
                                    px: 2
                                }}
                            >
                                <Typography variant="subtitle2" gutterBottom>
                                    {notification.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {notification.message}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDistance(notification.timestamp, new Date(), { addSuffix: true })}
                                </Typography>
                            </MenuItem>
                            {index < notifications.length - 1 && <Divider />}
                        </React.Fragment>
                    ))
                )}
            </Menu>

            <Snackbar
                open={Boolean(currentSnackbar)}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                {currentSnackbar && (
                    <Alert 
                        onClose={handleSnackbarClose}
                        severity={currentSnackbar.type}
                        sx={{ width: '100%' }}
                    >
                        <Box>
                            <Typography variant="subtitle2">
                                {currentSnackbar.title}
                            </Typography>
                            <Typography variant="body2">
                                {currentSnackbar.message}
                            </Typography>
                        </Box>
                    </Alert>
                )}
            </Snackbar>
        </>
    );
};

export default BidNotifications; 