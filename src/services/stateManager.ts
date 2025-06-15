
import { logger } from './loggerService';

type Listener<T> = (state: T) => void;
type StateUpdater<T> = (currentState: T) => T;

interface StateManagerOptions {
  persist?: boolean;
  storageKey?: string;
  debounceMs?: number;
}

export class StateManager<T> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();
  private options: StateManagerOptions;
  private debounceTimer?: NodeJS.Timeout;

  constructor(initialState: T, options: StateManagerOptions = {}) {
    this.options = {
      persist: false,
      debounceMs: 100,
      ...options
    };

    // Try to load from storage if persistence is enabled
    if (this.options.persist && this.options.storageKey) {
      const stored = this.loadFromStorage();
      this.state = stored || initialState;
    } else {
      this.state = initialState;
    }

    logger.debug('StateManager initialized', { 
      persist: this.options.persist,
      storageKey: this.options.storageKey 
    }, 'StateManager');
  }

  getState(): T {
    return { ...this.state } as T;
  }

  setState(updater: StateUpdater<T> | T): void {
    const newState = typeof updater === 'function' 
      ? (updater as StateUpdater<T>)(this.state)
      : updater;

    if (this.hasChanged(this.state, newState)) {
      this.state = newState;
      this.notifyListeners();
      this.persistState();
    }
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(initialState: T): void {
    this.state = initialState;
    this.notifyListeners();
    this.persistState();
  }

  private hasChanged(oldState: T, newState: T): boolean {
    return JSON.stringify(oldState) !== JSON.stringify(newState);
  }

  private notifyListeners(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.listeners.forEach(listener => {
        try {
          listener(this.getState());
        } catch (error) {
          logger.error('Error in state listener', { error }, 'StateManager');
        }
      });
    }, this.options.debounceMs);
  }

  private persistState(): void {
    if (!this.options.persist || !this.options.storageKey) return;

    try {
      localStorage.setItem(this.options.storageKey, JSON.stringify(this.state));
    } catch (error) {
      logger.warn('Failed to persist state', { error }, 'StateManager');
    }
  }

  private loadFromStorage(): T | null {
    if (!this.options.storageKey) return null;

    try {
      const stored = localStorage.getItem(this.options.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      logger.warn('Failed to load state from storage', { error }, 'StateManager');
      return null;
    }
  }
}

// Global application state stores
export interface AppState {
  user: any | null;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
  };
  ui: {
    sidebarOpen: boolean;
    loading: boolean;
    error: string | null;
  };
}

export const appStateManager = new StateManager<AppState>({
  user: null,
  preferences: {
    theme: 'system',
    language: 'en',
    notifications: true
  },
  ui: {
    sidebarOpen: false,
    loading: false,
    error: null
  }
}, {
  persist: true,
  storageKey: 'app-state',
  debounceMs: 200
});

// Business-specific state
export interface BusinessState {
  selectedBusiness: any | null;
  favorites: string[];
  recentlyViewed: string[];
  filters: {
    category: string;
    location: string;
    verified: boolean;
  };
}

export const businessStateManager = new StateManager<BusinessState>({
  selectedBusiness: null,
  favorites: [],
  recentlyViewed: [],
  filters: {
    category: '',
    location: '',
    verified: false
  }
}, {
  persist: true,
  storageKey: 'business-state'
});
