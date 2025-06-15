
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, CheckCircle, Clock } from 'lucide-react';

interface AdminStatsOverviewProps {
  stats: any;
  businesses: any[];
}

const AdminStatsOverview = ({ stats, businesses }: AdminStatsOverviewProps) => {
  const getVerifiedBusinesses = () => {
    return businesses?.filter(b => b.verified).length || 0;
  };

  const getVerificationRate = () => {
    const total = stats?.businesses || 1;
    const verified = getVerifiedBusinesses();
    return Math.round((verified / total) * 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Businesses</p>
              <p className="text-2xl font-bold text-white">{stats?.businesses || 0}</p>
              <p className="text-xs text-green-400">
                {getVerifiedBusinesses()} verified
              </p>
            </div>
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats?.users || 0}</p>
              <p className="text-xs text-blue-400">Active platform users</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Verification Rate</p>
              <p className="text-2xl font-bold text-white">
                {getVerificationRate()}%
              </p>
              <p className="text-xs text-green-400">Business quality</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Reviews</p>
              <p className="text-2xl font-bold text-white">
                {(stats?.verificationRequests || 0) + (stats?.businessClaims || 0)}
              </p>
              <p className="text-xs text-yellow-400">Require attention</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsOverview;
