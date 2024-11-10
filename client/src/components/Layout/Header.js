import styled from 'styled-components';
import { flexBetween } from '../../styles/mixins';

const HeaderContainer = styled.header`
  ${flexBetween};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.background.paper};
  box-shadow: ${({ theme }) => theme.shadows.card};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.drawer - 1};
`;

const Logo = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-size: ${({ theme }) => theme.typography.size.xl};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.colors.primary.main};
`;

const Nav = styled.nav`
  ${flexBetween};
  gap: ${({ theme }) => theme.spacing.md};
`;

const NavLink = styled.a`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.short};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => `${theme.colors.primary.main}10`};
  }
`; 