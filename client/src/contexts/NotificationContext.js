import React, { createContext, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const notify = useCallback(({ type = 'info', message, options = {} }) => {
    const defaultOptions = {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    };

    switch (type) {
      case 'success':
        toast.success(message, { ...defaultOptions, ...options });
        break;
      case 'error':
        toast.error(message, { ...defaultOptions, ...options });
        break;
      case 'warning':
        toast.warning(message, { ...defaultOptions, ...options });
        break;
      default:
        toast.info(message, { ...defaultOptions, ...options });
    }
  }, []);

  const success = useCallback((message, options) => {
    notify({ type: 'success', message, options });
  }, [notify]);

  const error = useCallback((message, options) => {
    notify({ type: 'error', message, options });
  }, [notify]);

  const warning = useCallback((message, options) => {
    notify({ type: 'warning', message, options });
  }, [notify]);

  const info = useCallback((message, options) => {
    notify({ type: 'info', message, options });
  }, [notify]);

  return (
    <NotificationContext.Provider value={{ notify, success, error, warning, info }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 