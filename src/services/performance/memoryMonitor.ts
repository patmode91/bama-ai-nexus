
type MetricCallback = (name: string, value: number, metadata?: Record<string, any>) => void;

export class MemoryMonitor {
  constructor(private onMetric: MetricCallback) {}

  monitorMemoryUsage() {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const memory = (performance as any).memory;
    if (memory) {
      this.onMetric('MEMORY_USED', memory.usedJSHeapSize, {
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        timestamp: Date.now()
      });

      // Calculate memory usage percentage
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      this.onMetric('MEMORY_USAGE_PERCENT', usagePercent);

      if (usagePercent > 80) {
        console.warn(`High memory usage: ${usagePercent.toFixed(1)}%`);
      }
    }
  }

  analyzeBundlePerformance() {
    const entries = performance.getEntriesByType('resource');
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;

    entries.forEach((entry: any) => {
      if (entry.transferSize) {
        totalSize += entry.transferSize;
        
        if (entry.name.endsWith('.js')) {
          jsSize += entry.transferSize;
        } else if (entry.name.endsWith('.css')) {
          cssSize += entry.transferSize;
        }
      }
    });

    this.onMetric('BUNDLE_TOTAL_SIZE', totalSize);
    this.onMetric('BUNDLE_JS_SIZE', jsSize);
    this.onMetric('BUNDLE_CSS_SIZE', cssSize);
  }

  trackComponentRender(componentName: string, renderTime: number) {
    this.onMetric('COMPONENT_RENDER_TIME', renderTime, {
      componentName,
      timestamp: Date.now()
    });

    if (renderTime > 16) { // More than one frame at 60fps
      console.warn(`Slow component render: ${componentName} took ${renderTime}ms`);
    }
  }
}
