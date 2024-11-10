import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
`;

export const Spinner = styled.div`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border: 3px solid ${({ theme }) => `${theme.colors.primary.main}20`};
  border-top-color: ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const LoadingDots = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};

  span {
    width: 8px;
    height: 8px;
    background: ${({ theme }) => theme.colors.primary.main};
    border-radius: 50%;
    animation: ${pulse} 0.8s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

export const SkeletonPulse = styled.div`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.background.paper} 25%,
    ${({ theme }) => `${theme.colors.text.disabled}20`} 50%,
    ${({ theme }) => theme.colors.background.paper} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin: ${props => props.margin || '0'};
`; 