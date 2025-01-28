import styled, { css } from 'styled-components';

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme?.spacing?.xs || '4px'} ${theme?.spacing?.sm || '8px'}`};
  border-radius: ${({ theme }) => theme?.borderRadius?.sm || '4px'};
  font-size: ${({ theme }) => theme?.typography?.size?.sm || '0.875rem'};
  font-weight: ${({ theme }) => theme?.typography?.weight?.medium || 500};

  ${props => props.variant === 'success' && css`
    background: ${({ theme }) => `${theme?.colors?.status?.success || '#4CAF50'}20`};
    color: ${({ theme }) => theme?.colors?.status?.success || '#4CAF50'};
  `}

  ${props => props.variant === 'warning' && css`
    background: ${({ theme }) => `${theme?.colors?.status?.warning || '#FFA000'}20`};
    color: ${({ theme }) => theme?.colors?.status?.warning || '#FFA000'};
  `}

  ${props => props.variant === 'error' && css`
    background: ${({ theme }) => `${theme?.colors?.status?.error || '#F44336'}20`};
    color: ${({ theme }) => theme?.colors?.status?.error || '#F44336'};
  `}
`; 