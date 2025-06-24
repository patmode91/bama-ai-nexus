
import { supabase } from '@/integrations/supabase/client';
import { logger } from '../loggerService';

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'auth' | 'data' | 'admin' | 'security' | 'system';
}

export interface AuditQuery {
  userId?: string;
  action?: string;
  resource?: string;
  category?: string;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

class AuditLogger {
  private static instance: AuditLogger;
  private logs: AuditLog[] = [];
  private readonly MAX_MEMORY_LOGS = 1000;

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(params: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...params
    };

    // Store in memory for quick access
    this.logs.unshift(auditLog);
    if (this.logs.length > this.MAX_MEMORY_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_MEMORY_LOGS);
    }

    // Store in analytics_events table for persistence
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: params.userId || null,
          event_type: 'audit_log',
          metadata: {
            action: params.action,
            resource: params.resource,
            resourceId: params.resourceId,
            details: params.details,
            severity: params.severity,
            category: params.category,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent
          }
        });

      if (error) {
        logger.error('Failed to store audit log', { error, auditLog }, 'AuditLogger');
      }
    } catch (error) {
      logger.error('Error storing audit log', { error, auditLog }, 'AuditLogger');
    }

    // Log to console for immediate visibility
    logger.info('Audit log recorded', auditLog, 'Audit');
  }

  // Convenience methods for common audit events
  async logUserAction(userId: string, action: string, resource: string, details: Record<string, any> = {}): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      details,
      severity: 'info',
      category: 'data'
    });
  }

  async logSecurityEvent(action: string, details: Record<string, any> = {}, userId?: string): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'security',
      details,
      severity: 'warning',
      category: 'security'
    });
  }

  async logAdminAction(userId: string, action: string, resource: string, resourceId?: string, details: Record<string, any> = {}): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      resourceId,
      details,
      severity: 'info',
      category: 'admin'
    });
  }

  async logSystemEvent(action: string, details: Record<string, any> = {}): Promise<void> {
    await this.log({
      action,
      resource: 'system',
      details,
      severity: 'info',
      category: 'system'
    });
  }

  async logDataChange(userId: string, action: 'create' | 'update' | 'delete', resource: string, resourceId: string, details: Record<string, any> = {}): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      resourceId,
      details,
      severity: action === 'delete' ? 'warning' : 'info',
      category: 'data'
    });
  }

  // Query methods
  getRecentLogs(limit = 50): AuditLog[] {
    return this.logs.slice(0, limit);
  }

  queryLogs(query: AuditQuery): AuditLog[] {
    let filteredLogs = [...this.logs];

    if (query.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === query.userId);
    }

    if (query.action) {
      filteredLogs = filteredLogs.filter(log => log.action.includes(query.action!));
    }

    if (query.resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === query.resource);
    }

    if (query.category) {
      filteredLogs = filteredLogs.filter(log => log.category === query.category);
    }

    if (query.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === query.severity);
    }

    if (query.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= query.startDate!.getTime());
    }

    if (query.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= query.endDate!.getTime());
    }

    const limit = query.limit || 100;
    return filteredLogs.slice(0, limit);
  }

  // Statistics
  getAuditStats() {
    const totalLogs = this.logs.length;
    const categoryCounts = this.logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityCounts = this.logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentActivity = this.logs.filter(
      log => Date.now() - log.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    ).length;

    return {
      totalLogs,
      categoryCounts,
      severityCounts,
      recentActivity,
      memoryUsage: this.logs.length / this.MAX_MEMORY_LOGS
    };
  }

  // Cleanup
  clearOldLogs(olderThanDays = 30): number {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const initialCount = this.logs.length;
    this.logs = this.logs.filter(log => log.timestamp > cutoffTime);
    return initialCount - this.logs.length;
  }
}

export const auditLogger = AuditLogger.getInstance();
export default auditLogger;
