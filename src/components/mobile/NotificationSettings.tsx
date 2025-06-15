
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

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Email Notifications
            </Label>
            <p className="text-xs text-gray-400 mt-1">Receive updates via email</p>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
          />
        </div>

        {/* Business Updates */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Business Updates
            </Label>
            <p className="text-xs text-gray-400 mt-1">New businesses, reviews, and changes</p>
          </div>
          <Switch
            checked={settings.businessUpdates}
            onCheckedChange={(checked) => updateSetting('businessUpdates', checked)}
          />
        </div>

        {/* Event Reminders */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Event Reminders
            </Label>
            <p className="text-xs text-gray-400 mt-1">Upcoming events and deadlines</p>
          </div>
          <Switch
            checked={settings.eventReminders}
            onCheckedChange={(checked) => updateSetting('eventReminders', checked)}
          />
        </div>

        {/* Marketing Emails */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Marketing Communications
            </Label>
            <p className="text-xs text-gray-400 mt-1">Promotional content and newsletters</p>
          </div>
          <Switch
            checked={settings.marketingEmails}
            onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
          />
        </div>

        {/* Weekly Digest */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Weekly Digest</Label>
            <p className="text-xs text-gray-400 mt-1">Summary of weekly activity</p>
          </div>
          <Switch
            checked={settings.weeklyDigest}
            onCheckedChange={(checked) => updateSetting('weeklyDigest', checked)}
          />
        </div>

        {/* Real-time Alerts */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white">Real-time Alerts</Label>
            <p className="text-xs text-gray-400 mt-1">Instant alerts for important updates</p>
          </div>
          <Switch
            checked={settings.realTimeAlerts}
            onCheckedChange={(checked) => updateSetting('realTimeAlerts', checked)}
          />
        </div>

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
