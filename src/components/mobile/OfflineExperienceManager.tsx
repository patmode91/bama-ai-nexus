
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  WifiOff, 
  Download, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  HardDrive,
  Clock,
  Sync,
  X
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface OfflineContent {
  id: string;
  type: 'business' | 'event' | 'page' | 'search';
  title: string;
  size: number;
  lastUpdated: number;
  syncStatus: 'synced' | 'pending' | 'failed';
}

interface OfflineExperienceManagerProps {
  onClose?: () => void;
}

const OfflineExperienceManager: React.FC<OfflineExperienceManagerProps> = ({ onClose }) => {
  const { isOffline } = usePWA();
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([
    {
      id: '1',
      type: 'business',
      title: 'Alabama AI Solutions - Profile',
      size: 2.4,
      lastUpdated: Date.now() - 3600000,
      syncStatus: 'synced'
    },
    {
      id: '2',
      type: 'search',
      title: 'AI Consulting Search Results',
      size: 1.8,
      lastUpdated: Date.now() - 7200000,
      syncStatus: 'pending'
    },
    {
      id: '3',
      type: 'event',
      title: 'AI Innovation Summit',
      size: 0.9,
      lastUpdated: Date.now() - 1800000,
      syncStatus: 'synced'
    },
    {
      id: '4',
      type: 'page',
      title: 'Directory - Page 1',
      size: 3.2,
      lastUpdated: Date.now() - 5400000,
      syncStatus: 'failed'
    }
  ]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [storageUsed, setStorageUsed] = useState(8.3);
  const [storageLimit] = useState(50);

  const formatSize = (sizeInMB: number) => {
    if (sizeInMB < 1) return `${Math.round(sizeInMB * 1024)} KB`;
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'business': return 'bg-blue-600';
      case 'event': return 'bg-purple-600';
      case 'search': return 'bg-green-600';
      case 'page': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const downloadForOffline = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const removeOfflineContent = (id: string) => {
    const item = offlineContent.find(content => content.id === id);
    if (item) {
      setOfflineContent(prev => prev.filter(content => content.id !== id));
      setStorageUsed(prev => prev - item.size);
    }
  };

  const syncContent = (id: string) => {
    setOfflineContent(prev => 
      prev.map(content => 
        content.id === id 
          ? { ...content, syncStatus: 'pending', lastUpdated: Date.now() }
          : content
      )
    );

    // Simulate sync
    setTimeout(() => {
      setOfflineContent(prev => 
        prev.map(content => 
          content.id === id 
            ? { ...content, syncStatus: 'synced' }
            : content
        )
      );
    }, 2000);
  };

  const clearAllCache = () => {
    setOfflineContent([]);
    setStorageUsed(0);
  };

  const totalSynced = offlineContent.filter(c => c.syncStatus === 'synced').length;
  const totalPending = offlineContent.filter(c => c.syncStatus === 'pending').length;
  const totalFailed = offlineContent.filter(c => c.syncStatus === 'failed').length;

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-md z-50 md:hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white">Offline Manager</h2>
            {isOffline && (
              <Badge variant="secondary" className="bg-orange-600">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-300"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {/* Storage Overview */}
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <HardDrive className="w-5 h-5 mr-2" />
                Storage Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Used: {formatSize(storageUsed)}</span>
                  <span className="text-gray-300">Limit: {formatSize(storageLimit)}</span>
                </div>
                <Progress 
                  value={(storageUsed / storageLimit) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-400">{totalSynced}</div>
                  <div className="text-xs text-gray-400">Synced</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-400">{totalPending}</div>
                  <div className="text-xs text-gray-400">Pending</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-400">{totalFailed}</div>
                  <div className="text-xs text-gray-400">Failed</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={downloadForOffline}
                  disabled={isDownloading}
                  className="flex-1"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? 'Downloading...' : 'Download Current Page'}
                </Button>
                <Button
                  onClick={clearAllCache}
                  variant="outline"
                  size="sm"
                  className="border-gray-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {isDownloading && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Downloading...</span>
                    <span className="text-gray-300">{downloadProgress}%</span>
                  </div>
                  <Progress value={downloadProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Offline Content */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Offline Content</CardTitle>
            </CardHeader>
            <CardContent>
              {offlineContent.length === 0 ? (
                <div className="text-center py-8">
                  <WifiOff className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No offline content</h3>
                  <p className="text-gray-500">Download content to access it offline</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offlineContent.map((content) => (
                    <div
                      key={content.id}
                      className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg"
                    >
                      <div className={`p-2 rounded ${getTypeColor(content.type)}`}>
                        <div className="w-3 h-3 bg-white rounded" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{content.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>{formatSize(content.size)}</span>
                          <span>•</span>
                          <span>{formatTimestamp(content.lastUpdated)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(content.syncStatus)}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => syncContent(content.id)}
                          className="text-gray-400 hover:text-gray-300"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOfflineContent(content.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollArea>
      </div>
    </div>
  );
};

export default OfflineExperienceManager;
