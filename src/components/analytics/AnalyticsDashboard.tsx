
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, TrendingUp, Users, Eye, MousePointer } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { format, subDays } from 'date-fns';

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const { data: analytics, isLoading } = useAnalytics(dateRange);

  const handleDateSelect = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      setDateRange({ from: range.from, to: range.to });
      setShowCalendar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2 w-2/3"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const topBusinesses = analytics?.businessViews
    ? Object.entries(analytics.businessViews)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center gap-4">
        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="border-gray-600 text-gray-300">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
            <Calendar
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              className="text-white"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Events</p>
                <p className="text-2xl font-bold text-white">{analytics?.totalEvents || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-400/10">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Unique Users</p>
                <p className="text-2xl font-bold text-white">{analytics?.uniqueUsers || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-400/10">
                <Users className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Business Views</p>
                <p className="text-2xl font-bold text-white">
                  {analytics?.eventCounts?.business_view || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-400/10">
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Search Events</p>
                <p className="text-2xl font-bold text-white">
                  {analytics?.eventCounts?.search || 0}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-400/10">
                <MousePointer className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Types Breakdown */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Event Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analytics?.eventCounts || {}).map(([eventType, count]) => (
              <Badge key={eventType} variant="secondary" className="bg-gray-700 text-gray-300">
                {eventType}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Viewed Businesses */}
      {topBusinesses.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Most Viewed Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topBusinesses.map(([businessId, views], index) => (
                <div key={businessId} className="flex items-center justify-between p-3 rounded-lg bg-gray-700">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <span className="text-white">Business #{businessId}</span>
                  </div>
                  <Badge className="bg-[#00C2FF]/20 text-[#00C2FF]">
                    {views} views
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
