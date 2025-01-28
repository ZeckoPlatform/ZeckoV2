class PerformanceMonitor {
  static metrics = {
    navigationTiming: {},
    resourceTiming: {},
    errors: [],
    interactions: []
  };

  static init() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const timing = performance.getEntriesByType('navigation')[0];
      this.metrics.navigationTiming = {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      };
    });

    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'resource') {
          this.metrics.resourceTiming[entry.name] = {
            duration: entry.duration,
            size: entry.transferSize,
            type: entry.initiatorType
          };
        }
      });
    });
    observer.observe({ entryTypes: ['resource'] });

    // Monitor errors
    window.addEventListener('error', (event) => {
      this.metrics.errors.push({
        message: event.message,
        source: event.filename,
        timestamp: new Date().toISOString()
      });
    });

    // Monitor user interactions
    ['click', 'submit', 'input'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.metrics.interactions.push({
          type: eventType,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  static getMetrics() {
    return this.metrics;
  }

  static logMetrics() {
    console.log('Performance Metrics:', this.metrics);
    // Here you could also send metrics to your analytics service
  }
}

export default PerformanceMonitor;

export const measurePerformance = (componentName) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 16.67) { // Longer than one frame (60fps)
      console.warn(`${componentName} took ${duration.toFixed(2)}ms to render`);
    }
  };
}; 