
export interface PerformanceThresholds {
  webVitals: {
    LCP: { warning: number; poor: number };
    FID: { warning: number; poor: number };
    CLS: { warning: number; poor: number };
    TTFB: { warning: number; poor: number };
    FCP: { warning: number; poor: number };
  };
  apiCall: {
    warning: number;
    poor: number;
  };
  databaseQuery: {
    warning: number;
    poor: number;
  };
  memoryUsage: {
    warning: number;
    critical: number;
  };
}

export const defaultThresholds: PerformanceThresholds = {
  webVitals: {
    LCP: { warning: 2500, poor: 4000 },
    FID: { warning: 100, poor: 300 },
    CLS: { warning: 0.1, poor: 0.25 },
    TTFB: { warning: 800, poor: 1800 },
    FCP: { warning: 1800, poor: 3000 }
  },
  apiCall: {
    warning: 1000,
    poor: 3000
  },
  databaseQuery: {
    warning: 500,
    poor: 2000
  },
  memoryUsage: {
    warning: 75,
    critical: 90
  }
};
