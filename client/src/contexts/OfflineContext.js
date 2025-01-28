import React, { createContext, useContext, useEffect, useState } from 'react';
import { requestQueue } from '../services/queue/RequestQueueManager';

const OfflineContext = createContext(null);

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueStatus, setQueueStatus] = useState(requestQueue.getQueueStatus());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      requestQueue.resumeQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      requestQueue.pauseQueue();
    };

    const handleQueueUpdate = () => {
      setQueueStatus(requestQueue.getQueueStatus());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    requestQueue.on('requestComplete', handleQueueUpdate);
    requestQueue.on('requestFailed', handleQueueUpdate);
    requestQueue.on('queuePaused', handleQueueUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      requestQueue.off('requestComplete', handleQueueUpdate);
      requestQueue.off('requestFailed', handleQueueUpdate);
      requestQueue.off('queuePaused', handleQueueUpdate);
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline, queueStatus }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}; 