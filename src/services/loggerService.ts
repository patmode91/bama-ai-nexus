type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  metadata?: any;
  component?: string;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private isDevelopment = import.meta.env.DEV;
  private maxLogs = 1000;

  private log(level: LogLevel, message: string, metadata?: any, component?: string) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      metadata,
      component
    };

    // Add to internal log store
    this.logs.push(entry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (this.isDevelopment) {
      const prefix = component ? `[${component}]` : '';
      const logMethod = console[level] || console.log;
      
      if (metadata) {
        logMethod(`${prefix} ${message}`, metadata);
      } else {
        logMethod(`${prefix} ${message}`);
      }
    }

    // In production, send critical errors to monitoring service
    if (!this.isDevelopment && level === 'error') {
      this.sendToMonitoring(entry);
    }
  }

  debug(message: string, metadata?: any, component?: string) {
    this.log('debug', message, metadata, component);
  }

  info(message: string, metadata?: any, component?: string) {
    this.log('info', message, metadata, component);
  }

  warn(message: string, metadata?: any, component?: string) {
    this.log('warn', message, metadata, component);
  }

  error(message: string, metadata?: any, component?: string) {
    this.log('error', message, metadata, component);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return this.logs;
    return this.logs.filter(log => log.level === level);
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs() {
    const blob = new Blob([JSON.stringify(this.logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private sendToMonitoring(entry: LogEntry) {
    // Placeholder for error monitoring service integration
    // This could be Sentry, LogRocket, or similar
    if (typeof window !== 'undefined' && 'navigator' in window) {
      navigator.sendBeacon('/api/errors', JSON.stringify(entry));
    }
  }
}

export const logger = new LoggerService();
