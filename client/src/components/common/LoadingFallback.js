import React from 'react';
import { CircularProgress } from '@mui/material';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
`;

export const LoadingFallback = () => (
  <LoadingContainer>
    <CircularProgress />
  </LoadingContainer>
); 