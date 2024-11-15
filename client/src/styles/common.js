import { css } from 'styled-components';

export const cardStyle = css`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

export const glassEffect = css`
  background: ${({ theme }) => theme.colors.glass.background};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
`; 