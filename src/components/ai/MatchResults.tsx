
import { useState } from 'react';
import { Star, MapPin, Users, ExternalLink, MessageCircle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MatchResult {
  business: any;
  matchScore: number;
  matchReasons: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
}

interface MatchResultsProps {
  results: MatchResult[];
  onBack: () => void;
}

const MatchResults = ({ results, onBack }: MatchResultsProps) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'high': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      case 'low': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (results.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
          <p className="text-gray-400 mb-4">
            We couldn't find any businesses that match your specific criteria. 
            Try adjusting your requirements or search terms.
          </p>
          <Button onClick={onBack} className="bg-[#00C2FF] hover:bg-[#00A8D8]">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Your AI-Powered Matches</h2>
          <p className="text-gray-400">Found {results.length} companies that match your needs</p>
        </div>
        <Button variant="outline" onClick={onBack} className="border-gray-600">
          New Search
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {results.map((match, index) => (
            <Card key={match.business.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-white">{match.business.businessname}</CardTitle>
                      {match.business.verified && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {match.business.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {match.business.location}
                        </div>
                      )}
                      {match.business.employees_count && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {match.business.employees_count} employees
                        </div>
                      )}
                      {match.business.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {match.business.rating}/5
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className="bg-[#00C2FF]/20 text-[#00C2FF] text-lg px-3 py-1">
                      {match.matchScore}% Match
                    </Badge>
                    <div className={`flex items-center gap-1 text-sm ${getConfidenceColor(match.confidenceLevel)}`}>
                      {getConfidenceIcon(match.confidenceLevel)}
                      {match.confidenceLevel} confidence
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">
                  {match.business.description?.slice(0, 200)}...
                </p>

                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Match Score Breakdown:</h4>
                  <Progress value={match.matchScore} className="h-2 mb-2" />
                  <div className="flex flex-wrap gap-1">
                    {match.matchReasons.map((reason, reasonIndex) => (
                      <Badge key={reasonIndex} variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                    onClick={() => setSelectedMatch(match)}
                  >
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-600">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                  {match.business.website && (
                    <Button size="sm" variant="outline" className="border-gray-600">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Website
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="detailed">
          {selectedMatch ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-2xl">{selectedMatch.business.businessname}</CardTitle>
                    <p className="text-gray-400">{selectedMatch.business.category}</p>
                  </div>
                  <Badge className="bg-[#00C2FF]/20 text-[#00C2FF] text-xl px-4 py-2">
                    {selectedMatch.matchScore}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Company Overview</h3>
                  <p className="text-gray-300">{selectedMatch.business.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Why This is a Great Match</h3>
                  <div className="space-y-2">
                    {selectedMatch.matchReasons.map((reason, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Recommended Next Steps</h3>
                  <div className="space-y-2">
                    {selectedMatch.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-[#00C2FF] rounded-full flex items-center justify-center text-white text-sm mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-gray-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <Button className="bg-[#00C2FF] hover:bg-[#00A8D8]">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Now
                  </Button>
                  {selectedMatch.business.website && (
                    <Button variant="outline" className="border-gray-600">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                  <Button variant="outline" className="border-gray-600">
                    Save for Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-12 text-center">
                <p className="text-gray-400">Select a match from the list view to see detailed information</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchResults;
