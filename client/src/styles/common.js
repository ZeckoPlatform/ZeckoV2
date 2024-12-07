import { css } from 'styled-components';

export const cardStyle = css`
  background: ${({ theme }) => theme?.colors?.background?.paper || '#F5F5F5'};
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
  box-shadow: ${({ theme }) => theme?.shadows?.card || '0 2px 4px rgba(0,0,0,0.1)'};
`;

export const glassEffect = css`
  background: ${({ theme }) => theme?.colors?.glass?.background || 'rgba(255, 255, 255, 0.05)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme?.colors?.glass?.border || 'rgba(255, 255, 255, 0.1)'};
`; 