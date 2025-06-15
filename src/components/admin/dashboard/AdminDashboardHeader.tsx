
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface AdminDashboardHeaderProps {
  userRole: any;
}

const AdminDashboardHeader = ({ userRole }: AdminDashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">Advanced Admin Dashboard</h1>
        <p className="text-gray-400">Comprehensive management and intelligence platform</p>
        {userRole && (
          <Badge variant="secondary" className="mt-2">
            {userRole.name} - Level {userRole.level}
          </Badge>
        )}
      </div>
      <Badge variant="secondary" className="bg-green-400/20 text-green-400">
        <CheckCircle className="w-4 h-4 mr-2" />
        System Online
      </Badge>
    </div>
  );
};

export default AdminDashboardHeader;
