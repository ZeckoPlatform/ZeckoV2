import styled, { keyframes } from 'styled-components';
import { glassEffect } from '../../styles/mixins';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideDown = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  animation: ${fadeIn} 0.3s ease-out;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  ${glassEffect};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  animation: ${slideDown} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.text.disabled};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.size.xl};
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ModalFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.text.disabled};
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
`; 