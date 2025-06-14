
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, RefreshCw, CheckCircle, AlertCircle, Bot, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TheCurator = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [seedProgress, setSeedProgress] = useState(0);
  const { toast } = useToast();

  const checkCuratorStatus = async () => {
    try {
      const response = await fetch('/functions/v1/the-curator?action=status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking status:', error);
      toast({
        title: "Error",
        description: "Failed to check curator status",
        variant: "destructive",
      });
    }
  };

  const seedDatabase = async () => {
    setIsSeeding(true);
    setSeedProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSeedProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      const response = await fetch('/functions/v1/the-curator?action=seed', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      clearInterval(progressInterval);
      setSeedProgress(100);
      
      if (data.success) {
        toast({
          title: "Database Seeded",
          description: "Successfully populated the database with company profiles",
        });
        checkCuratorStatus();
      } else {
        throw new Error(data.error || 'Seeding failed');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        title: "Error",
        description: "Failed to seed database",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
      setSeedProgress(0);
    }
  };

  const enrichProfiles = async () => {
    setIsEnriching(true);
    
    try {
      // This would typically iterate through companies needing enrichment
      const response = await fetch('/functions/v1/the-curator?action=enrich&companyId=1', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Profiles Enriched",
          description: "Successfully enhanced company profiles with AI-generated content",
        });
        checkCuratorStatus();
      } else {
        throw new Error(data.error || 'Enrichment failed');
      }
    } catch (error) {
      console.error('Error enriching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to enrich profiles",
        variant: "destructive",
      });
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-400/10">
              <Database className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-white">The Curator</CardTitle>
              <p className="text-gray-400 text-sm">Data Ingestion & Verification Agent</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">
            The Curator is responsible for maintaining data quality and freshness across the platform. 
            It scrapes the web for new AI companies, enriches profiles, and verifies information.
          </p>

          {/* Status Card */}
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white">System Status</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkCuratorStatus}
                  className="border-gray-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              {status && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Total Companies: {status.totalCompanies}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Status: Active</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Bot className="w-5 h-5 text-green-400" />
                  <h4 className="font-semibold text-white">Database Seeding</h4>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Populate the database with foundational Alabama AI company data.
                </p>
                
                {isSeeding && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Seeding Progress</span>
                      <span>{seedProgress}%</span>
                    </div>
                    <Progress value={seedProgress} className="w-full" />
                  </div>
                )}
                
                <Button
                  onClick={seedDatabase}
                  disabled={isSeeding}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isSeeding ? 'Seeding...' : 'Seed Database'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold text-white">Profile Enrichment</h4>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Use AI to enhance company profiles with generated descriptions and content.
                </p>
                <Button
                  onClick={enrichProfiles}
                  disabled={isEnriching}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isEnriching ? 'Enriching...' : 'Enrich Profiles'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Current Capabilities</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-400/20 text-green-400">Active</Badge>
                <span className="text-gray-300 text-sm">Data Seeding</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-400/20 text-blue-400">Active</Badge>
                <span className="text-gray-300 text-sm">AI Description Generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400">Coming Soon</Badge>
                <span className="text-gray-300 text-sm">Web Scraping</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-400">Coming Soon</Badge>
                <span className="text-gray-300 text-sm">Auto-Updates</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TheCurator;
