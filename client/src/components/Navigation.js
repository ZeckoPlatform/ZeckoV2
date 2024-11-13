import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'react-feather';
import { FaShoppingCart } from 'react-icons/fa';

const Nav = styled.nav`
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  --text-color: ${({ theme }) => theme.colors.text.primary};
  --primary-color: ${({ theme }) => theme.colors.primary.main};
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

const NotificationButton = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 8px;
  color: var(--text-color, ${({ theme }) => theme.colors.text.primary});
  
  &:hover {
    color: var(--primary-color, ${({ theme }) => theme.colors.primary.main});
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const accountType = localStorage.getItem('accountType') || 'personal';

  const getNavLinks = () => {
    const commonLinks = [
      { to: '/shop', label: 'Shop' },
      { to: '/cart', label: 'Cart', icon: <FaShoppingCart style={{ marginRight: '5px' }} /> }
    ];

    switch(accountType) {
      case 'business':
        return [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/business/profile', label: 'Business Profile' },
          { to: '/business/orders', label: 'Orders' },
          ...commonLinks
        ];
      case 'vendor':
        return [
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/vendor/products', label: 'Products' },
          { to: '/vendor/orders', label: 'Orders' },
          { to: '/vendor/analytics', label: 'Analytics' },
          ...commonLinks
        ];
      default:
        return [
          { to: '/jobs', label: 'Leads Board' },
          { to: '/directory', label: 'Business Directory' },
          { to: '/profile', label: 'Profile' },
          ...commonLinks
        ];
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is handled in the AuthContext logout function
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Nav>
      <TopBar>
        <TopBarContent>
          {user ? (
            <>
              <TopBarButton to="/help">Help</TopBarButton>
              <TopBarButton to="/contact">Contact</TopBarButton>
              <TopBarButton to="/dashboard">My Dashboard</TopBarButton>
              <TopBarButton to="/security-settings">Security</TopBarButton>
            </>
          ) : (
            <>
              <TopBarButton as={Link} to="/login">Login</TopBarButton>
              <TopBarButton as={Link} to="/register">Register</TopBarButton>
            </>
          )}
        </TopBarContent>
      </TopBar>
      <NavContainer>
        <Logo to="/">Zecko</Logo>
        <NavLinks>
          {user ? (
            <>
              {getNavLinks().map((link, index) => (
                <NavLink key={index} to={link.to}>
                  {link.icon}{link.label}
                </NavLink>
              ))}
              <NotificationButton 
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <Badge hasNewNotification={true}>
                    {notifications.length}
                  </Badge>
                )}
              </NotificationButton>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login">Login</Button>
              <Button as={Link} to="/register">Register</Button>
            </>
          )}
        </NavLinks>
      </NavContainer>
    </Nav>
  );
}

export default Navigation;
