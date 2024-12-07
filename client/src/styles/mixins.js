import { css } from 'styled-components';

export const glassEffect = css`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
`;

export const flexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const flexBetween = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const cardStyle = css`
  background: ${({ theme }) => theme?.colors?.background?.paper || '#F5F5F5'};
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
  box-shadow: ${({ theme }) => theme?.shadows?.card || '0 2px 4px rgba(0,0,0,0.1)'};
  transition: transform ${({ theme }) => theme?.transitions?.medium || '0.3s'},
              box-shadow ${({ theme }) => theme?.transitions?.medium || '0.3s'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme?.shadows?.hover || '0 4px 8px rgba(0,0,0,0.2)'};
  }
`;

export const buttonBase = css`
  ${flexCenter};
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
  font-weight: ${({ theme }) => theme?.typography?.weight?.medium || 500};
  cursor: pointer;
  transition: all ${({ theme }) => theme?.transitions?.short || '0.15s'};
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`; 