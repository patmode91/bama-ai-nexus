
import { useState, useEffect } from 'react';

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWACapabilities {
  isInstallable: boolean;
  isOffline: boolean;
  hasNotifications: boolean;
  hasPersistentStorage: boolean;
  hasBackgroundSync: boolean;
  installPrompt: PWAInstallPrompt | null;
}

export const useEnhancedPWA = () => {
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isInstallable: false,
    isOffline: !navigator.onLine,
    hasNotifications: 'Notification' in window,
    hasPersistentStorage: 'storage' in navigator && 'persist' in navigator.storage,
    hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    installPrompt: null
  });

  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if app is already installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      
      setIsInstalled(isStandalone || isFullscreen || isMinimalUI);
    };

    checkInstallStatus();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setCapabilities(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e as PWAInstallPrompt
      }));
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setCapabilities(prev => ({ ...prev, isOffline: false }));
    };
    
    const handleOffline = () => {
      setCapabilities(prev => ({ ...prev, isOffline: true }));
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCapabilities(prev => ({
        ...prev,
        isInstallable: false,
        installPrompt: null
      }));
    };

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!capabilities.installPrompt) return false;

    try {
      capabilities.installPrompt.prompt();
      const { outcome } = await capabilities.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setCapabilities(prev => ({
          ...prev,
          isInstallable: false,
          installPrompt: null
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error installing app:', error);
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const requestPersistentStorage = async () => {
    if (!capabilities.hasPersistentStorage) return false;

    try {
      const granted = await navigator.storage.persist();
      return granted;
    } catch (error) {
      console.error('Error requesting persistent storage:', error);
      return false;
    }
  };

  const getStorageEstimate = async () => {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota || 0,
        usage: estimate.usage || 0,
        usageDetails: estimate.usageDetails || {}
      };
    } catch (error) {
      console.error('Error getting storage estimate:', error);
      return null;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (notificationPermission !== 'granted' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/placeholder.svg',
          badge: '/placeholder.svg',
          vibrate: [100, 50, 100],
          ...options
        });
      });
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  };

  return {
    ...capabilities,
    isInstalled,
    notificationPermission,
    installApp,
    requestNotificationPermission,
    requestPersistentStorage,
    getStorageEstimate,
    sendNotification
  };
};
