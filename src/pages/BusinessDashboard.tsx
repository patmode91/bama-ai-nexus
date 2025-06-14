
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Settings, BarChart3, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import AuthGuard from '@/components/auth/AuthGuard';
import { useBusinessClaims, useOwnedBusinesses } from '@/hooks/useBusinessClaims';
import { Business } from '@/hooks/useBusinesses';

const BusinessDashboard = () => {
  const { data: ownedBusinesses, isLoading: ownedLoading } = useOwnedBusinesses();
  const { data: claims, isLoading: claimsLoading } = useBusinessClaims();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'approved':
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'rejected':
        return 'bg-red-400/20 text-red-400 border-red-400/30';
      default:
        return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
        <Header />
        
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Business Dashboard</h1>
              <p className="text-gray-400">Manage your business listings and claims</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Owned Businesses</p>
                      <p className="text-2xl font-bold text-white">{ownedBusinesses?.length || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-400/10">
                      <Building2 className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Pending Claims</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {claims?.filter(c => c.status === 'pending').length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-400/10">
                      <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Total Claims</p>
                      <p className="text-2xl font-bold text-white">{claims?.length || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-400/10">
                      <BarChart3 className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Owned Businesses */}
            <Card className="bg-gray-800 border-gray-700 mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Your Businesses
                  </CardTitle>
                  <Button className="bg-[#00C2FF] hover:bg-[#00A8D8]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {ownedLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-700 rounded-lg h-20"></div>
                    ))}
                  </div>
                ) : ownedBusinesses && ownedBusinesses.length > 0 ? (
                  <div className="space-y-4">
                    {ownedBusinesses.map((business: Business) => (
                      <div key={business.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{business.businessname}</h3>
                              <p className="text-sm text-gray-400">{business.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {business.verified && (
                              <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                                Verified
                              </Badge>
                            )}
                            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                              <Settings className="w-4 h-4 mr-1" />
                              Manage
                            </Button>
                            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Businesses Yet</h3>
                    <p className="text-gray-400 mb-4">
                      You don't own any businesses yet. Start by claiming an existing business or adding a new one.
                    </p>
                    <Button className="bg-[#00C2FF] hover:bg-[#00A8D8]">
                      <Plus className="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Claims */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Your Claims
                </CardTitle>
              </CardHeader>
              <CardContent>
                {claimsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse bg-gray-700 rounded-lg h-16"></div>
                    ))}
                  </div>
                ) : claims && claims.length > 0 ? (
                  <div className="space-y-3">
                    {claims.map((claim) => (
                      <div key={claim.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(claim.status)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">Business #{claim.business_id}</span>
                                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                                  {claim.claim_type}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400">
                                Submitted {new Date(claim.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(claim.status)}>
                              {claim.status}
                            </Badge>
                          </div>
                        </div>
                        {claim.admin_notes && (
                          <div className="mt-3 p-3 bg-gray-600 rounded text-sm text-gray-300">
                            <strong>Admin Notes:</strong> {claim.admin_notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No claims submitted yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </AuthGuard>
  );
};

export default BusinessDashboard;
