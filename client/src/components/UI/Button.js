import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const buttonVariants = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary.gradient};
    color: ${({ theme }) => theme.colors.primary.text};
  `,
  secondary: css`
    background: transparent;
    border: 2px solid ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.main};
  `,
  text: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.primary.main};
    padding: 0;
    &:hover {
      background: transparent;
      text-decoration: underline;
    }
  `
};

const Button = styled(motion.button)`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  cursor: pointer;
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  transition: all ${({ theme }) => theme.transitions.short};
  
  ${({ variant }) => buttonVariants[variant || 'primary']}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default Button; 