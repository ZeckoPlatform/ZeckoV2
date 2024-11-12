import React, { useEffect, useRef } from 'react';
import { performanceUtils } from '../../services/performance/PerformanceUtils';

export const withPerformanceTracking = (WrappedComponent, options = {}) => {
  return function PerformanceTrackedComponent(props) {
    const componentName = options.name || WrappedComponent.displayName || WrappedComponent.name;
    const renderCount = useRef(0);

    useEffect(() => {
      renderCount.current++;
      
      if (renderCount.current > (options.maxRenders || 5)) {
        console.warn(`${componentName} has rendered ${renderCount.current} times`);
      }

      return () => {
        if (options.trackUnmount) {
          console.log(`${componentName} unmounted after ${renderCount.current} renders`);
        }
      };
    });

    return (
      <React.Profiler
        id={componentName}
        onRender={(id, phase, actualDuration) => {
          if (actualDuration > performanceUtils.thresholds.renderTime) {
            console.warn(
              `Slow render detected in ${id}: ${actualDuration.toFixed(2)}ms`
            );
          }
        }}
      >
        <WrappedComponent {...props} />
      </React.Profiler>
    );
  };
}; 