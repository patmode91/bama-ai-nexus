
import { Card } from '@/components/ui/card';
import { WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const OfflineBanner = () => {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <Card className="fixed top-4 left-4 right-4 bg-orange-600 border-orange-500 z-50 p-3">
      <div className="flex items-center justify-center text-white">
        <WifiOff className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
      </div>
    </Card>
  );
};

export default OfflineBanner;
