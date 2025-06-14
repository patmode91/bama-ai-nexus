
import { useState } from 'react';
import { Sparkles, ArrowRight, Building, User, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { matchmakingService } from '@/services/matchmakingService';
import { useToast } from '@/hooks/use-toast';

interface MatchmakingFormProps {
  onResults: (results: any[]) => void;
}

const MatchmakingForm = ({ onResults }: MatchmakingFormProps) => {
  const [step, setStep] = useState(1);
  const [requestType, setRequestType] = useState<'b2b' | 'candidate-to-job' | 'startup-to-investor'>('b2b');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState({
    location: '',
    budget: '',
    timeline: '',
    industry: '',
    size: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        title: "Please describe your needs",
        description: "We need more information to find the best matches.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const matches = await matchmakingService.findMatches({
        type: requestType,
        description,
        requirements
      });

      onResults(matches);
      
      toast({
        title: "Matches found!",
        description: `Found ${matches.length} potential matches for your request.`,
      });
    } catch (error) {
      console.error('Matchmaking error:', error);
      toast({
        title: "Matchmaking failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'b2b': return <Building className="w-5 h-5" />;
      case 'candidate-to-job': return <User className="w-5 h-5" />;
      case 'startup-to-investor': return <TrendingUp className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'b2b': return 'Find AI service providers for your business needs';
      case 'candidate-to-job': return 'Discover AI job opportunities that match your skills';
      case 'startup-to-investor': return 'Connect with investors interested in AI startups';
      default: return '';
    }
  };

  if (step === 1) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00C2FF]" />
            AI Matchmaking Engine
          </CardTitle>
          <p className="text-gray-400">
            Tell us what you're looking for and we'll find the perfect matches using AI
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-white">What type of connection are you seeking?</Label>
            <RadioGroup value={requestType} onValueChange={(value: any) => setRequestType(value)}>
              {[
                { value: 'b2b', label: 'Business Solutions', desc: 'Find AI service providers for your business' },
                { value: 'candidate-to-job', label: 'Job Opportunities', desc: 'Discover AI career opportunities' },
                { value: 'startup-to-investor', label: 'Investment', desc: 'Connect startups with investors' }
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg hover:border-gray-500">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="flex items-center gap-3 flex-1">
                    {getTypeIcon(option.value)}
                    <div>
                      <Label htmlFor={option.value} className="text-white font-medium cursor-pointer">
                        {option.label}
                      </Label>
                      <p className="text-gray-400 text-sm">{option.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button 
            onClick={() => setStep(2)} 
            className="w-full bg-[#00C2FF] hover:bg-[#00A8D8]"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {getTypeIcon(requestType)}
          {requestType === 'b2b' ? 'Business Solutions' : 
           requestType === 'candidate-to-job' ? 'Job Opportunities' : 'Investment Connections'}
        </CardTitle>
        <p className="text-gray-400">{getTypeDescription(requestType)}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-white">
            {requestType === 'b2b' ? 'Describe your business challenge or need:' :
             requestType === 'candidate-to-job' ? 'Describe your skills and career goals:' :
             'Describe your startup and funding needs:'}
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              requestType === 'b2b' ? 'e.g., "We need to automate our customer support with AI chatbots that can handle complex technical questions..."' :
              requestType === 'candidate-to-job' ? 'e.g., "I have 3 years of experience in machine learning and Python, looking for a senior ML engineer role..."' :
              'e.g., "We\'re a healthcare AI startup developing diagnostic tools, seeking Series A funding..."'
            }
            className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Preferred Location</Label>
            <Select value={requirements.location} onValueChange={(value) => setRequirements({...requirements, location: value})}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Any location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any location</SelectItem>
                <SelectItem value="Birmingham">Birmingham</SelectItem>
                <SelectItem value="Huntsville">Huntsville</SelectItem>
                <SelectItem value="Mobile">Mobile</SelectItem>
                <SelectItem value="Montgomery">Montgomery</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {requestType === 'b2b' && (
            <div className="space-y-2">
              <Label className="text-white">Budget Range</Label>
              <Select value={requirements.budget} onValueChange={(value) => setRequirements({...requirements, budget: value})}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-10k">Under $10K</SelectItem>
                  <SelectItem value="10k-50k">$10K - $50K</SelectItem>
                  <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                  <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                  <SelectItem value="over-500k">Over $500K</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-white">Industry</Label>
            <Select value={requirements.industry} onValueChange={(value) => setRequirements({...requirements, industry: value})}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any industry</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Aerospace">Aerospace</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Company Size</Label>
            <Select value={requirements.size} onValueChange={(value) => setRequirements({...requirements, size: value})}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Any size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any size</SelectItem>
                <SelectItem value="startup">Startup (1-20)</SelectItem>
                <SelectItem value="small">Small (21-100)</SelectItem>
                <SelectItem value="medium">Medium (101-500)</SelectItem>
                <SelectItem value="large">Large (500+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setStep(1)}
            className="border-gray-600"
          >
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isProcessing || !description.trim()}
            className="flex-1 bg-[#00C2FF] hover:bg-[#00A8D8]"
          >
            {isProcessing ? 'Finding Matches...' : 'Find Matches'}
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchmakingForm;
