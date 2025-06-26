
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PerformanceMonitoringDashboard from '@/components/monitoring/PerformanceMonitoringDashboard';
import SystemHealthMonitor from '@/components/monitoring/SystemHealthMonitor';
import SEO from '@/components/seo/SEO';

const SystemMonitoring: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <SEO 
        title="System Monitoring"
        description="Real-time system monitoring, performance metrics, and health checks for Alabama AI Connect platform."
      />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white">System Monitoring</h1>
              <p className="text-xl text-gray-300 mt-2">
                Real-time performance metrics and system health monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700 grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <PerformanceMonitoringDashboard />
          </TabsContent>

          <TabsContent value="health">
            <SystemHealthMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemMonitoring;
