import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Menu, X } from 'react-feather';
import { useNotification } from '../contexts/NotificationContext';

const Nav = styled.nav`
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: ${({ theme }) => theme.colors.background.paper};
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`;

const NotificationIcon = styled.div`
  position: relative;
  cursor: pointer;
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: ${({ theme }) => theme.colors.error};
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.dropdown};
  min-width: 250px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  
  > div {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  padding: 0.5rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

function Navigation() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Nav>
      <NavContent>
        <Logo to="/">JobConnect</Logo>
        <MobileMenuButton onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </MobileMenuButton>
        <NavLinks $isOpen={isOpen}>
          <NavLink to="/jobs">Jobs</NavLink>
          <NavLink to="/contractors">Contractors</NavLink>
          {user ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink as="button" onClick={handleLogout}>Logout</NavLink>
              <NotificationIcon ref={dropdownRef}>
                <Bell onClick={() => setShowNotifications(!showNotifications)} />
                {notifications.length > 0 && (
                  <NotificationBadge>{notifications.length}</NotificationBadge>
                )}
              </NotificationIcon>
            </>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </NavLinks>
      </NavContent>
      {showNotifications && (
        <NotificationDropdown>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={index}>{notification.message}</div>
            ))
          ) : (
            <div>No new notifications</div>
          )}
        </NotificationDropdown>
      )}
    </Nav>
  );
}

export default Navigation;
