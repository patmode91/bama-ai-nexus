
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Users,
  Activity,
  FileText,
  Settings,
  TrendingUp,
  Clock,
  Key
} from 'lucide-react';
import { authenticationService } from '@/services/security/authenticationService';
import { authorizationService } from '@/services/security/authorizationService';
import { auditLogger } from '@/services/security/auditLogger';
import { complianceMonitor } from '@/services/security/complianceMonitor';
import { dataProtectionService } from '@/services/security/dataProtectionService';
import { rateLimiter } from '@/services/security/rateLimiter';

export const SecurityDashboard: React.FC = () => {
  const [securityStats, setSecurityStats] = useState<any>({});
  const [complianceData, setComplianceData] = useState<any>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSecurityData = () => {
      // Gather security statistics
      const authStats = authenticationService.getSecurityStats();
      const authzStats = authorizationService.getCacheStats();
      const auditStats = auditLogger.getAuditStats();
      const protectionStats = dataProtectionService.getProtectionStats();
      const complianceSummary = complianceMonitor.getComplianceSummary();
      const rateLimitStats = rateLimiter.getStats();

      setSecurityStats({
        authentication: authStats,
        authorization: authzStats,
        audit: auditStats,
        dataProtection: protectionStats,
        rateLimiting: rateLimitStats
      });

      setComplianceData(complianceSummary);
      setAuditLogs(auditLogger.getRecentLogs(20));
      setSecurityEvents(authenticationService.getSecurityEvents(20));
      setLoading(false);
    };

    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const getSecurityScore = () => {
    if (!complianceData.averageScore) return 0;
    
    let score = complianceData.averageScore * 0.4; // 40% from compliance
    
    // Add points for security measures
    if (securityStats.dataProtection?.encryptionEnabled) score += 10;
    if (securityStats.audit?.totalLogs > 0) score += 10;
    if (securityStats.rateLimiting?.length > 0) score += 10;
    
    // Subtract points for security issues
    if (securityStats.authentication?.criticalEvents > 0) score -= 15;
    if (securityStats.authentication?.failedLogins > 10) score -= 10;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading security dashboard...</div>
      </div>
    );
  }

  const securityScore = getSecurityScore();

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Security & Compliance Dashboard</h1>
            <p className="text-gray-400">Monitor security posture and compliance status</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Security Score</div>
              <div className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
                {securityScore}/100
              </div>
            </div>
            <Button className="bg-[#00C2FF] hover:bg-[#00A8D8]">
              <Settings className="w-4 h-4 mr-2" />
              Security Settings
            </Button>
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Authentication</p>
                  <p className="text-2xl font-bold text-white">
                    {securityStats.authentication?.totalEvents || 0}
                  </p>
                  <p className="text-xs text-gray-500">Security events</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Key className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Data Protection</p>
                  <p className="text-2xl font-bold text-white">
                    {securityStats.dataProtection?.totalClassifications || 0}
                  </p>
                  <p className="text-xs text-gray-500">Classifications</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Audit Logs</p>
                  <p className="text-2xl font-bold text-white">
                    {securityStats.audit?.totalLogs || 0}
                  </p>
                  <p className="text-xs text-gray-500">Total entries</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Compliance</p>
                  <p className="text-2xl font-bold text-white">
                    {complianceData.averageScore || 0}%
                  </p>
                  <p className="text-xs text-gray-500">Average score</p>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800 w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="compliance" className="flex-1">Compliance</TabsTrigger>
            <TabsTrigger value="audit" className="flex-1">Audit Logs</TabsTrigger>
            <TabsTrigger value="security" className="flex-1">Security Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Security Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Security Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Overall Security</span>
                      <span className="text-white">{securityScore}%</span>
                    </div>
                    <Progress value={securityScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Compliance Average</span>
                      <span className="text-white">{complianceData.averageScore || 0}%</span>
                    </div>
                    <Progress value={complianceData.averageScore || 0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Data Protection</span>
                      <span className="text-white">
                        {securityStats.dataProtection?.encryptionEnabled ? '100' : '60'}%
                      </span>
                    </div>
                    <Progress 
                      value={securityStats.dataProtection?.encryptionEnabled ? 100 : 60} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Security Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Failed Logins (24h)</span>
                      <Badge variant={securityStats.authentication?.failedLogins > 5 ? 'destructive' : 'secondary'}>
                        {securityStats.authentication?.failedLogins || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Critical Events</span>
                      <Badge variant={securityStats.authentication?.criticalEvents > 0 ? 'destructive' : 'secondary'}>
                        {securityStats.authentication?.criticalEvents || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Rate Limits Active</span>
                      <Badge variant="secondary">
                        {securityStats.rateLimiting?.length || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {complianceData.frameworks?.map((framework: any) => (
                <Card key={framework.framework} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">{framework.framework}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Compliance Score</span>
                          <span className="text-white">{framework.score}%</span>
                        </div>
                        <Progress value={framework.score} className="h-2" />
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Last updated: {complianceData.lastUpdated ? 
                          formatTimestamp(complianceData.lastUpdated) : 'Never'
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          log.severity === 'critical' ? 'bg-red-500' :
                          log.severity === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <div className="text-white text-sm">{log.action}</div>
                          <div className="text-gray-400 text-xs">{log.resource}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">
                          {formatTimestamp(log.timestamp)}
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {log.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          event.severity === 'critical' ? 'bg-red-500' :
                          event.severity === 'high' ? 'bg-orange-500' :
                          event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <div className="text-white text-sm">{event.type.replace('_', ' ').toUpperCase()}</div>
                          <div className="text-gray-400 text-xs">
                            {event.metadata?.email || event.metadata?.reason || 'System event'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">
                          {formatTimestamp(event.timestamp)}
                        </div>
                        <Badge 
                          variant={event.severity === 'critical' ? 'destructive' : 'outline'} 
                          className="text-xs mt-1"
                        >
                          {event.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SecurityDashboard;
