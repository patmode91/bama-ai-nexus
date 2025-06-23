
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  GraduationCap, 
  Landmark, 
  Users, 
  TrendingUp,
  Calendar,
  Mail,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react';
import { PartnershipService } from '@/services/partnershipService';
import { Partnership, PartnershipType } from '@/types/partnerships';

export const PartnershipHub: React.FC = () => {
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const partnerships = PartnershipService.getPartnerships();

  const getTypeIcon = (type: PartnershipType) => {
    switch (type) {
      case 'academic': return <GraduationCap className="w-5 h-5" />;
      case 'government': return <Landmark className="w-5 h-5" />;
      case 'corporate': return <Building2 className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: PartnershipType) => {
    switch (type) {
      case 'academic': return 'bg-blue-600';
      case 'government': return 'bg-purple-600';
      case 'corporate': return 'bg-green-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'paused': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const partnershipStats = {
    total: partnerships.length,
    academic: partnerships.filter(p => p.type === 'academic').length,
    government: partnerships.filter(p => p.type === 'government').length,
    corporate: partnerships.filter(p => p.type === 'corporate').length,
    active: partnerships.filter(p => p.status === 'active').length
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Users className="w-6 h-6 text-[#00C2FF]" />
            <span>Partnership Integration Hub</span>
            <Badge className="bg-[#00C2FF] text-white">Triple Alliance Strategy</Badge>
          </CardTitle>
          <p className="text-gray-300">
            Manage academic, government, and corporate partnerships driving Alabama's AI ecosystem
          </p>
        </CardHeader>
      </Card>

      {/* Partnership Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#00C2FF]">{partnershipStats.total}</div>
            <div className="text-sm text-gray-400">Total Partners</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{partnershipStats.academic}</div>
            <div className="text-sm text-gray-400">Academic</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{partnershipStats.government}</div>
            <div className="text-sm text-gray-400">Government</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{partnershipStats.corporate}</div>
            <div className="text-sm text-gray-400">Corporate</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{partnershipStats.active}</div>
            <div className="text-sm text-gray-400">Active</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-800 w-full">
          <TabsTrigger value="overview" className="flex-1">Partnership Overview</TabsTrigger>
          <TabsTrigger value="academic" className="flex-1">Academic</TabsTrigger>
          <TabsTrigger value="government" className="flex-1">Government</TabsTrigger>
          <TabsTrigger value="corporate" className="flex-1">Corporate</TabsTrigger>
          <TabsTrigger value="proposals" className="flex-1">New Proposals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {partnerships.map((partnership) => (
              <Card
                key={partnership.id}
                className="bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                onClick={() => setSelectedPartnership(partnership)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${getTypeColor(partnership.type)}/20`}>
                        {getTypeIcon(partnership.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{partnership.name}</h3>
                        <p className="text-sm text-gray-400 capitalize">{partnership.type} Partnership</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(partnership.status)}
                      <Badge className={`${getStatusColor(partnership.status)} capitalize`}>
                        {partnership.status}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-4">{partnership.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-lg font-bold text-white">{partnership.metrics.activeUsers.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">Active Users</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#00C2FF]">{partnership.metrics.roiScore}</div>
                      <div className="text-xs text-gray-400">ROI Score</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Since {partnership.startDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{partnership.metrics.successfulMatches} matches</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {(['academic', 'government', 'corporate'] as PartnershipType[]).map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white capitalize">{type} Partnerships</h3>
              <Button className="bg-[#00C2FF] hover:bg-[#00A8D8]">
                <Plus className="w-4 h-4 mr-2" />
                Add {type} Partner
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {PartnershipService.getPartnershipsByType(type).map((partnership) => (
                <Card key={partnership.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(partnership.type)}/20`}>
                          {getTypeIcon(partnership.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{partnership.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{partnership.contactEmail}</span>
                            </div>
                            {partnership.website && (
                              <div className="flex items-center space-x-1">
                                <Globe className="w-3 h-3" />
                                <span>{partnership.website}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getTypeColor(partnership.type)} text-white capitalize`}>
                        {partnership.tier}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{partnership.metrics.activeUsers.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#00C2FF]">{partnership.metrics.agentQueries.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Queries</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{partnership.metrics.successfulMatches}</div>
                        <div className="text-xs text-gray-400">Matches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">{partnership.metrics.roiScore}</div>
                        <div className="text-xs text-gray-400">ROI Score</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Integration Health:</span>
                        <span className="text-green-400">Excellent</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="proposals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Partnership Proposals</h3>
            <Button className="bg-[#00C2FF] hover:bg-[#00A8D8]">
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </div>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No pending partnership proposals</p>
              <p className="text-sm text-gray-500 mt-1">
                New partnership requests will appear here for review
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
