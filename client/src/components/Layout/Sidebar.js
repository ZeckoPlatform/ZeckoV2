import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { glassEffect } from '../../styles/mixins';

const SidebarContainer = styled.aside`
  ${glassEffect};
  width: 280px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  z-index: ${({ theme }) => theme.zIndex.drawer};
  background: ${({ theme }) => theme.colors.background.paper};

  @media (max-width: 768px) {
    transform: translateX(-100%);
    transition: transform ${({ theme }) => theme.transitions.medium};

    ${props => props.isOpen && `
      transform: translateX(0);
    `}
  }
`;

const SidebarSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SidebarLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transitions.short};

  &:hover, &.active {
    background: ${({ theme }) => theme.colors.primary.gradient};
    color: ${({ theme }) => theme.colors.primary.text};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Sidebar = ({ isOpen = false }) => {
  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarSection>
        <SidebarLink to="/dashboard">Dashboard</SidebarLink>
        <SidebarLink to="/dashboard/products">Products</SidebarLink>
        <SidebarLink to="/dashboard/product-list">Product List</SidebarLink>
      </SidebarSection>
    </SidebarContainer>
  );
};

export default Sidebar; 