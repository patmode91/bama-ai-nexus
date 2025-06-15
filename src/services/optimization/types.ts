
export interface OptimizationRule {
  name: string;
  condition: () => boolean;
  action: () => Promise<void>;
  priority: 'low' | 'medium' | 'high';
}

export interface OptimizationResult {
  beforeScore: number;
  afterScore: number;
  improvement: number;
  optimizationsApplied: OptimizationHistory[];
}

export interface OptimizationHistory {
  rule: string;
  timestamp: number;
  success: boolean;
  performance: number;
}

export interface OptimizationSuggestion {
  type: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}
