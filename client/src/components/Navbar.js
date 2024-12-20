import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <NavContainer>
      <NavContent>
        <Logo to="/">
          <LogoText>Zecko</LogoText>
        </Logo>

        <NavLinks>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/services">Services</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </NavLinks>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar; 