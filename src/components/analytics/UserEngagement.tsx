
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';
import { useMemo } from 'react';

const UserEngagement = () => {
  const { data: engagementData, isLoading } = useQuery({
    queryKey: ['user-engagement'],
    queryFn: async () => {
      console.log('Fetching user engagement data...');
      
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      // Get analytics events from the last 30 days
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching engagement data:', error);
        throw error;
      }

      return events || [];
    },
    refetchInterval: 60000,
  });

  const chartData = useMemo(() => {
    if (!engagementData) return [];

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      return {
        date: format(date, 'MMM dd'),
        fullDate: date,
        clicks: 0,
        saves: 0,
        emails: 0,
        websites: 0
      };
    });

    engagementData.forEach(event => {
      const eventDate = startOfDay(new Date(event.created_at));
      const dayData = last30Days.find(day => 
        day.fullDate.getTime() === eventDate.getTime()
      );

      if (dayData) {
        switch (event.event_type) {
          case 'business_click':
            dayData.clicks++;
            break;
          case 'business_save':
            dayData.saves++;
            break;
          case 'email_click':
            dayData.emails++;
            break;
          case 'website_click':
            dayData.websites++;
            break;
        }
      }
    });

    return last30Days;
  }, [engagementData]);

  const totalEngagement = useMemo(() => {
    if (!chartData) return { total: 0, avgDaily: 0 };
    
    const total = chartData.reduce((sum, day) => 
      sum + day.clicks + day.saves + day.emails + day.websites, 0
    );
    
    return {
      total,
      avgDaily: Math.round(total / 30)
    };
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse h-64 bg-gray-600 rounded"></div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse h-64 bg-gray-600 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Engagement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">30-Day Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Total Interactions</p>
                <p className="text-3xl font-bold text-[#00C2FF]">{totalEngagement.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Daily Average</p>
                <p className="text-xl font-semibold text-white">{totalEngagement.avgDaily}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Engagement Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Business Views</span>
                <span className="text-white font-medium">
                  {chartData.reduce((sum, day) => sum + day.clicks, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Saves</span>
                <span className="text-white font-medium">
                  {chartData.reduce((sum, day) => sum + day.saves, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email Clicks</span>
                <span className="text-white font-medium">
                  {chartData.reduce((sum, day) => sum + day.emails, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Website Visits</span>
                <span className="text-white font-medium">
                  {chartData.reduce((sum, day) => sum + day.websites, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trends */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Daily Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stackId="1"
                stroke="#00C2FF"
                fill="#00C2FF"
                fillOpacity={0.6}
                name="Business Views"
              />
              <Area
                type="monotone"
                dataKey="saves"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="Saves"
              />
              <Area
                type="monotone"
                dataKey="emails"
                stackId="1"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
                name="Email Clicks"
              />
              <Area
                type="monotone"
                dataKey="websites"
                stackId="1"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.6}
                name="Website Visits"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserEngagement;
