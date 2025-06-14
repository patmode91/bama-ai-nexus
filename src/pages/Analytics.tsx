
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Shield, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { useVerificationRequests } from '@/hooks/useVerification';

const Analytics = () => {
  const navigate = useNavigate();
  const { data: verificationRequests, isLoading: verificationLoading } = useVerificationRequests();

  const pendingVerifications = verificationRequests?.filter(req => req.status === 'pending') || [];
  const approvedVerifications = verificationRequests?.filter(req => req.status === 'approved') || [];
  const rejectedVerifications = verificationRequests?.filter(req => req.status === 'rejected') || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <Header onSignIn={() => {}} />
      
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-7xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Monitor platform usage and verification requests</p>
          </div>

          {/* Verification Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Pending Verifications</p>
                    <p className="text-2xl font-bold text-yellow-400">{pendingVerifications.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-400/10">
                    <Shield className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Approved Verifications</p>
                    <p className="text-2xl font-bold text-green-400">{approvedVerifications.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-400/10">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Requests</p>
                    <p className="text-2xl font-bold text-white">{verificationRequests?.length || 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-400/10">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verification Requests */}
          {verificationRequests && verificationRequests.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Recent Verification Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {verificationRequests.slice(0, 10).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="text-white">
                          Business #{request.business_id}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          request.status === 'pending' 
                            ? 'bg-yellow-400/20 text-yellow-400' 
                            : request.status === 'approved'
                            ? 'bg-green-400/20 text-green-400'
                            : 'bg-red-400/20 text-red-400'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Dashboard */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Platform Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard />
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Analytics;
