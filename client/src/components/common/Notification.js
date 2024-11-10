import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const NotificationWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme, variant }) => {
    switch (variant) {
      case 'success':
        return theme.colors.status.success + '10';
      case 'error':
        return theme.colors.status.error + '10';
      case 'warning':
        return theme.colors.status.warning + '10';
      default:
        return theme.colors.status.info + '10';
    }
  }};
  border-left: 4px solid ${({ theme, variant }) => {
    switch (variant) {
      case 'success':
        return theme.colors.status.success;
      case 'error':
        return theme.colors.status.error;
      case 'warning':
        return theme.colors.status.warning;
      default:
        return theme.colors.status.info;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const IconWrapper = styled.div`
  color: ${({ theme, variant }) => {
    switch (variant) {
      case 'success':
        return theme.colors.status.success;
      case 'error':
        return theme.colors.status.error;
      case 'warning':
        return theme.colors.status.warning;
      default:
        return theme.colors.status.info;
    }
  }};
  font-size: 1.5rem;
  display: flex;
  align-items: center;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h4`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
`;

const Message = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color ${({ theme }) => theme.transitions.short};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const getIcon = (variant) => {
  switch (variant) {
    case 'success':
      return <FiCheckCircle />;
    case 'error':
      return <FiXCircle />;
    case 'warning':
      return <FiAlertCircle />;
    default:
      return <FiInfo />;
  }
};

const Notification = ({ 
  variant = 'info',
  title,
  message,
  onClose,
  ...props 
}) => {
  return (
    <NotificationWrapper
      variant={variant}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      {...props}
    >
      <IconWrapper variant={variant}>
        {getIcon(variant)}
      </IconWrapper>
      <Content>
        {title && <Title>{title}</Title>}
        {message && <Message>{message}</Message>}
      </Content>
      {onClose && (
        <CloseButton onClick={onClose}>
          <FiXCircle />
        </CloseButton>
      )}
    </NotificationWrapper>
  );
};

export default Notification; 