
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Edit, Star } from 'lucide-react';
import { useBusinessUpdates } from '@/hooks/useRealtime';
import { formatDistanceToNow } from 'date-fns';

interface BusinessUpdate {
  id: string;
  type: 'new_business' | 'business_update' | 'review_added';
  businessName: string;
  timestamp: number;
  details?: string;
}

const LiveBusinessFeed = () => {
  const [updates, setUpdates] = useState<BusinessUpdate[]>([]);
  const { events } = useBusinessUpdates();

  useEffect(() => {
    // Add mock initial updates
    const mockUpdates: BusinessUpdate[] = [
      {
        id: '1',
        type: 'new_business',
        businessName: 'Alabama Tech Solutions',
        timestamp: Date.now() - 300000,
        details: 'Software development company joined the directory'
      },
      {
        id: '2',
        type: 'review_added',
        businessName: 'Birmingham Bakery',
        timestamp: Date.now() - 600000,
        details: '5-star review added'
      },
      {
        id: '3',
        type: 'business_update',
        businessName: 'Mobile Marketing Co',
        timestamp: Date.now() - 900000,
        details: 'Updated contact information and services'
      }
    ];
    setUpdates(mockUpdates);
  }, []);

  useEffect(() => {
    // Process new real-time events
    events.forEach(event => {
      const update: BusinessUpdate = {
        id: event.id,
        type: event.type as BusinessUpdate['type'],
        businessName: event.data?.businessName || 'Unknown Business',
        timestamp: event.timestamp,
        details: event.data?.details
      };
      
      setUpdates(prev => [update, ...prev.slice(0, 19)]); // Keep last 20 updates
    });
  }, [events]);

  const getUpdateIcon = (type: BusinessUpdate['type']) => {
    switch (type) {
      case 'new_business':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'business_update':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'review_added':
        return <Star className="w-4 h-4 text-yellow-500" />;
      default:
        return <Building2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getUpdateBadge = (type: BusinessUpdate['type']) => {
    switch (type) {
      case 'new_business':
        return <Badge className="bg-green-100 text-green-800 border-green-200">New</Badge>;
      case 'business_update':
        return <Badge variant="outline">Updated</Badge>;
      case 'review_added':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Review</Badge>;
      default:
        return <Badge variant="secondary">Activity</Badge>;
    }
  };

  return (
    <Card className="h-[500px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="w-5 h-5" />
          <span>Live Business Updates</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 overflow-y-auto max-h-[400px]">
        {updates.map((update) => (
          <div key={update.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 mt-1">
              {getUpdateIcon(update.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900 truncate">
                  {update.businessName}
                </span>
                {getUpdateBadge(update.type)}
              </div>
              {update.details && (
                <p className="text-sm text-gray-600 mb-1">{update.details}</p>
              )}
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
        
        {updates.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent business updates</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveBusinessFeed;
