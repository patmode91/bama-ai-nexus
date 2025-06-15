import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, Mail, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

const NotificationSettings = () => {
  const { isSupported, permission, requestPermission, subscribeToPushNotifications } = useNotifications();
  const [settings, setSettings] = useState({
    pushNotifications: false,
    emailNotifications: true,
    businessUpdates: true,
    eventReminders: true,
    marketingEmails: false,
    weeklyDigest: true,
    realTimeAlerts: false
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    
    if (key === 'pushNotifications' && value && permission !== 'granted') {
      requestPermission();
    }
  };

  const handleEnablePushNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      updateSetting('pushNotifications', true);
      await subscribeToPushNotifications();
      toast.success('Push notifications enabled!');
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-green-600">Enabled</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="outline">Not Set</Badge>;
    }
  };

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Bell className="w-5 h-5 mr-2 text-[#00C2FF]" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                Push Notifications
              </Label>
              <p className="text-xs text-gray-400 mt-1">
                Get instant notifications on your device
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getPermissionBadge()}
              <Switch
                checked={settings.pushNotifications && permission === 'granted'}
                onCheckedChange={(checked) => {
                  if (checked && permission !== 'granted') {
                    handleEnablePushNotifications();
                  } else {
                    updateSetting('pushNotifications', checked);
                  }
                }}
                disabled={!isSupported}
              />
            </div>
          </div>
          
          {!isSupported && (
            <p className="text-xs text-red-400">
              Push notifications are not supported in this browser
            </p>
          )}
        </div>

        {/* Other notification settings */}
        {[
          { key: 'emailNotifications', label: 'Email Notifications', icon: Mail, description: 'Receive updates via email' },
          { key: 'businessUpdates', label: 'Business Updates', icon: TrendingUp, description: 'New businesses, reviews, and changes' },
          { key: 'eventReminders', label: 'Event Reminders', icon: Calendar, description: 'Upcoming events and deadlines' },
          { key: 'marketingEmails', label: 'Marketing Communications', icon: MessageSquare, description: 'Promotional content and newsletters' },
          { key: 'weeklyDigest', label: 'Weekly Digest', icon: Mail, description: 'Summary of weekly activity' },
          { key: 'realTimeAlerts', label: 'Real-time Alerts', icon: Bell, description: 'Instant alerts for important updates' }
        ].map(({ key, label, icon: Icon, description }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <Label className="text-white flex items-center">
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Label>
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            </div>
            <Switch
              checked={settings[key as keyof typeof settings]}
              onCheckedChange={(checked) => updateSetting(key as keyof typeof settings, checked)}
            />
          </div>
        ))}

        {permission === 'denied' && (
          <div className="mt-4 p-3 bg-orange-900/50 border border-orange-700 rounded-md">
            <p className="text-sm text-orange-200">
              Push notifications are blocked. Please enable them in your browser settings to receive instant updates.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
