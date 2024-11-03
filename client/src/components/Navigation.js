import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { Bell, BellOff } from 'react-feather';
import VolumeControl from './VolumeControl';

const Nav = styled.nav`
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const TopBar = styled.div`
  background-color: var(--primary-color);
  padding: 0.5rem 0;
  color: white;
`;

const TopBarContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
  padding: 0 1rem;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem;
  transition: color 0.3s;

  &:hover {
    color: var(--primary-color);
  }
`;

const Button = styled.button`
  background-color: ${props => props.secondary ? 'white' : 'var(--primary-color)'};
  color: ${props => props.secondary ? 'var(--primary-color)' : 'white'};
  border: ${props => props.secondary ? '1px solid var(--primary-color)' : 'none'};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: ${props => props.secondary ? 'var(--primary-color)' : 'var(--primary-color-dark)'};
    color: white;
  }
`;

const TopBarButton = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.25rem 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MainNav = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavButton = styled(Link)`
  padding: 0.5rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;

  &:hover {
    color: var(--primary-color);
  }
`;

const NotificationIcon = styled.div`
  position: relative;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;

  svg {
    animation: ${props => props.hasNewNotification ? `${shake} 1s ease-in-out` : 'none'};
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ff4444;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(50%, -50%);
  animation: ${props => props.hasNewNotification ? `${pulse} 1s ease-in-out` : 'none'};
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

const shake = keyframes`
  0% { transform: rotate(0); }
  25% { transform: rotate(10deg); }
  50% { transform: rotate(0); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(0); }
`;

const SoundToggle = styled.button`
  background: none;
  border: none;
  padding: 5px;
  cursor: pointer;
  color: ${props => props.isMuted ? '#888' : 'var(--primary-color)'};
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;

  &:hover {
    color: var(--primary-color);
  }
`;

function Navigation() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { socket, user, logout } = useAuth();
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('notificationsMuted') === 'true';
  });

  useEffect(() => {
    if (socket && user) {
      const handleNotification = (data) => {
        setNotifications(prev => [...prev, data]);
        playNotificationSound();
      };

      socket.on('notification', handleNotification);
      fetchNotifications(); // Initial fetch

      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [socket, user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleSoundToggle = () => {
    const newMutedState = toggleNotificationSound();
    setIsMuted(newMutedState);
  };

  const playNotificationSound = () => {
    try {
      const volume = localStorage.getItem('notificationVolume') || 0.5;
      const audio = new Audio('/notification.mp3');
      audio.volume = parseFloat(volume);
      audio.play().catch(() => {});
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const toggleNotificationSound = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('notificationsMuted', newMutedState);
    return newMutedState;
  };

  return (
    <Nav>
      <TopBar>
        <TopBarContent>
          <TopBarButton to="/help">Help</TopBarButton>
          <TopBarButton to="/contact">Contact</TopBarButton>
          {user ? (
            <>
              <TopBarButton to="/dashboard">My Dashboard</TopBarButton>
              <TopBarButton to="/security-settings">Security</TopBarButton>
            </>
          ) : (
            <>
              <Button as={Link} to="/login">Login</Button>
              <Button as={Link} to="/register">Register</Button>
            </>
          )}
        </TopBarContent>
      </TopBar>
      <NavContainer>
        <Logo to="/">Zecko</Logo>
        <NavLinks>
          <NavLink to="/jobs">Job Board</NavLink>
          <NavLink to="/directory">Business Directory</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          {user ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/cart">Cart</NavLink>
              <NotificationIcon onClick={() => markAsRead(notification._id)}>
                <Bell size={20} />
                {notifications.length > 0 && (
                  <Badge hasNewNotification={true}>
                    {notifications.length}
                  </Badge>
                )}
                <NotificationDropdown isOpen={showNotifications}>
                  <div style={{ 
                    padding: '10px', 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h4 style={{ margin: 0 }}>Notifications</h4>
                    <SoundToggle 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSoundToggle();
                      }}
                      isMuted={isMuted}
                    >
                      {isMuted ? <BellOff size={14} /> : <Bell size={14} />}
                      {isMuted ? 'Unmute' : 'Mute'}
                    </SoundToggle>
                  </div>
                  {!isMuted && <VolumeControl />}
                  {notifications.length === 0 ? (
                    <div style={{ padding: '10px', textAlign: 'center' }}>
                      No new notifications
                    </div>
                  ) : (
                    <>
                      {notifications.map(notification => (
                        <div 
                          key={notification._id}
                          style={{ 
                            padding: '10px', 
                            borderBottom: '1px solid #eee',
                            backgroundColor: notification.read ? 'white' : '#f0f7ff'
                          }}
                          onClick={() => markAsRead(notification._id)}
                        >
                          <div>{notification.message}</div>
                          <small style={{ color: '#666' }}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </small>
                        </div>
                      ))}
                      <Link 
                        to="/notifications"
                        style={{ 
                          display: 'block', 
                          padding: '10px', 
                          textAlign: 'center',
                          color: 'var(--primary-color)',
                          textDecoration: 'none'
                        }}
                        onClick={() => setShowNotifications(false)}
                      >
                        View All Notifications
                      </Link>
                    </>
                  )}
                </NotificationDropdown>
              </NotificationIcon>
              <NavLink to="/security-settings">Security</NavLink>
              <Button onClick={() => logout()}>Logout</Button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Button as={Link} to="/register">Register</Button>
            </>
          )}
        </NavLinks>
      </NavContainer>
    </Nav>
  );
}

export default Navigation;
