
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  Database,
  CheckCircle,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useAgent } from '@/hooks/useAgent';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  agent: 'general' | 'connector' | 'analyst' | 'curator';
  icon: React.ComponentType<any>;
  completed: boolean;
}

export const OnboardingConcierge: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});
  
  const { callAgent, isLoading, response } = useAgent('general');

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to BAMA AI Nexus',
      description: 'Let me introduce you to your AI-powered business ecosystem',
      agent: 'general',
      icon: Bot,
      completed: false
    },
    {
      id: 'business_matching',
      title: 'Meet Your Connector Agent',
      description: 'Find businesses and opportunities that match your needs',
      agent: 'connector',
      icon: Users,
      completed: false
    },
    {
      id: 'market_insights',
      title: 'Explore Market Intelligence',
      description: 'Get AI-powered insights about Alabama\'s business landscape',
      agent: 'analyst',
      icon: TrendingUp,
      completed: false
    },
    {
      id: 'data_curation',
      title: 'Discover Data Curation',
      description: 'See how we keep your business information accurate and up-to-date',
      agent: 'curator',
      icon: Database,
      completed: false
    }
  ];

  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>(steps);
  const progress = (completedSteps.filter(step => step.completed).length / steps.length) * 100;

  const handleStepInteraction = async (step: OnboardingStep) => {
    const prompts = {
      welcome: `Hello! I'm your AI concierge. Tell me about your business or what you're looking for in Alabama's AI ecosystem. For example: "I'm a startup looking for AI consulting services" or "I represent a healthcare company interested in AI partnerships"`,
      business_matching: `Based on what you told me: "${onboardingData.welcome || userInput}", let me show you how our Connector Agent finds relevant businesses. What specific type of business relationship are you most interested in?`,
      market_insights: `Now let me demonstrate our Market Analyst capabilities. Based on your interests, what market trends or competitive insights would be most valuable to your business?`,
      data_curation: `Finally, let me show you how our Curator Agent ensures data quality. What type of business information is most critical for your decision-making?`
    };

    try {
      await callAgent(prompts[step.id as keyof typeof prompts]);
      
      // Update onboarding data
      setOnboardingData(prev => ({
        ...prev,
        [step.id]: userInput
      }));

      // Mark step as completed
      setCompletedSteps(prev => 
        prev.map(s => s.id === step.id ? { ...s, completed: true } : s)
      );

    } catch (error) {
      console.error('Onboarding step error:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserInput('');
    }
  };

  const handleFinishOnboarding = () => {
    // Save onboarding completion to user preferences
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_data', JSON.stringify(onboardingData));
    
    // Redirect to dashboard or close onboarding
    window.location.href = '/dashboard';
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#00C2FF]" />
                <span>AI Agent Onboarding</span>
              </CardTitle>
              <p className="text-gray-300 mt-1">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <Badge className="bg-[#00C2FF] text-white">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Current Step */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-[#00C2FF]/20">
                <currentStepData.icon className="w-6 h-6 text-[#00C2FF]" />
              </div>
              <div>
                <h3 className="text-white">{currentStepData.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{currentStepData.description}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Tell me about your business needs..."
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button
                onClick={() => handleStepInteraction(currentStepData)}
                disabled={isLoading || !userInput.trim()}
                className="w-full bg-[#00C2FF] hover:bg-[#00A8D8]"
              >
                {isLoading ? (
                  <>
                    <Bot className="w-4 h-4 mr-2 animate-pulse" />
                    AI Agent is thinking...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Interact with {currentStepData.agent} Agent
                  </>
                )}
              </Button>
            </div>

            {response && (
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <currentStepData.icon className="w-5 h-5 text-[#00C2FF] mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-white mb-1">
                      {currentStepData.agent.charAt(0).toUpperCase() + currentStepData.agent.slice(1)} Agent Response:
                    </div>
                    <p className="text-sm text-gray-300">
                      {response.data?.response || 'Agent response received successfully!'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Your Onboarding Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    index === currentStep
                      ? 'bg-[#00C2FF]/20 border border-[#00C2FF]/30'
                      : completedSteps[index]?.completed
                      ? 'bg-green-600/20'
                      : 'bg-gray-700/30'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    completedSteps[index]?.completed
                      ? 'bg-green-600/30'
                      : index === currentStep
                      ? 'bg-[#00C2FF]/30'
                      : 'bg-gray-600/30'
                  }`}>
                    {completedSteps[index]?.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <step.icon className={`w-4 h-4 ${
                        index === currentStep ? 'text-[#00C2FF]' : 'text-gray-400'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      index === currentStep ? 'text-[#00C2FF]' : 'text-white'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="border-gray-600 text-gray-300"
        >
          Previous
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleFinishOnboarding}
            disabled={!completedSteps[currentStep]?.completed}
            className="bg-green-600 hover:bg-green-700"
          >
            Complete Onboarding
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!completedSteps[currentStep]?.completed}
            className="bg-[#00C2FF] hover:bg-[#00A8D8]"
          >
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};
