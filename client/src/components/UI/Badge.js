import styled, { css } from 'styled-components';

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.medium};

  ${props => props.variant === 'success' && css`
    background: ${({ theme }) => `${theme.colors.status.success}20`};
    color: ${({ theme }) => theme.colors.status.success};
  `}

  ${props => props.variant === 'warning' && css`
    background: ${({ theme }) => `${theme.colors.status.warning}20`};
    color: ${({ theme }) => theme.colors.status.warning};
  `}

  ${props => props.variant === 'error' && css`
    background: ${({ theme }) => `${theme.colors.status.error}20`};
    color: ${({ theme }) => theme.colors.status.error};
  `}
`; 