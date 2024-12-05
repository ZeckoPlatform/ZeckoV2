import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  min-width: 300px;
  height: 200px;
  overflow: hidden;
  position: relative;
`;

const SkeletonElement = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.background.paper} 25%,
    ${({ theme }) => theme.colors.background.hover} 50%,
    ${({ theme }) => theme.colors.background.paper} 75%
  );
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const SkeletonTitle = styled(SkeletonElement)`
  width: 60%;
  height: 20px;
`;

const SkeletonText = styled(SkeletonElement)`
  width: 100%;
  height: 15px;
`;

const SkeletonCard = () => (
  <SkeletonWrapper>
    <SkeletonTitle />
    <SkeletonText />
    <SkeletonText />
    <SkeletonText />
  </SkeletonWrapper>
);

export { SkeletonCard }; 