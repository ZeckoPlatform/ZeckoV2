import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const buttonVariants = {
  primary: css`
    background: ${({ theme }) => theme?.colors?.primary?.gradient || 'linear-gradient(135deg, #81C784 0%, #4CAF50 100%)'};
    color: ${({ theme }) => theme?.colors?.primary?.text || '#FFFFFF'};
  `,
  secondary: css`
    background: transparent;
    border: 2px solid ${({ theme }) => theme?.colors?.primary?.main || '#4CAF50'};
    color: ${({ theme }) => theme?.colors?.primary?.main || '#4CAF50'};
  `,
  text: css`
    background: transparent;
    color: ${({ theme }) => theme?.colors?.primary?.main || '#4CAF50'};
    padding: 0;
    &:hover {
      background: transparent;
      text-decoration: underline;
    }
  `
};

const Button = styled(motion.button)`
  padding: ${({ theme }) => `${theme?.spacing?.sm || '8px'} ${theme?.spacing?.lg || '24px'}`};
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
  border: none;
  cursor: pointer;
  font-weight: ${({ theme }) => theme?.typography?.weight?.medium || 500};
  transition: all ${({ theme }) => theme?.transitions?.short || '0.15s'};
  
  ${({ variant }) => buttonVariants[variant || 'primary']}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default Button; 