
import { useState, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false
  });

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  const calculateDistance = useCallback((
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const watchPosition = useCallback((callback: (position: GeolocationPosition) => void) => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser'
      }));
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      callback,
      (error) => {
        setState(prev => ({
          ...prev,
          error: `Watch position error: ${error.message}`
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 300000
      }
    );

    return watchId;
  }, []);

  const clearWatch = useCallback((watchId: number) => {
    navigator.geolocation.clearWatch(watchId);
  }, []);

  return {
    ...state,
    getCurrentPosition,
    calculateDistance,
    watchPosition,
    clearWatch
  };
};
