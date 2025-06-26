
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MobileNavigation from './MobileNavigation';
import PWAInstallBanner from './PWAInstallBanner';
import OfflineBanner from './OfflineBanner';
import EnhancedMobileSearch from './EnhancedMobileSearch';
import AdvancedNotificationCenter from './AdvancedNotificationCenter';
import OfflineExperienceManager from './OfflineExperienceManager';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Bell, 
  WifiOff, 
  Menu,
  ArrowLeft
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWA } from '@/hooks/usePWA';

interface MobileLayoutWrapperProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const MobileLayoutWrapper: React.FC<MobileLayoutWrapperProps> = ({
  children,
  title,
  showBackButton = false,
  onBackClick
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOfflineManager, setShowOfflineManager] = useState(false);
  const [unreadNotifications] = useState(3);
  
  const isMobile = useIsMobile();
  const { isOffline } = usePWA();
  const location = useLocation();

  // Auto-hide mobile interface elements when not on mobile
  useEffect(() => {
    if (!isMobile) {
      setShowSearch(false);
      setShowNotifications(false);
      setShowOfflineManager(false);
    }
  }, [isMobile]);

  // Close overlays when route changes
  useEffect(() => {
    setShowSearch(false);
    setShowNotifications(false);
    setShowOfflineManager(false);
  }, [location.pathname]);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      window.history.back();
    }
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800 pb-16">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-gray-800/95 backdrop-blur-md border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-gray-300 p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            
            {title && (
              <h1 className="text-lg font-semibold text-white truncate">
                {title}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(true)}
              className="text-gray-300"
            >
              <Search className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(true)}
              className="text-gray-300 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>

            {isOffline && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOfflineManager(true)}
                className="text-orange-400"
              >
                <WifiOff className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Offline Banner */}
      <OfflineBanner />

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Search Overlay */}
      {showSearch && (
        <EnhancedMobileSearch
          onClose={() => setShowSearch(false)}
          onResultSelect={(result) => {
            console.log('Selected:', result);
            setShowSearch(false);
          }}
        />
      )}

      {/* Notification Center */}
      {showNotifications && (
        <AdvancedNotificationCenter
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Offline Manager */}
      {showOfflineManager && (
        <OfflineExperienceManager
          onClose={() => setShowOfflineManager(false)}
        />
      )}
    </div>
  );
};

export default MobileLayoutWrapper;
