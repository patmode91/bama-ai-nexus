
import { logger } from './loggerService';

interface UserAction {
  type: string;
  element: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface UserSession {
  sessionId: string;
  startTime: number;
  actions: UserAction[];
  pageViews: string[];
  errors: string[];
}

class UserExperienceService {
  private session: UserSession;
  private actionQueue: UserAction[] = [];
  private isTracking: boolean = false;

  constructor() {
    this.session = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      actions: [],
      pageViews: [],
      errors: []
    };
    
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return;

    // Track page views
    this.trackPageView(window.location.pathname);

    // Track user interactions
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Track form submissions
    document.addEventListener('submit', this.handleFormSubmit.bind(this));

    // Track errors
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));

    // Track performance issues
    this.monitorPerformance();

    this.isTracking = true;
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const action: UserAction = {
      type: 'click',
      element: this.getElementSelector(target),
      timestamp: Date.now(),
      metadata: {
        x: event.clientX,
        y: event.clientY,
        tagName: target.tagName,
        className: target.className
      }
    };
    
    this.recordAction(action);
  }

  private handleKeydown(event: KeyboardEvent) {
    // Only track important keys
    if (['Enter', 'Escape', 'Tab'].includes(event.key)) {
      const target = event.target as HTMLElement;
      const action: UserAction = {
        type: 'keydown',
        element: this.getElementSelector(target),
        timestamp: Date.now(),
        metadata: {
          key: event.key,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey
        }
      };
      
      this.recordAction(action);
    }
  }

  private handleFormSubmit(event: SubmitEvent) {
    const form = event.target as HTMLFormElement;
    const action: UserAction = {
      type: 'form_submit',
      element: this.getElementSelector(form),
      timestamp: Date.now(),
      metadata: {
        formName: form.name,
        formId: form.id,
        method: form.method
      }
    };
    
    this.recordAction(action);
  }

  private handleError(event: ErrorEvent) {
    this.session.errors.push(event.message);
    logger.error('User session error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      sessionId: this.session.sessionId
    }, 'UserExperience');
  }

  private handlePromiseRejection(event: PromiseRejectionEvent) {
    this.session.errors.push(event.reason?.toString() || 'Promise rejection');
    logger.error('User session promise rejection', {
      reason: event.reason,
      sessionId: this.session.sessionId
    }, 'UserExperience');
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private recordAction(action: UserAction) {
    this.actionQueue.push(action);
    
    // Batch process actions to avoid performance issues
    if (this.actionQueue.length >= 10) {
      this.flushActions();
    }
  }

  private flushActions() {
    this.session.actions.push(...this.actionQueue);
    this.actionQueue = [];
  }

  private monitorPerformance() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.recordPerformanceMetric('LCP', entry.startTime);
          } else if (entry.entryType === 'first-input') {
            this.recordPerformanceMetric('FID', (entry as any).processingStart - entry.startTime);
          } else if (entry.entryType === 'layout-shift') {
            this.recordPerformanceMetric('CLS', (entry as any).value);
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    }
  }

  private recordPerformanceMetric(metric: string, value: number) {
    logger.info(`Performance metric: ${metric}`, {
      metric,
      value,
      sessionId: this.session.sessionId
    }, 'UserExperience');
  }

  public trackPageView(path: string) {
    this.session.pageViews.push(path);
    logger.info('Page view tracked', {
      path,
      sessionId: this.session.sessionId
    }, 'UserExperience');
  }

  public trackCustomEvent(eventName: string, data?: Record<string, any>) {
    const action: UserAction = {
      type: 'custom_event',
      element: eventName,
      timestamp: Date.now(),
      metadata: data
    };
    
    this.recordAction(action);
  }

  public getSessionSummary() {
    this.flushActions(); // Ensure all actions are recorded
    
    return {
      ...this.session,
      duration: Date.now() - this.session.startTime,
      totalActions: this.session.actions.length,
      uniquePages: new Set(this.session.pageViews).size,
      errorCount: this.session.errors.length
    };
  }

  public exportSession() {
    const summary = this.getSessionSummary();
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${this.session.sessionId}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  public destroy() {
    if (!this.isTracking) return;
    
    document.removeEventListener('click', this.handleClick.bind(this));
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
    document.removeEventListener('submit', this.handleFormSubmit.bind(this));
    window.removeEventListener('error', this.handleError.bind(this));
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    
    this.isTracking = false;
  }
}

export const userExperienceService = new UserExperienceService();

// Export session data before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const summary = userExperienceService.getSessionSummary();
    logger.info('Session ended', summary, 'UserExperience');
  });
}
