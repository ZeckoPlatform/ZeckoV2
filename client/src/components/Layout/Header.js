import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const HeaderWrapper = styled.header`
  background: ${({ theme }) => theme?.colors?.background?.paper || '#F5F5F5'};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ theme }) => theme?.spacing?.md || '0.75rem'} ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme?.colors?.primary?.main || '#4CAF50'};
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme?.spacing?.md || '0.75rem'};
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileNav = styled(motion.div)`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme?.colors?.text?.primary || '#333333'};
  text-decoration: none;
  padding: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
  border-radius: ${({ theme }) => theme?.borderRadius?.sm || '4px'};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme?.colors?.background?.hover || 'rgba(0,0,0,0.05)'};
  }
`;

const UserMenu = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
`;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <HeaderWrapper>
      <HeaderContent>
        <Logo to="/">ZeckoV2</Logo>
        
        <Nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Products</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/cart">Cart</NavLink>
              <UserMenu>
                <NavLink to="/profile">Profile</NavLink>
                <button onClick={handleLogout}>Logout</button>
              </UserMenu>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </Nav>

        <MobileNav
          initial={false}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
        >
          {/* Mobile menu implementation */}
        </MobileNav>
      </HeaderContent>
    </HeaderWrapper>
  );
};

export default Header; 