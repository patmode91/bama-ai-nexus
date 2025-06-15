
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Star, Plus, Edit } from 'lucide-react';
import { useBusinessUpdates } from '@/hooks/useRealtime';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const LiveBusinessFeed = () => {
  const { events, isConnected } = useBusinessUpdates();

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'new_business':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'business_update':
        return <Edit className="h-4 w-4 text-blue-500" />;
      default:
        return <Building2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTitle = (type: string, data: any) => {
    switch (type) {
      case 'new_business':
        return `New business: ${data?.businessname || 'Unknown'}`;
      case 'business_update':
        return `Updated: ${data?.businessname || 'Unknown'}`;
      default:
        return 'Business activity';
    }
  };

  const getEventDescription = (type: string, data: any) => {
    switch (type) {
      case 'new_business':
        return `${data?.category || 'Business'} in ${data?.location || 'Unknown location'}`;
      case 'business_update':
        return `Business information updated`;
      default:
        return 'Business activity occurred';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Live Business Updates
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent business updates</p>
            <p className="text-xs">Updates will appear here in real-time</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {events.slice().reverse().map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {getEventTitle(event.type, event.data)}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {getEventDescription(event.type, event.data)}
                        </p>
                        
                        {event.data?.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">
                              {event.data.rating} rating
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={event.type === 'new_business' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {event.type === 'new_business' ? 'New' : 'Updated'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(event.timestamp)} ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveBusinessFeed;
