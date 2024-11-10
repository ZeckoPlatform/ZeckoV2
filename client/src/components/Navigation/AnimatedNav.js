import styled from 'styled-components';
import { motion } from 'framer-motion';

const NavContainer = styled(motion.nav)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const NavLink = styled(motion.a)`
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${({ theme }) => theme.colors.primary.gradient};
    transform: scaleX(0);
    transform-origin: right;
    transition: transform ${({ theme }) => theme.transitions.medium};
  }

  &:hover::after,
  &.active::after {
    transform: scaleX(1);
    transform-origin: left;
  }
`;

const NavIndicator = styled(motion.div)`
  position: absolute;
  bottom: -2px;
  height: 2px;
  background: ${({ theme }) => theme.colors.primary.gradient};
`; 