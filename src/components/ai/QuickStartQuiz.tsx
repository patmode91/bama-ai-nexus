
import { useState } from 'react';
import { ArrowRight, Brain, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizStep {
  id: string;
  question: string;
  options: { value: string; label: string; description?: string }[];
}

interface QuickStartQuizProps {
  onComplete: (answers: Record<string, string>) => void;
  onSkip: () => void;
}

const QuickStartQuiz = ({ onComplete, onSkip }: QuickStartQuizProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const quizSteps: QuizStep[] = [
    {
      id: 'goal',
      question: 'What brings you to BamaAI Connect today?',
      options: [
        { value: 'find-ai-solutions', label: 'Find AI Solutions', description: 'Looking for AI companies to solve business problems' },
        { value: 'list-company', label: 'List My Company', description: 'Want to showcase my AI business' },
        { value: 'explore-market', label: 'Explore the Market', description: 'Research Alabama\'s AI ecosystem' },
        { value: 'find-talent', label: 'Find AI Talent', description: 'Looking for AI professionals to hire' }
      ]
    },
    {
      id: 'industry',
      question: 'Which industry best describes your focus?',
      options: [
        { value: 'healthcare', label: 'Healthcare & Medical' },
        { value: 'manufacturing', label: 'Manufacturing & Industrial' },
        { value: 'financial', label: 'Financial Services' },
        { value: 'retail', label: 'Retail & E-commerce' },
        { value: 'aerospace', label: 'Aerospace & Defense' },
        { value: 'education', label: 'Education & Research' },
        { value: 'agriculture', label: 'Agriculture & Food' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'urgency',
      question: 'What\'s your timeline?',
      options: [
        { value: 'immediate', label: 'ASAP', description: 'Need solutions within 1-2 weeks' },
        { value: 'soon', label: 'Within a Month', description: 'Planning for near-term implementation' },
        { value: 'planning', label: 'In the Next Quarter', description: 'Still in planning phase' },
        { value: 'exploring', label: 'Just Exploring', description: 'Learning about possibilities' }
      ]
    }
  ];

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [quizSteps[currentStep].id]: value };
    setAnswers(newAnswers);

    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuiz = quizSteps[currentStep];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-gray-700">
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-[#00C2FF] to-blue-600 rounded-full flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-2xl text-white mb-2">
          AI-Powered Quick Start
        </CardTitle>
        <p className="text-gray-300">
          Answer 3 quick questions to get personalized recommendations
        </p>
        
        {/* Progress Bar */}
        <div className="flex justify-center mt-4">
          {quizSteps.map((_, index) => (
            <div
              key={index}
              className={`w-8 h-2 mx-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-[#00C2FF]' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6 text-center">
          {currentQuiz.question}
        </h3>
        
        <div className="space-y-3">
          {currentQuiz.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className="w-full p-4 text-left rounded-lg border border-gray-600 bg-gray-700 hover:bg-gray-600 hover:border-[#00C2FF] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white group-hover:text-[#00C2FF]">
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-sm text-gray-400 mt-1">
                      {option.description}
                    </div>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#00C2FF]" />
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={currentStep > 0 ? handleBack : onSkip}
            className="text-gray-400 hover:text-white"
          >
            {currentStep > 0 ? 'Back' : 'Skip Quiz'}
          </Button>
          
          <div className="text-sm text-gray-400">
            Step {currentStep + 1} of {quizSteps.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStartQuiz;
