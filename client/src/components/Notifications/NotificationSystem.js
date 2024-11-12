import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  z-index: ${({ theme }) => theme.zIndex.snackbar};
`;

const NotificationItem = styled(motion.div)`
  ${cardStyle}
  ${glassEffect}
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  min-width: 300px;
  max-width: 400px;

  ${({ variant, theme }) => {
    switch (variant) {
      case 'success':
        return `
          border-left: 4px solid ${theme.colors.status.success};
          .icon { color: ${theme.colors.status.success}; }
        `;
      case 'error':
        return `
          border-left: 4px solid ${theme.colors.status.error};
          .icon { color: ${theme.colors.status.error}; }
        `;
      case 'warning':
        return `
          border-left: 4px solid ${theme.colors.status.warning};
          .icon { color: ${theme.colors.status.warning}; }
        `;
      default:
        return `
          border-left: 4px solid ${theme.colors.primary.main};
          .icon { color: ${theme.colors.primary.main}; }
        `;
    }
  }}
`;

const NotificationContent = styled.div`
  flex: 1;

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.size.sm};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  transition: color ${({ theme }) => theme.transitions.short};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`; 