
import { useState, useEffect } from 'react';
import { appStateManager, businessStateManager, AppState, BusinessState } from '@/services/stateManager';
import { logger } from '@/services/loggerService';

export const useAppState = () => {
  const [state, setState] = useState<AppState>(appStateManager.getState());

  useEffect(() => {
    const unsubscribe = appStateManager.subscribe((newState) => {
      setState(newState);
      logger.debug('App state updated', { newState }, 'useAppState');
    });

    return unsubscribe;
  }, []);

  const updateState = (updater: (state: AppState) => AppState) => {
    appStateManager.setState(updater);
  };

  const setUser = (user: any) => {
    updateState(state => ({ ...state, user }));
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    updateState(state => ({
      ...state,
      preferences: { ...state.preferences, theme }
    }));
  };

  const setLoading = (loading: boolean) => {
    updateState(state => ({
      ...state,
      ui: { ...state.ui, loading }
    }));
  };

  const setError = (error: string | null) => {
    updateState(state => ({
      ...state,
      ui: { ...state.ui, error }
    }));
  };

  const toggleSidebar = () => {
    updateState(state => ({
      ...state,
      ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
    }));
  };

  return {
    state,
    setUser,
    setTheme,
    setLoading,
    setError,
    toggleSidebar,
    updateState
  };
};

export const useBusinessState = () => {
  const [state, setState] = useState<BusinessState>(businessStateManager.getState());

  useEffect(() => {
    const unsubscribe = businessStateManager.subscribe((newState) => {
      setState(newState);
      logger.debug('Business state updated', { newState }, 'useBusinessState');
    });

    return unsubscribe;
  }, []);

  const updateState = (updater: (state: BusinessState) => BusinessState) => {
    businessStateManager.setState(updater);
  };

  const setSelectedBusiness = (business: any) => {
    updateState(state => ({ ...state, selectedBusiness: business }));
  };

  const addToFavorites = (businessId: string) => {
    updateState(state => ({
      ...state,
      favorites: [...new Set([...state.favorites, businessId])]
    }));
  };

  const removeFromFavorites = (businessId: string) => {
    updateState(state => ({
      ...state,
      favorites: state.favorites.filter(id => id !== businessId)
    }));
  };

  const addToRecentlyViewed = (businessId: string) => {
    updateState(state => ({
      ...state,
      recentlyViewed: [
        businessId,
        ...state.recentlyViewed.filter(id => id !== businessId)
      ].slice(0, 10) // Keep only last 10
    }));
  };

  const setFilters = (filters: Partial<BusinessState['filters']>) => {
    updateState(state => ({
      ...state,
      filters: { ...state.filters, ...filters }
    }));
  };

  const clearFilters = () => {
    updateState(state => ({
      ...state,
      filters: {
        category: '',
        location: '',
        verified: false
      }
    }));
  };

  return {
    state,
    setSelectedBusiness,
    addToFavorites,
    removeFromFavorites,
    addToRecentlyViewed,
    setFilters,
    clearFilters,
    updateState
  };
};
