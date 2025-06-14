
import { TrendingUp, Building2, Users, CheckCircle, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusinessStats } from '@/hooks/useBusinesses';

const DataDashboard = () => {
  const { data: stats, isLoading, error } = useBusinessStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
            <CardContent className="p-4">
              <div className="h-8 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="text-center text-gray-400 py-8">
        <p>Unable to load real-time data. Please try again later.</p>
      </div>
    );
  }

  const dashboardStats = [
    {
      label: "AI Companies",
      value: stats?.totalCompanies || 0,
      icon: Building2,
      color: "text-[#00C2FF]",
      bgColor: "bg-[#00C2FF]/10"
    },
    {
      label: "Verified",
      value: stats?.verifiedCompanies || 0,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-400/10"
    },
    {
      label: "Categories",
      value: stats?.categories || 0,
      icon: BarChart3,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10"
    },
    {
      label: "Avg Team Size",
      value: stats?.avgEmployees || 0,
      icon: Users,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10"
    },
    {
      label: "New (2022+)",
      value: stats?.recentCompanies || 0,
      icon: Calendar,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      label: "Growth Rate",
      value: "24%",
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {dashboardStats.map((stat, index) => (
        <Card key={index} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-xs text-gray-400">Live</span>
            </div>
            <div className="text-xl font-bold text-white mb-1">
              {typeof stat.value === 'number' && stat.value > 100 ? `${stat.value}+` : stat.value}
            </div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DataDashboard;
