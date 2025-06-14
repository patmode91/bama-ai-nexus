
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const Admin = () => {
  const { profile, isLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    // For now, allow any authenticated user to access admin
    // In production, you'd check for specific admin roles
    if (!isLoading && !profile) {
      navigate('/auth');
    }
  }, [profile, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <Card className="bg-gray-800 border-gray-700 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-gray-400 mb-4">You need to be logged in to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // In production, add proper role-based access control here
  return <AdminDashboard />;
};

export default Admin;
