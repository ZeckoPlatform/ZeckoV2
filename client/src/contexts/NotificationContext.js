import React, { createContext, useContext, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

const NotificationContext = createContext();

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const slideOut = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NotificationItem = styled.div`
  min-width: 300px;
  padding: 15px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, $type }) => {
    switch ($type) {
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  }};
  color: white;
  box-shadow: ${({ theme }) => theme.shadows.notification};
  animation: ${({ $isExiting }) => ($isExiting ? slideOut : slideIn)} 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0 5px;
    font-size: 1.2rem;
    opacity: 0.8;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
`;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => removeNotification(id), 5000);
  }, [removeNotification]);

  const notify = useCallback({
    error: (message) => addNotification(message, 'error'),
    success: (message) => addNotification(message, 'success'),
    warning: (message) => addNotification(message, 'warning'),
    info: (message) => addNotification(message, 'info'),
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <NotificationContainer>
        {notifications.map(({ id, message, type }) => (
          <NotificationItem key={id} $type={type}>
            <span>{message}</span>
            <button onClick={() => removeNotification(id)}>&times;</button>
          </NotificationItem>
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 