
import { useState } from 'react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import NotificationSettings from '@/components/mobile/NotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Moon, Sun, Palette, Database, Shield } from 'lucide-react';
import SEO from '@/components/seo/SEO';

const MobileSettings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800 text-white">
      <SEO 
        title="Mobile Settings"
        description="Customize your mobile app experience with notification preferences, offline settings, and privacy controls."
      />
      <Header />
      
      <main className="container mx-auto py-12 px-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Mobile Settings</h1>
          <p className="text-gray-300">
            Customize your mobile app experience
          </p>
        </div>

        {/* Notification Settings */}
        <NotificationSettings />

        {/* App Preferences */}
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Settings className="w-5 h-5 mr-2 text-[#00C2FF]" />
              App Preferences
            </CardTitle>
            <CardDescription>
              Configure app behavior and appearance
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="text-white">Dark Mode</Label>
                <p className="text-xs text-gray-400">Use dark theme throughout the app</p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="offline-mode" className="text-white">Offline Mode</Label>
                <p className="text-xs text-gray-400">Cache content for offline viewing</p>
              </div>
              <Switch
                id="offline-mode"
                checked={offlineMode}
                onCheckedChange={setOfflineMode}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics" className="text-white">Usage Analytics</Label>
                <p className="text-xs text-gray-400">Help improve the app with usage data</p>
              </div>
              <Switch
                id="analytics"
                checked={analytics}
                onCheckedChange={setAnalytics}
              />
            </div>
          </CardContent>
        </Card>

        {/* Storage & Data */}
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Database className="w-5 h-5 mr-2 text-[#00C2FF]" />
              Storage & Data
            </CardTitle>
            <CardDescription>
              Manage cached data and storage usage
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Cached Data</p>
                <p className="text-xs text-gray-400">~2.5 MB stored locally</p>
              </div>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                Clear Cache
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Offline Content</p>
                <p className="text-xs text-gray-400">~8.2 MB for offline access</p>
              </div>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Shield className="w-5 h-5 mr-2 text-[#00C2FF]" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control your privacy and security settings
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              View Privacy Policy
            </Button>
            
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              Manage Data Permissions
            </Button>
            
            <Button variant="outline" className="w-full border-gray-600 text-gray-300">
              Export My Data
            </Button>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default MobileSettings;
