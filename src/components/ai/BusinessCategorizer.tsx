
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tags, Brain, TrendingUp, Target } from 'lucide-react';
import { useMCP } from '@/hooks/useMCP';
import { useBusinesses } from '@/hooks/useBusinesses';

interface CategorySuggestion {
  category: string;
  confidence: number;
  reasoning: string;
  tags: string[];
}

interface BusinessCategorizerProps {
  businessId?: number;
  businessData?: {
    name: string;
    description: string;
    website?: string;
    services?: string[];
  };
  onCategoriesUpdated?: (categories: string[], tags: string[]) => void;
}

const BusinessCategorizer = ({ 
  businessId, 
  businessData, 
  onCategoriesUpdated 
}: BusinessCategorizerProps) => {
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { processMessage, runFullAnalysis } = useMCP();
  const { data: businesses } = useBusinesses();

  const predefinedCategories = [
    'Technology', 'Healthcare', 'Manufacturing', 'Retail', 'Financial Services',
    'Education', 'Real Estate', 'Transportation', 'Energy', 'Agriculture',
    'Entertainment', 'Hospitality', 'Construction', 'Legal Services', 'Marketing',
    'Consulting', 'Non-Profit', 'Government', 'Food & Beverage', 'Automotive'
  ];

  const analyzeBusiness = async () => {
    if (!businessData) return;

    setIsAnalyzing(true);
    try {
      // Create analysis prompt
      const prompt = `Analyze and categorize business: ${businessData.name}. 
        Description: ${businessData.description || 'No description provided'}.
        ${businessData.services ? `Services: ${businessData.services.join(', ')}.` : ''}
        ${businessData.website ? `Website: ${businessData.website}.` : ''}`;

      // Process with MCP for context
      await processMessage(prompt);

      // Run full analysis
      const results = await runFullAnalysis('business_categorization', {
        businessData,
        availableCategories: predefinedCategories
      });

      // Generate category suggestions
      const categorySuggestions = generateCategorySuggestions(businessData, results);
      setSuggestions(categorySuggestions);

    } catch (error) {
      console.error('Error analyzing business:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateCategorySuggestions = (data: any, mcpResults: any): CategorySuggestion[] => {
    const suggestions: CategorySuggestion[] = [];
    
    // Analyze business description for keywords
    const description = (data.description || '').toLowerCase();
    const name = (data.name || '').toLowerCase();
    
    // Technology-related keywords
    if (description.includes('software') || description.includes('app') || 
        description.includes('digital') || description.includes('tech') ||
        name.includes('tech') || name.includes('software')) {
      suggestions.push({
        category: 'Technology',
        confidence: 85,
        reasoning: 'Contains technology-related keywords and services',
        tags: ['Software', 'Digital Solutions', 'Innovation']
      });
    }

    // Healthcare keywords
    if (description.includes('health') || description.includes('medical') ||
        description.includes('clinic') || description.includes('hospital')) {
      suggestions.push({
        category: 'Healthcare',
        confidence: 90,
        reasoning: 'Healthcare-related business based on description',
        tags: ['Medical', 'Health Services', 'Patient Care']
      });
    }

    // Manufacturing keywords
    if (description.includes('manufacturing') || description.includes('production') ||
        description.includes('factory') || description.includes('industrial')) {
      suggestions.push({
        category: 'Manufacturing',
        confidence: 88,
        reasoning: 'Manufacturing and production indicators found',
        tags: ['Production', 'Industrial', 'Manufacturing']
      });
    }

    // Retail keywords
    if (description.includes('retail') || description.includes('store') ||
        description.includes('shop') || description.includes('sales')) {
      suggestions.push({
        category: 'Retail',
        confidence: 82,
        reasoning: 'Retail and sales business indicators',
        tags: ['Sales', 'Customer Service', 'Retail']
      });
    }

    // Use MCP results for enhanced categorization
    if (mcpResults.analyst?.insights) {
      const sector = mcpResults.analyst.insights.sector;
      if (sector && predefinedCategories.includes(sector)) {
        suggestions.push({
          category: sector,
          confidence: 95,
          reasoning: 'AI market analysis indicates this sector',
          tags: ['Market Validated', 'AI Recommended']
        });
      }
    }

    // Service-based analysis
    if (data.services?.length > 0) {
      data.services.forEach((service: string) => {
        const serviceLower = service.toLowerCase();
        if (serviceLower.includes('consult')) {
          suggestions.push({
            category: 'Consulting',
            confidence: 80,
            reasoning: 'Consulting services identified',
            tags: ['Advisory', 'Professional Services', 'Consulting']
          });
        }
        if (serviceLower.includes('market')) {
          suggestions.push({
            category: 'Marketing',
            confidence: 75,
            reasoning: 'Marketing services identified',
            tags: ['Marketing', 'Advertising', 'Brand Strategy']
          });
        }
      });
    }

    // Remove duplicates and sort by confidence
    const uniqueSuggestions = suggestions.reduce((acc, current) => {
      const existing = acc.find(item => item.category === current.category);
      if (!existing || existing.confidence < current.confidence) {
        return [...acc.filter(item => item.category !== current.category), current];
      }
      return acc;
    }, [] as CategorySuggestion[]);

    return uniqueSuggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const applyCategories = () => {
    if (onCategoriesUpdated) {
      onCategoriesUpdated(selectedCategories, selectedTags);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  useEffect(() => {
    if (businessData) {
      analyzeBusiness();
    }
  }, [businessData]);

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            AI Business Categorizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {businessData && (
            <div className="p-3 bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Business Info</h4>
              <p className="text-white font-medium">{businessData.name}</p>
              {businessData.description && (
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                  {businessData.description}
                </p>
              )}
            </div>
          )}

          <Button 
            onClick={analyzeBusiness}
            disabled={isAnalyzing || !businessData}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Analyze & Categorize
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Category Suggestions */}
      {suggestions.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Category Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedCategories.includes(suggestion.category) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCategory(suggestion.category)}
                      className={selectedCategories.includes(suggestion.category)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-gray-500 text-gray-300 hover:bg-gray-600"
                      }
                    >
                      {suggestion.category}
                    </Button>
                    <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                      {suggestion.confidence}% confidence
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{suggestion.reasoning}</p>
                
                <div className="flex flex-wrap gap-2">
                  {suggestion.tags.map((tag, tagIndex) => (
                    <Badge 
                      key={tagIndex}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedTags.includes(tag)
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "border-gray-500 hover:bg-gray-600"
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      <Tags className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Selected Categories and Tags */}
      {(selectedCategories.length > 0 || selectedTags.length > 0) && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Selected Classifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCategories.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <Badge key={category} className="bg-blue-600">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-purple-500 text-purple-400">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={applyCategories}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Apply Classifications
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessCategorizer;
