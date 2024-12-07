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
  padding: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
  z-index: ${({ theme }) => theme?.zIndex?.drawer || 1200};
  background: ${({ theme }) => theme?.colors?.background?.paper || '#F5F5F5'};

  @media (max-width: 768px) {
    transform: translateX(-100%);
    transition: transform ${({ theme }) => theme?.transitions?.medium || '0.3s'};

    ${props => props.isOpen && `
      transform: translateX(0);
    `}
  }
`;

const SidebarSection = styled.div`
  margin-bottom: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const SidebarLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
  padding: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#333333'};
  text-decoration: none;
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
  transition: all ${({ theme }) => theme?.transitions?.short || '0.15s'};

  &:hover, &.active {
    background: ${({ theme }) => theme?.colors?.primary?.gradient || 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)'};
    color: ${({ theme }) => theme?.colors?.primary?.text || '#FFFFFF'};
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