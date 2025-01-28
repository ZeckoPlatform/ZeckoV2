class PerformanceUtils {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
    this.thresholds = {
      longTask: 50, // milliseconds
      pageLoad: 3000,
      apiCall: 1000,
      renderTime: 16 // ~60fps
    };
  }

  // Component rendering performance
  startMeasure(componentName) {
    const markName = `${componentName}-start`;
    performance.mark(markName);
    this.marks.set(componentName, markName);
  }

  endMeasure(componentName) {
    const startMark = this.marks.get(componentName);
    if (!startMark) return null;

    const endMark = `${componentName}-end`;
    performance.mark(endMark);

    const measureName = `${componentName}-measure`;
    performance.measure(measureName, startMark, endMark);

    const entries = performance.getEntriesByName(measureName);
    const duration = entries[entries.length - 1].duration;

    this.measures.set(componentName, duration);
    
    if (duration > this.thresholds.renderTime) {
      console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Memory monitoring
  getMemoryUsage() {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  // Resource timing
  getResourceMetrics() {
    const resources = performance.getEntriesByType('resource');
    return resources.map(resource => ({
      name: resource.name,
      type: resource.initiatorType,
      duration: resource.duration,
      size: resource.transferSize,
      startTime: resource.startTime
    }));
  }

  // Long task detection
  observeLongTasks() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          console.warn('Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name
          });
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      return observer;
    }
    return null;
  }

  // FPS monitoring
  measureFPS(callback) {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const countFrames = () => {
      const currentTime = performance.now();
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        callback(fps);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrames);
    };

    requestAnimationFrame(countFrames);
  }

  // React specific measurements
  measureReactCommits() {
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      let commits = 0;
      let totalDuration = 0;

      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = ((...args) => {
        commits++;
        const commitDuration = performance.now() - args[1];
        totalDuration += commitDuration;

        if (commitDuration > this.thresholds.renderTime) {
          console.warn(`Slow commit detected: ${commitDuration.toFixed(2)}ms`);
        }
      });
    }
  }

  // Performance metrics reporting
  getMetrics() {
    const navigationTiming = performance.getEntriesByType('navigation')[0];
    const paintTiming = performance.getEntriesByType('paint');

    return {
      navigation: navigationTiming ? {
        loadTime: navigationTiming.loadEventEnd - navigationTiming.startTime,
        domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime,
        firstByte: navigationTiming.responseStart - navigationTiming.requestStart,
        resourceLoad: navigationTiming.loadEventEnd - navigationTiming.responseEnd
      } : null,
      paint: {
        firstPaint: paintTiming.find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: paintTiming.find(entry => entry.name === 'first-contentful-paint')?.startTime
      },
      memory: this.getMemoryUsage(),
      resources: this.getResourceMetrics(),
      components: Object.fromEntries(this.measures)
    };
  }

  // Clear performance data
  clearMetrics() {
    performance.clearMarks();
    performance.clearMeasures();
    this.marks.clear();
    this.measures.clear();
  }
}

export const performanceUtils = new PerformanceUtils(); 