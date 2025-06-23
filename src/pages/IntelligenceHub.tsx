import { Helmet } from 'react-helmet-async';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import IntelligenceHubDashboard from '@/components/ai/IntelligenceHubDashboard';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Eye, 
  Settings,
  Activity,
  AlertTriangle,
  Target,
  BarChart3,
  Puzzle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import intelligenceHubService from '@/services/ai/intelligenceHubService';
import { oracleAgent } from '@/services/ai/oracleAgent';
import { agentSDK } from '@/services/ai/agentSDK';

const IntelligenceHub = () => {
  const [summary, setSummary] = useState<any>({});
  const [oracleInsights, setOracleInsights] = useState<any[]>([]);
  const [sdkStats, setSdkStats] = useState<any>({});

  useEffect(() => {
    const loadData = () => {
      setSummary(intelligenceHubService.getAnalysisSummary());
      setOracleInsights(oracleAgent.getInsights().slice(0, 5));
      setSdkStats(agentSDK.getSDKStats());
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Helmet>
        <title>AI Intelligence Hub - BAMA AI Nexus</title>
        <meta name="description" content="Advanced AI intelligence center with predictive analytics, automated insights, and intelligent automation" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <IntelligenceHubDashboard />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default IntelligenceHub;
