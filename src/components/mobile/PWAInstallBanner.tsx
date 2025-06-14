
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable || dismissed) return null;

  return (
    <Card className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gray-900 border-gray-700 z-40 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-white">Install BamaAI Connect</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <p className="text-sm text-gray-300 mb-3">
        Get the full app experience with offline access and push notifications.
      </p>
      
      <Button
        onClick={installApp}
        className="w-full bg-[#00C2FF] hover:bg-[#0099CC] text-white"
      >
        <Download className="w-4 h-4 mr-2" />
        Install App
      </Button>
    </Card>
  );
};

export default PWAInstallBanner;
