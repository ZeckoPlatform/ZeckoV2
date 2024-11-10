import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: calc(100vh - 64px); // Adjust based on your header height
  background: ${({ theme }) => theme.colors.background.main};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled(motion.aside)`
  width: 280px;
  background: ${({ theme }) => theme.colors.background.paper};
  border-right: 1px solid ${({ theme }) => theme.colors.text.disabled}20;
  padding: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 0;
    z-index: 100;
    transform: translateX(${({ isOpen }) => (isOpen ? '0' : '-100%')});
  }
`;

const Content = styled.main`
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-y: auto;
`;

const NavItem = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  color: ${({ active, theme }) => 
    active ? theme.colors.primary.main : theme.colors.text.primary};
  background: ${({ active, theme }) => 
    active ? theme.colors.primary.light + '20' : 'transparent'};
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.main};
  }
`;

const MobileMenuButton = styled(motion.button)`
  display: none;
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  z-index: 101;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.gradient};
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};

  @media (max-width: 768px) {
    display: block;
  }
`;

const UserInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.text.disabled}20;
`;

const Username = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const UserRole = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: 'Overview', path: '/dashboard' },
    { title: 'Orders', path: '/dashboard/orders' },
    { title: 'Products', path: '/dashboard/products' },
    { title: 'Profile', path: '/dashboard/profile' },
    { title: 'Settings', path: '/dashboard/settings' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  return (
    <DashboardContainer>
      <AnimatePresence>
        <Sidebar
          isOpen={isSidebarOpen}
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <UserInfo>
            <Username>{user?.firstName} {user?.lastName}</Username>
            <UserRole>{user?.role || 'User'}</UserRole>
          </UserInfo>
          
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              active={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {item.title}
            </NavItem>
          ))}
        </Sidebar>
      </AnimatePresence>

      <Content>
        {children}
      </Content>

      <MobileMenuButton
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </MobileMenuButton>
    </DashboardContainer>
  );
};

export default DashboardLayout; 