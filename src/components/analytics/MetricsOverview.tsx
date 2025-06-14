
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Building2, Star, Eye, Heart } from 'lucide-react';
import { useBusinessStats } from '@/hooks/useBusinesses';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const MetricsOverview = () => {
  const { data: businessStats, isLoading: statsLoading } = useBusinessStats();

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      console.log('Fetching analytics overview data...');
      
      // Get total views (business clicks)
      const { data: viewsData, error: viewsError } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'business_click');

      if (viewsError) {
        console.error('Error fetching views data:', viewsError);
      }

      // Get total saves
      const { data: savesData, error: savesError } = await supabase
        .from('saved_businesses')
        .select('*');

      if (savesError) {
        console.error('Error fetching saves data:', savesError);
      }

      // Get reviews count
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*');

      if (reviewsError) {
        console.error('Error fetching reviews data:', reviewsError);
      }

      // Get users count (approximation from profiles)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      if (usersError) {
        console.error('Error fetching users data:', usersError);
      }

      return {
        totalViews: viewsData?.length || 0,
        totalSaves: savesData?.length || 0,
        totalReviews: reviewsData?.length || 0,
        totalUsers: usersData?.length || 0,
        avgRating: reviewsData?.reduce((acc, review) => acc + review.rating, 0) / (reviewsData?.length || 1) || 0
      };
    },
    refetchInterval: 30000,
  });

  const metrics = [
    {
      title: 'Total Businesses',
      value: businessStats?.totalCompanies || 0,
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Verified Companies',
      value: businessStats?.verifiedCompanies || 0,
      icon: Star,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Views',
      value: analyticsData?.totalViews || 0,
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Total Saves',
      value: analyticsData?.totalSaves || 0,
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      title: 'Active Users',
      value: analyticsData?.totalUsers || 0,
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Avg Rating',
      value: analyticsData?.avgRating?.toFixed(1) || '0.0',
      icon: TrendingUp,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  if (statsLoading || analyticsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-600 rounded mb-2"></div>
                <div className="h-8 bg-gray-600 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="bg-gray-800 border-gray-700 hover:border-[#00C2FF] transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricsOverview;
