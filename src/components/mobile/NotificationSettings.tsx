
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    newBusinesses: true,
    profileUpdates: false,
    weeklyDigest: true,
    marketingEmails: false
  });

  const { isSupported, permission, requestPermission, subscribeToPushNotifications } = useNotifications();

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribeToPushNotifications();
    }
  };

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Notification preferences updated');
  };

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Bell className="w-5 h-5 mr-2 text-[#00C2FF]" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage your notification preferences and permissions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Push Notifications</Label>
              <p className="text-sm text-gray-400">
                {!isSupported 
                  ? 'Not supported in this browser'
                  : permission === 'granted' 
                    ? 'Enabled' 
                    : permission === 'denied'
                      ? 'Blocked - enable in browser settings'
                      : 'Not enabled'
                }
              </p>
            </div>
            
            {isSupported && permission !== 'granted' && (
              <Button
                onClick={handlePermissionRequest}
                size="sm"
                className="bg-[#00C2FF] hover:bg-[#0099CC]"
              >
                <Smartphone className="w-4 h-4 mr-1" />
                Enable
              </Button>
            )}
            
            {permission === 'granted' && (
              <BellOff className="w-5 h-5 text-green-500" />
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">Notification Types</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-businesses" className="text-white">New Businesses</Label>
                <p className="text-xs text-gray-400">Get notified when new AI businesses join</p>
              </div>
              <Switch
                id="new-businesses"
                checked={settings.newBusinesses}
                onCheckedChange={() => handleSettingChange('newBusinesses')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profile-updates" className="text-white">Profile Updates</Label>
                <p className="text-xs text-gray-400">Updates from businesses you follow</p>
              </div>
              <Switch
                id="profile-updates"
                checked={settings.profileUpdates}
                onCheckedChange={() => handleSettingChange('profileUpdates')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-digest" className="text-white">Weekly Digest</Label>
                <p className="text-xs text-gray-400">Weekly summary of new opportunities</p>
              </div>
              <Switch
                id="weekly-digest"
                checked={settings.weeklyDigest}
                onCheckedChange={() => handleSettingChange('weeklyDigest')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-emails" className="text-white">Marketing Emails</Label>
                <p className="text-xs text-gray-400">Product updates and promotional content</p>
              </div>
              <Switch
                id="marketing-emails"
                checked={settings.marketingEmails}
                onCheckedChange={() => handleSettingChange('marketingEmails')}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
