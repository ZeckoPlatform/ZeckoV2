import React, { createContext, useContext, useEffect, useState } from 'react';
import { performanceUtils } from '../services/performance/PerformanceUtils';

const PerformanceContext = createContext(null);

export const PerformanceProvider = ({ children }) => {
  const [metrics, setMetrics] = useState({});
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isMonitoring) return;

    const longTaskObserver = performanceUtils.observeLongTasks();
    
    // Monitor FPS
    performanceUtils.measureFPS((fps) => {
      if (fps < 30) {
        console.warn(`Low FPS detected: ${fps}`);
      }
    });

    // Measure React commits
    performanceUtils.measureReactCommits();

    // Periodic metrics collection
    const metricsInterval = setInterval(() => {
      setMetrics(performanceUtils.getMetrics());
    }, 5000);

    return () => {
      longTaskObserver?.disconnect();
      clearInterval(metricsInterval);
    };
  }, [isMonitoring]);

  const value = {
    metrics,
    isMonitoring,
    setIsMonitoring,
    measureComponent: performanceUtils.startMeasure.bind(performanceUtils),
    endMeasurement: performanceUtils.endMeasure.bind(performanceUtils),
    clearMetrics: performanceUtils.clearMetrics.bind(performanceUtils)
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}; 