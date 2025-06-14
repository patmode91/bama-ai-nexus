
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Building2, User, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useBusinessClaims } from '@/hooks/useBusinessClaims';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/sections/Header';

const Admin = () => {
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { data: claims, isLoading } = useBusinessClaims();
  const { toast } = useToast();

  const handleApproveClaim = async (claimId: string) => {
    try {
      // This would call the approve_business_claim function
      toast({
        title: "Claim Approved",
        description: "Business claim has been approved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve claim.",
        variant: "destructive",
      });
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    try {
      // This would update the claim status to rejected
      toast({
        title: "Claim Rejected",
        description: "Business claim has been rejected.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject claim.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-400/20 text-green-400 border-green-400/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-400/20 text-red-400 border-red-400/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage business claims and verification requests</p>
        </div>

        <Tabs defaultValue="claims" className="space-y-6">
          <TabsList className="bg-gray-700 border-gray-600">
            <TabsTrigger value="claims" className="data-[state=active]:bg-gray-600">
              Business Claims
            </TabsTrigger>
            <TabsTrigger value="verifications" className="data-[state=active]:bg-gray-600">
              Verification Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="claims">
            <div className="grid gap-6">
              {isLoading ? (
                <div className="text-center text-gray-300 py-8">Loading claims...</div>
              ) : claims?.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Claims Found</h3>
                    <p className="text-gray-400">There are no business claims to review at this time.</p>
                  </CardContent>
                </Card>
              ) : (
                claims?.map((claim) => (
                  <Card key={claim.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center">
                          <Building2 className="w-5 h-5 mr-2 text-[#00C2FF]" />
                          Business ID: {claim.business_id}
                        </CardTitle>
                        {getStatusBadge(claim.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Claim Type</p>
                          <p className="text-white font-medium capitalize">{claim.claim_type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Submitted</p>
                          <p className="text-white font-medium">
                            {new Date(claim.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">User ID</p>
                          <p className="text-white font-mono text-sm">{claim.user_id}</p>
                        </div>
                      </div>

                      {claim.supporting_documents?.personal_info && (
                        <div className="bg-gray-700/30 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2">Submitted Information</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Name: </span>
                              <span className="text-white">
                                {claim.supporting_documents.personal_info.firstName} {claim.supporting_documents.personal_info.lastName}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Position: </span>
                              <span className="text-white">{claim.supporting_documents.personal_info.position}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Email: </span>
                              <span className="text-white">{claim.supporting_documents.personal_info.email}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Business Email: </span>
                              <span className="text-white">{claim.supporting_documents.personal_info.companyEmail}</span>
                            </div>
                          </div>
                          {claim.supporting_documents.personal_info.message && (
                            <div className="mt-2">
                              <span className="text-gray-400">Message: </span>
                              <span className="text-white">{claim.supporting_documents.personal_info.message}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {claim.admin_notes && (
                        <div className="bg-gray-700/30 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2">Admin Notes</h4>
                          <p className="text-gray-300 text-sm">{claim.admin_notes}</p>
                        </div>
                      )}

                      {claim.status === 'pending' && (
                        <div className="flex gap-3 pt-4 border-t border-gray-700">
                          <Button
                            onClick={() => handleApproveClaim(claim.id)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectClaim(claim.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => setSelectedClaim(claim)}
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Add Notes
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="verifications">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Verification Management</h3>
                <p className="text-gray-400">Verification request management will be implemented in the next phase.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Admin Notes Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white">Add Admin Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this claim..."
                rows={4}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    // Save admin notes
                    setSelectedClaim(null);
                    setAdminNotes('');
                  }}
                  className="flex-1 bg-[#00C2FF] hover:bg-[#00A8D8]"
                >
                  Save Notes
                </Button>
                <Button
                  onClick={() => {
                    setSelectedClaim(null);
                    setAdminNotes('');
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;
