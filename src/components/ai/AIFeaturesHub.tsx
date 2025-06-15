
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wand2, Tags, Target } from 'lucide-react';
import PersonalizedRecommendationEngine from './PersonalizedRecommendationEngine';
import ContentGenerator from './ContentGenerator';
import BusinessCategorizer from './BusinessCategorizer';

interface AIFeaturesHubProps {
  userId?: string;
  userPreferences?: any;
  selectedBusiness?: any;
}

const AIFeaturesHub = ({ userId, userPreferences, selectedBusiness }: AIFeaturesHubProps) => {
  const [activeTab, setActiveTab] = useState('recommendations');

  const mockBusinessData = selectedBusiness || {
    name: 'TechFlow Solutions',
    category: 'Technology',
    location: 'Birmingham',
    description: 'Innovative software development company specializing in AI and machine learning solutions',
    services: ['Software Development', 'AI Consulting', 'Data Analytics', 'Cloud Solutions']
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          Advanced AI Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger 
              value="recommendations" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600"
            >
              <Target className="w-4 h-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600"
            >
              <Wand2 className="w-4 h-4" />
              Content Gen
            </TabsTrigger>
            <TabsTrigger 
              value="categorizer" 
              className="flex items-center gap-2 data-[state=active]:bg-green-600"
            >
              <Tags className="w-4 h-4" />
              Categorizer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="mt-6">
            <PersonalizedRecommendationEngine 
              userId={userId}
              userPreferences={userPreferences}
            />
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <ContentGenerator 
              businessData={mockBusinessData}
              onContentGenerated={(content) => {
                console.log('Generated content:', content);
              }}
            />
          </TabsContent>

          <TabsContent value="categorizer" className="mt-6">
            <BusinessCategorizer 
              businessData={mockBusinessData}
              onCategoriesUpdated={(categories, tags) => {
                console.log('Updated categories:', categories, 'tags:', tags);
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIFeaturesHub;
