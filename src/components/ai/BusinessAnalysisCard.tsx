
import { Building, TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BusinessAnalysisCardProps {
  business: any;
  analysis: {
    marketPosition: string;
    competitiveAdvantages: string[];
    growthOpportunities: string[];
    riskFactors: string[];
    recommendedActions: string[];
    alabamaConnections?: string[];
  };
}

const BusinessAnalysisCard = ({ business, analysis }: BusinessAnalysisCardProps) => {
  return (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>{business.businessname}</span>
            <Badge variant="outline">{business.category}</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">{business.location}</p>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{analysis.marketPosition}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Competitive Advantages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.competitiveAdvantages.map((advantage, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {advantage}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>Growth Opportunities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.growthOpportunities.map((opportunity, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {opportunity}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Risk Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.riskFactors.map((risk, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {risk}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Recommended Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendedActions.map((action, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {action}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {analysis.alabamaConnections && analysis.alabamaConnections.length > 0 && (
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Alabama Connections</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.alabamaConnections.map((connection, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {connection}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessAnalysisCard;
