
import { Helmet } from 'react-helmet-async';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  Database, 
  Zap, 
  Activity,
  Settings,
  BarChart3
} from 'lucide-react';
import PerformanceMonitoring from '@/components/admin/PerformanceMonitoring';
import SystemOptimization from '@/components/admin/SystemOptimization';
import CacheMonitoring from '@/components/admin/CacheMonitoring';
import SystemMonitoring from '@/components/admin/SystemMonitoring';

const SystemDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Helmet>
        <title>System Dashboard - Alabama Business Directory</title>
        <meta name="description" content="System performance monitoring, optimization, and administrative tools for Alabama's business ecosystem." />
      </Helmet>
      
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              System Dashboard
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive system monitoring, performance optimization, and administrative 
              tools for maintaining peak application performance.
            </p>
          </div>

          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Optimization
              </TabsTrigger>
              <TabsTrigger value="cache" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Cache
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <PerformanceMonitoring />
            </TabsContent>

            <TabsContent value="optimization">
              <SystemOptimization />
            </TabsContent>

            <TabsContent value="cache">
              <CacheMonitoring />
            </TabsContent>

            <TabsContent value="system">
              <SystemMonitoring />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SystemDashboard;
