class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: {},
      pageLoads: {},
      errors: {},
      resources: {},
    };
    this.initializeObservers();
  }

  initializeObservers() {
    // Performance Observer for page loads
    if (PerformanceObserver) {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackPageLoad(entry);
        }
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });

      // Resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackResourceTiming(entry);
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  trackApiCall(endpoint, duration, status) {
    if (!this.metrics.apiCalls[endpoint]) {
      this.metrics.apiCalls[endpoint] = {
        count: 0,
        totalDuration: 0,
        errors: 0,
        avgDuration: 0,
      };
    }

    const metric = this.metrics.apiCalls[endpoint];
    metric.count++;
    metric.totalDuration += duration;
    metric.avgDuration = metric.totalDuration / metric.count;

    if (status >= 400) {
      metric.errors++;
    }
  }

  trackPageLoad(entry) {
    const page = window.location.pathname;
    if (!this.metrics.pageLoads[page]) {
      this.metrics.pageLoads[page] = {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
      };
    }

    const metric = this.metrics.pageLoads[page];
    metric.count++;
    metric.totalDuration += entry.duration;
    metric.avgDuration = metric.totalDuration / metric.count;
  }

  trackResourceTiming(entry) {
    const resourceType = entry.initiatorType;
    if (!this.metrics.resources[resourceType]) {
      this.metrics.resources[resourceType] = {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
      };
    }

    const metric = this.metrics.resources[resourceType];
    metric.count++;
    metric.totalDuration += entry.duration;
    metric.avgDuration = metric.totalDuration / metric.count;
  }

  trackError(error) {
    const errorType = error.name || 'Unknown';
    if (!this.metrics.errors[errorType]) {
      this.metrics.errors[errorType] = {
        count: 0,
        instances: [],
      };
    }

    const metric = this.metrics.errors[errorType];
    metric.count++;
    metric.instances.push({
      message: error.message,
      timestamp: new Date(),
      stack: error.stack,
    });
  }

  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
    };
  }

  clearMetrics() {
    this.metrics = {
      apiCalls: {},
      pageLoads: {},
      errors: {},
      resources: {},
    };
  }
}

export const performanceMonitor = new PerformanceMonitor(); 