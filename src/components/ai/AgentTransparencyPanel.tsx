
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  Database, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { AgentDecisionLog, DataProvenance } from '@/types/agentResponse';

interface AgentTransparencyPanelProps {
  decisionLog: AgentDecisionLog;
  provenance: DataProvenance[];
  transparencyScore: number;
}

export const AgentTransparencyPanel: React.FC<AgentTransparencyPanelProps> = ({
  decisionLog,
  provenance,
  transparencyScore
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'flagged': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const averageConfidence = provenance.reduce((sum, p) => sum + p.confidenceScore, 0) / provenance.length;

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-700/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-[#00C2FF]" />
                <CardTitle className="text-sm">Agent Transparency</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {transparencyScore}% transparent
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getConfidenceColor(decisionLog.confidenceLevel)}>
                  {decisionLog.confidenceLevel} confidence
                </Badge>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Decision Reasoning */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>How {decisionLog.agentName} Made This Decision</span>
              </h4>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <p className="text-sm text-gray-300">{decisionLog.reasoning}</p>
              </div>
            </div>

            {/* Data Sources */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Data Sources Used</h4>
              <div className="space-y-2">
                {provenance.map((source, index) => (
                  <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getSourceTypeIcon(source.verificationStatus)}
                        <span className="text-sm font-medium text-white">{source.sourceName}</span>
                        <Badge variant="outline" className="text-xs">
                          {source.sourceType}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Confidence</div>
                        <div className="text-sm font-medium text-white">{source.confidenceScore}%</div>
                      </div>
                    </div>
                    <Progress value={source.confidenceScore} className="h-1 mb-2" />
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Updated: {source.lastUpdated.toLocaleDateString()}</span>
                      <span>{source.dataPoints.length} data points</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alternatives Considered */}
            {decisionLog.alternativesConsidered && decisionLog.alternativesConsidered.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Alternatives Considered</h4>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <ul className="text-sm text-gray-300 space-y-1">
                    {decisionLog.alternativesConsidered.map((alt, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-gray-500">•</span>
                        <span>{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Bias Audit Flags */}
            {decisionLog.biasAuditFlags && decisionLog.biasAuditFlags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span>Bias Audit Alerts</span>
                </h4>
                <div className="bg-yellow-600/10 border border-yellow-600/30 p-3 rounded-lg">
                  <ul className="text-sm text-yellow-300 space-y-1">
                    {decisionLog.biasAuditFlags.map((flag, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{Math.round(averageConfidence)}%</div>
                <div className="text-xs text-gray-400">Avg. Data Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{provenance.length}</div>
                <div className="text-xs text-gray-400">Sources Used</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#00C2FF]">{transparencyScore}%</div>
                <div className="text-xs text-gray-400">Transparency</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Decision made at {decisionLog.timestamp.toLocaleTimeString()}</span>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
