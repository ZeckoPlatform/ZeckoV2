import styled, { css } from 'styled-components';

export const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.short};
  
  ${props => props.variant === 'primary' && css`
    background: ${({ theme }) => theme.colors.primary.gradient};
    color: ${({ theme }) => theme.colors.primary.text};
    box-shadow: ${({ theme }) => theme.shadows.button};

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.hover};
    }
  `}

  ${props => props.variant === 'secondary' && css`
    background: ${({ theme }) => theme.colors.secondary.gradient};
    color: ${({ theme }) => theme.colors.secondary.text};
  `}

  ${props => props.variant === 'outlined' && css`
    background: transparent;
    border: 2px solid ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.main};

    &:hover {
      background: ${({ theme }) => theme.colors.primary.main};
      color: ${({ theme }) => theme.colors.primary.text};
    }
  `}

  ${props => props.variant === 'glass' && css`
    background: ${({ theme }) => theme.colors.glass.background};
    backdrop-filter: blur(8px);
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    color: ${({ theme }) => theme.colors.text.primary};
    box-shadow: ${({ theme }) => theme.shadows.glass};
  `}

  ${props => props.size === 'small' && css`
    padding: 0.5rem 1rem;
    font-size: ${({ theme }) => theme.typography.size.sm};
  `}

  ${props => props.size === 'large' && css`
    padding: 1rem 2rem;
    font-size: ${({ theme }) => theme.typography.size.lg};
  `}

  ${props => props.fullWidth && css`
    width: 100%;
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`; 