import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';

const NavContainer = styled.nav`
  background: linear-gradient(135deg, #006400 25%, #228B22 50%, #32CD32 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;

  @media (max-width: 768px) {
    display: block;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

// Mobile Drawer
const Drawer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 240px;
  background: white;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  transform: translateX(${props => props.open ? '0' : '-100%'});
  transition: transform 0.3s ease-in-out;
  z-index: 1001;
`;

const DrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: ${props => props.open ? 'block' : 'none'};
  z-index: 1000;
`;

const DrawerList = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DrawerLink = styled(Link)`
  color: #006400;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 4px;

  &:hover {
    background: rgba(0,100,0,0.1);
  }
`;

const DrawerButton = styled.button`
  color: #006400;
  background: none;
  border: none;
  font-weight: 500;
  padding: 0.5rem;
  text-align: left;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: rgba(0,100,0,0.1);
  }
`;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, userType, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setMobileOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </>
      );
    }

    const navLinks = {
      user: [
        { to: '/leads', text: 'Find Leads' },
        { to: '/leads/post', text: 'Post Lead' },
      ],
      business: [
        { to: '/business/dashboard', text: 'Dashboard' },
        { to: '/business/leads', text: 'Lead Board' },
      ],
      vendor: [
        { to: '/vendor/dashboard', text: 'Dashboard' },
        { to: '/vendor/products', text: 'Products' },
        { to: '/vendor/orders', text: 'Orders' },
      ],
    };

    return (
      <>
        {navLinks[userType]?.map(link => (
          <NavLink key={link.to} to={link.to}>{link.text}</NavLink>
        ))}
        <NavLink to="/messages">Messages</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </>
    );
  };

  return (
    <>
      <NavContainer>
        <NavContent>
          <Logo to="/">
            <LogoText>Zecko</LogoText>
          </Logo>

          <MobileMenuButton onClick={handleDrawerToggle}>
            <MenuIcon />
          </MobileMenuButton>

          <NavLinks>
            {renderNavLinks()}
            {user && (
              <LogoutButton onClick={handleLogout}>
                Logout
              </LogoutButton>
            )}
          </NavLinks>
        </NavContent>
      </NavContainer>

      <DrawerOverlay open={mobileOpen} onClick={handleDrawerToggle} />
      <Drawer open={mobileOpen}>
        <DrawerList>
          {renderNavLinks()}
          {user && (
            <DrawerButton onClick={handleLogout}>
              Logout
            </DrawerButton>
          )}
        </DrawerList>
      </Drawer>
    </>
  );
};

export default Navbar; 