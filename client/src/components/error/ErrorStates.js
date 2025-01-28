import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiWifiOff, 
  FiLock, 
  FiSearch, 
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';

const Container = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  min-height: 300px;
`;

const Icon = styled(motion.div)`
  color: ${({ theme, variant }) => {
    switch (variant) {
      case 'error':
        return theme.colors.status.error;
      case 'warning':
        return theme.colors.status.warning;
      default:
        return theme.colors.text.secondary;
    }
  }};
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  max-width: 400px;
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.primary.gradient};
  color: ${({ theme }) => theme.colors.primary.text};
  border: none;
  cursor: pointer;
  font-weight: 500;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const animations = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  icon: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { delay: 0.2 }
  }
};

export const NetworkError = ({ onRetry }) => (
  <Container {...animations.container}>
    <Icon variant="error" {...animations.icon}>
      <FiWifiOff />
    </Icon>
    <Title>Network Error</Title>
    <Message>
      Please check your internet connection and try again.
    </Message>
    {onRetry && (
      <Button
        onClick={onRetry}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiRefreshCw /> Retry Connection
      </Button>
    )}
  </Container>
);

export const NotFound = ({ message }) => (
  <Container {...animations.container}>
    <Icon {...animations.icon}>
      <FiSearch />
    </Icon>
    <Title>Not Found</Title>
    <Message>{message || 'The requested resource could not be found.'}</Message>
  </Container>
);

export const Unauthorized = ({ onLogin }) => (
  <Container {...animations.container}>
    <Icon variant="warning" {...animations.icon}>
      <FiLock />
    </Icon>
    <Title>Access Denied</Title>
    <Message>
      You don't have permission to access this resource.
    </Message>
    {onLogin && (
      <Button
        onClick={onLogin}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Log In
      </Button>
    )}
  </Container>
);

export const GenericError = ({ message, onRetry }) => (
  <Container {...animations.container}>
    <Icon variant="error" {...animations.icon}>
      <FiAlertCircle />
    </Icon>
    <Title>Something Went Wrong</Title>
    <Message>{message || 'An unexpected error occurred. Please try again.'}</Message>
    {onRetry && (
      <Button
        onClick={onRetry}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiRefreshCw /> Try Again
      </Button>
    )}
  </Container>
); 