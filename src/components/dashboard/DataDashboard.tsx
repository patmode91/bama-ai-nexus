
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, MapPin, TrendingUp, Star, Zap } from 'lucide-react';
import { useBusinessStats } from '@/hooks/useBusinesses';

const DataDashboard = () => {
  const { data: stats, isLoading } = useBusinessStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="h-8 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Companies',
      value: stats?.totalCompanies || 0,
      icon: Building2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      title: 'Verified Businesses',
      value: stats?.verifiedCompanies || 0,
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      title: 'Categories',
      value: stats?.categories || 0,
      icon: MapPin,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      title: 'Avg Team Size',
      value: stats?.avgEmployees || 0,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Live Directory Stats</h3>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Zap className="w-4 h-4 text-[#00C2FF]" />
          Real-time data from Mobile & Baldwin counties
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.recentCompanies && stats.recentCompanies > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00C2FF]" />
              Growth Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-[#00C2FF]/20 text-[#00C2FF] border-[#00C2FF]/30">
                +{stats.recentCompanies} new companies
              </Badge>
              <span className="text-xs text-gray-400">in the last 2 years</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataDashboard;
