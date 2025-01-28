import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: ${({ fullscreen }) => (fullscreen ? '100vh' : '200px')};
  width: 100%;
`;

const SpinnerCircle = styled.div`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border: 4px solid ${({ theme }) => theme?.colors?.background?.alt || '#F5F5F5'};
  border-top: 4px solid ${({ theme }) => theme?.colors?.primary?.main || '#4CAF50'};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: ${({ theme }) => theme?.spacing?.md || '16px'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666666'};
  font-size: ${({ theme }) => theme?.typography?.size?.sm || '0.875rem'};
`;

const LoadingSpinner = ({ 
  size = 40, 
  fullscreen = false, 
  text = 'Loading...',
  showText = true 
}) => {
  return (
    <SpinnerWrapper
      fullscreen={fullscreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div style={{ textAlign: 'center' }}>
        <SpinnerCircle size={size} />
        {showText && <LoadingText>{text}</LoadingText>}
      </div>
    </SpinnerWrapper>
  );
};

export default LoadingSpinner; 