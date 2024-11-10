import { css } from 'styled-components';

export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const flexBetween = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const glassEffect = css`
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  box-shadow: ${({ theme }) => theme.shadows.glass};
`;

export const cardStyle = css`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: transform ${({ theme }) => theme.transitions.medium},
              box-shadow ${({ theme }) => theme.transitions.medium};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`;

export const buttonBase = css`
  ${flexCenter};
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.short};
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`; 