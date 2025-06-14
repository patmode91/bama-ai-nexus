
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface ProfileOnboardingProps {
  onComplete: () => void;
}

const ProfileOnboarding = ({ onComplete }: ProfileOnboardingProps) => {
  const { preferences, updatePreferences } = useUserPreferences();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const industries = [
    'Aerospace & Defense',
    'Healthcare & Biotechnology',
    'Manufacturing & Automation',
    'Financial Services',
    'Education & Research',
    'Agriculture & Food Tech',
    'Energy & Utilities',
    'Transportation & Logistics'
  ];

  const aiAreas = [
    'Machine Learning & AI',
    'Computer Vision',
    'Natural Language Processing',
    'Robotics & Automation',
    'Data Analytics',
    'Predictive Maintenance',
    'Autonomous Systems',
    'AI Ethics & Governance'
  ];

  const handleIndustryToggle = (industry: string) => {
    const updatedIndustries = preferences.industries.includes(industry)
      ? preferences.industries.filter(i => i !== industry)
      : [...preferences.industries, industry];
    
    updatePreferences({ industries: updatedIndustries });
  };

  const handleAIAreaToggle = (area: string) => {
    const updatedAreas = preferences.ai_focus_areas.includes(area)
      ? preferences.ai_focus_areas.filter(a => a !== area)
      : [...preferences.ai_focus_areas, area];
    
    updatePreferences({ ai_focus_areas: updatedAreas });
  };

  const handleBudgetChange = (values: number[]) => {
    updatePreferences({
      projectBudgetRange: {
        min: values[0],
        max: values[1]
      }
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Tell us about your industry focus</h3>
              <p className="text-gray-400 mb-4">Select the industries you're most interested in</p>
              <div className="grid grid-cols-2 gap-3">
                {industries.map((industry) => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox
                      id={industry}
                      checked={preferences.industries.includes(industry)}
                      onCheckedChange={() => handleIndustryToggle(industry)}
                    />
                    <Label htmlFor={industry} className="text-sm text-gray-300">
                      {industry}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What's your AI focus?</h3>
              <p className="text-gray-400 mb-4">Select the AI areas you're working with or interested in</p>
              <div className="grid grid-cols-2 gap-3">
                {aiAreas.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={preferences.ai_focus_areas.includes(area)}
                      onCheckedChange={() => handleAIAreaToggle(area)}
                    />
                    <Label htmlFor={area} className="text-sm text-gray-300">
                      {area}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Project Budget Range</h3>
              <p className="text-gray-400 mb-4">What's your typical project budget range?</p>
              <div className="space-y-4">
                <div className="px-3">
                  <Slider
                    defaultValue={[preferences.projectBudgetRange.min, preferences.projectBudgetRange.max]}
                    max={500000}
                    min={1000}
                    step={5000}
                    onValueChange={handleBudgetChange}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>${preferences.projectBudgetRange.min.toLocaleString()}</span>
                  <span>${preferences.projectBudgetRange.max.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collaboration" className="text-gray-300">How do you typically collaborate?</Label>
              <Select
                value={preferences.collaboration_type}
                onValueChange={(value: any) => updatePreferences({ collaboration_type: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Looking for services</SelectItem>
                  <SelectItem value="vendor">Providing services</SelectItem>
                  <SelectItem value="partner">Strategic partnerships</SelectItem>
                  <SelectItem value="investor">Investment opportunities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Final details</h3>
              <p className="text-gray-400 mb-4">Help us personalize your experience</p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-300">Preferred Location</Label>
                  <Input
                    id="location"
                    value={preferences.location}
                    onChange={(e) => updatePreferences({ location: e.target.value })}
                    placeholder="e.g., Birmingham, Huntsville, Mobile"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-gray-300">Experience Level</Label>
                  <Select
                    value={preferences.experience_level}
                    onValueChange={(value: any) => updatePreferences({ experience_level: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - New to AI</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Some AI experience</SelectItem>
                      <SelectItem value="expert">Expert - Advanced AI practitioner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Complete Your Profile</span>
          <span className="text-sm text-gray-400">
            {currentStep} of {totalSteps}
          </span>
        </CardTitle>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-[#00C2FF] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderStep()}
        
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="border-gray-600 text-gray-300"
          >
            Previous
          </Button>
          
          <Button
            onClick={nextStep}
            className="bg-[#00C2FF] hover:bg-[#00A8D8]"
          >
            {currentStep === totalSteps ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileOnboarding;
