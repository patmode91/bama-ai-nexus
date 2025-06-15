
export interface PerformanceThresholds {
  pageLoadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  bundleSize: number;
}

export const defaultThresholds: PerformanceThresholds = {
  pageLoadTime: 3000, // 3 seconds
  apiResponseTime: 1000, // 1 second
  memoryUsage: 100, // 100MB
  bundleSize: 2000 // 2MB
};
