import styled from 'styled-components';
import { cardStyle } from '../../styles/mixins';

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownTrigger = styled.button`
  ${cardStyle};
  background: transparent;
  border: none;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DropdownMenu = styled.div`
  ${cardStyle};
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 200px;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  animation: ${slideDown} 0.2s ease-out;
`;

const DropdownItem = styled.button`
  width: 100%;
  text-align: left;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.short};

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary.main}10`};
    color: ${({ theme }) => theme.colors.primary.main};
  }

  &.active {
    background: ${({ theme }) => theme.colors.primary.gradient};
    color: ${({ theme }) => theme.colors.primary.text};
  }
`; 