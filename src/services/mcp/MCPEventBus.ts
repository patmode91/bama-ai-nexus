export interface MCPEvent {
  id: string;
  type: 'context_created' | 'context_updated' | 'agent_request' | 'agent_response' | 'session_created';
  source: string;
  target?: string;
  payload: any;
  timestamp: Date;
}

export type MCPEventHandler = (event: MCPEvent) => void | Promise<void>;

class MCPEventBus {
  private handlers: Map<string, MCPEventHandler[]> = new Map();
  private static instance: MCPEventBus;

  static getInstance(): MCPEventBus {
    if (!MCPEventBus.instance) {
      MCPEventBus.instance = new MCPEventBus();
    }
    return MCPEventBus.instance;
  }

  // Subscribe to events
  subscribe(eventType: string, handler: MCPEventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    this.handlers.get(eventType)!.push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Emit an event
  async emit(event: Omit<MCPEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: MCPEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    const handlers = this.handlers.get(event.type) || [];
    
    // Execute all handlers
    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(fullEvent);
        } catch (error) {
          console.error(`Error in MCP event handler for ${event.type}:`, error);
        }
      })
    );
  }

  // Subscribe to all events from a specific source
  subscribeToSource(source: string, handler: MCPEventHandler): () => void {
    const unsubscribers: (() => void)[] = [];
    
    // Subscribe to all event types
    ['context_created', 'context_updated', 'agent_request', 'agent_response', 'session_created'].forEach(eventType => {
      const unsubscribe = this.subscribe(eventType, (event) => {
        if (event.source === source) {
          handler(event);
        }
      });
      unsubscribers.push(unsubscribe);
    });

    // Return function to unsubscribe from all
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }

  // Get event history (for debugging)
  private eventHistory: MCPEvent[] = [];
  
  getEventHistory(limit = 100): MCPEvent[] {
    return this.eventHistory.slice(-limit);
  }

  private recordEvent(event: MCPEvent) {
    this.eventHistory.push(event);
    // Keep only last 1000 events
    if (this.eventHistory.length > 1000) {
      this.eventHistory = this.eventHistory.slice(-1000);
    }
  }
}

export const mcpEventBus = MCPEventBus.getInstance();
