import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const FormField = styled(motion.div)`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FloatingLabel = styled.label`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  transition: all ${({ theme }) => theme.transitions.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  pointer-events: none;

  ${({ isFocused, hasValue }) => (isFocused || hasValue) && `
    top: 0;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.primary.main};
  `}
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, error }) => 
    error ? theme.colors.status.error : theme.colors.text.disabled};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: transparent;
  transition: all ${({ theme }) => theme.transitions.short};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary.main}20`};
  }
`;

const ErrorMessage = styled(motion.div)`
  color: ${({ theme }) => theme.colors.status.error};
  font-size: ${({ theme }) => theme.typography.size.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PasswordStrength = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const StrengthBar = styled.div`
  height: 4px;
  background: ${({ theme }) => theme.colors.text.disabled};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacing.xs};

  div {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: inherit;
  }
`;

const StrengthLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme, strength }) => {
    switch (strength) {
      case 'weak': return theme.colors.status.error;
      case 'medium': return theme.colors.status.warning;
      case 'strong': return theme.colors.status.success;
      default: return theme.colors.text.secondary;
    }
  }};
`; 