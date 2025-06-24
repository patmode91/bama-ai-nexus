
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Building2, TrendingUp, MapPin, Star, Clock, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BusinessUpdate {
  id: string;
  business_id: number;
  business_name: string;
  update_type: 'listing_update' | 'new_review' | 'verification' | 'hours_change' | 'contact_update';
  title: string;
  description: string;
  metadata?: {
    rating?: number;
    reviewer_name?: string;
    old_value?: string;
    new_value?: string;
  };
  timestamp: string;
  location?: string;
  category?: string;
}

const LiveBusinessUpdates = () => {
  const [updates, setUpdates] = useState<BusinessUpdate[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadInitialUpdates();
    if (isLive) {
      subscribeToUpdates();
    }
  }, [isLive]);

  const loadInitialUpdates = async () => {
    // Mock data for demonstration
    const mockUpdates: BusinessUpdate[] = [
      {
        id: '1',
        business_id: 1,
        business_name: 'Alabama Tech Solutions',
        update_type: 'new_review',
        title: 'New 5-Star Review',
        description: 'Received an excellent review from a satisfied customer',
        metadata: {
          rating: 5,
          reviewer_name: 'Sarah Johnson'
        },
        timestamp: new Date(Date.now() - 300000).toISOString(),
        location: 'Birmingham',
        category: 'Technology'
      },
      {
        id: '2',
        business_id: 2,
        business_name: 'Southern Comfort Catering',
        update_type: 'verification',
        title: 'Business Verified',
        description: 'Successfully completed verification process',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        location: 'Mobile',
        category: 'Food Service'
      },
      {
        id: '3',
        business_id: 3,
        business_name: 'Green Valley Construction',
        update_type: 'listing_update',
        title: 'Services Updated',
        description: 'Added new service offerings to their profile',
        metadata: {
          old_value: '3 services',
          new_value: '7 services'
        },
        timestamp: new Date(Date.now() - 900000).toISOString(),
        location: 'Huntsville',
        category: 'Construction'
      }
    ];
    setUpdates(mockUpdates);
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('business_updates')
      .on('broadcast', { event: 'business_update' }, (payload) => {
        const newUpdate = payload.payload as BusinessUpdate;
        setUpdates(prev => [newUpdate, ...prev.slice(0, 49)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'new_review':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'verification':
        return <Badge className="w-4 h-4 text-green-500" />;
      case 'listing_update':
        return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'hours_change':
        return <Clock className="w-4 h-4 text-purple-500" />;
      case 'contact_update':
        return <Users className="w-4 h-4 text-cyan-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'new_review':
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 'verification':
        return 'border-green-500/20 bg-green-500/5';
      case 'listing_update':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'hours_change':
        return 'border-purple-500/20 bg-purple-500/5';
      case 'contact_update':
        return 'border-cyan-500/20 bg-cyan-500/5';
      default:
        return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  const filteredUpdates = filter === 'all' 
    ? updates 
    : updates.filter(update => update.update_type === filter);

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Live Business Updates</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Live' : 'Paused'}
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {['all', 'new_review', 'verification', 'listing_update'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="text-xs"
            >
              {filterType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {filteredUpdates.map((update) => (
              <div
                key={update.id}
                className={`p-3 rounded-lg border ${getUpdateColor(update.update_type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getUpdateIcon(update.update_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-white truncate">
                        {update.business_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {update.update_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>{update.location}</span>
                      <span>•</span>
                      <span>{update.category}</span>
                    </div>
                    
                    <h4 className="text-sm font-medium text-white mb-1">
                      {update.title}
                    </h4>
                    
                    <p className="text-sm text-gray-300 mb-2">
                      {update.description}
                    </p>
                    
                    {update.metadata && (
                      <div className="text-xs text-gray-400 space-y-1">
                        {update.metadata.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span>{update.metadata.rating}/5 stars</span>
                            {update.metadata.reviewer_name && (
                              <span>by {update.metadata.reviewer_name}</span>
                            )}
                          </div>
                        )}
                        {update.metadata.old_value && update.metadata.new_value && (
                          <div>
                            Changed from "{update.metadata.old_value}" to "{update.metadata.new_value}"
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredUpdates.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent updates for this filter</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveBusinessUpdates;
