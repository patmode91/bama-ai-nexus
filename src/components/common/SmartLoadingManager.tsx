
import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface LoadingState {
  id: string;
  label: string;
  progress: number;
  status: 'loading' | 'success' | 'error' | 'idle';
  error?: string;
}

interface LoadingContextType {
  states: LoadingState[];
  addLoading: (id: string, label: string) => void;
  updateProgress: (id: string, progress: number) => void;
  setSuccess: (id: string) => void;
  setError: (id: string, error: string) => void;
  removeLoading: (id: string) => void;
  clearAll: () => void;
  isAnyLoading: boolean;
  overallProgress: number;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [states, setStates] = useState<LoadingState[]>([]);

  const addLoading = (id: string, label: string) => {
    setStates(prev => [
      ...prev.filter(s => s.id !== id),
      { id, label, progress: 0, status: 'loading' }
    ]);
  };

  const updateProgress = (id: string, progress: number) => {
    setStates(prev => prev.map(state =>
      state.id === id ? { ...state, progress: Math.min(100, Math.max(0, progress)) } : state
    ));
  };

  const setSuccess = (id: string) => {
    setStates(prev => prev.map(state =>
      state.id === id ? { ...state, status: 'success', progress: 100 } : state
    ));

    // Auto-remove successful states after delay
    setTimeout(() => removeLoading(id), 2000);
  };

  const setError = (id: string, error: string) => {
    setStates(prev => prev.map(state =>
      state.id === id ? { ...state, status: 'error', error } : state
    ));
  };

  const removeLoading = (id: string) => {
    setStates(prev => prev.filter(s => s.id !== id));
  };

  const clearAll = () => {
    setStates([]);
  };

  const isAnyLoading = states.some(s => s.status === 'loading');
  const overallProgress = states.length > 0 
    ? states.reduce((sum, state) => sum + state.progress, 0) / states.length 
    : 0;

  return (
    <LoadingContext.Provider value={{
      states,
      addLoading,
      updateProgress,
      setSuccess,
      setError,
      removeLoading,
      clearAll,
      isAnyLoading,
      overallProgress
    }}>
      {children}
      <SmartLoadingOverlay />
    </LoadingContext.Provider>
  );
};

const SmartLoadingOverlay: React.FC = () => {
  const { states, isAnyLoading, overallProgress } = useLoading();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (isAnyLoading) {
      // Show overlay after a brief delay to avoid flashing
      const timer = setTimeout(() => setShowOverlay(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowOverlay(false);
    }
  }, [isAnyLoading]);

  if (!showOverlay || states.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-gray-900/95 border-gray-700">
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-[#00C2FF]" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Loading...
            </h3>
            <Progress value={overallProgress} className="mb-4" />
            <p className="text-sm text-gray-400">
              {Math.round(overallProgress)}% complete
            </p>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {states.map(state => (
              <div key={state.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {state.status === 'loading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  )}
                  {state.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  {state.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`${
                    state.status === 'success' ? 'text-green-400' :
                    state.status === 'error' ? 'text-red-400' :
                    'text-gray-300'
                  }`}>
                    {state.label}
                  </span>
                </div>
                <div className="text-gray-400">
                  {state.status === 'error' ? 'Failed' : `${state.progress}%`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
