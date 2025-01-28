import { useEffect, useRef } from 'react';

export const useSubscription = (subscribe, dependencies = []) => {
  const cleanup = useRef();

  useEffect(() => {
    cleanup.current = subscribe();
    
    return () => {
      if (cleanup.current) {
        cleanup.current();
      }
    };
  }, dependencies);
}; 