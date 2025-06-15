
import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, options);
    }
  };

  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'your-vapid-public-key' // Replace with actual VAPID key
      });
      
      console.log('Push subscription successful:', subscription);
      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  };

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    subscribeToPushNotifications
  };
};
