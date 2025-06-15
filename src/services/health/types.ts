
export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  performance: number;
  memory: number;
  cache: number;
  api: number;
  errors: number;
  uptime: number;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  value?: number;
  threshold?: number;
  message?: string;
}

export interface HealthReport {
  timestamp: number;
  health: Promise<SystemHealth>;
  recommendations: string[];
}
