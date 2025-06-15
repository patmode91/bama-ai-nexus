
export class MemoryMonitor {
  private onMetric: (name: string, value: number, metadata?: Record<string, any>) => void;

  constructor(onMetric: (name: string, value: number, metadata?: Record<string, any>) => void) {
    this.onMetric = onMetric;
  }

  monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.onMetric('Memory_Used', memory.usedJSHeapSize / 1024 / 1024, {
        total: memory.totalJSHeapSize / 1024 / 1024,
        limit: memory.jsHeapSizeLimit / 1024 / 1024
      });
    }
  }

  analyzeBundlePerformance() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalBundleSize = 0;
    
    resources.forEach(resource => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        totalBundleSize += resource.transferSize || 0;
      }
    });

    this.onMetric('Bundle_Size', totalBundleSize / 1024, {
      resourceCount: resources.length
    });
  }

  trackComponentRender(componentName: string, renderTime: number) {
    this.onMetric('Component_Render', renderTime, {
      component: componentName
    });
  }
}
