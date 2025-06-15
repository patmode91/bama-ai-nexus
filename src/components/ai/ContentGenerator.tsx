
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Wand2, Copy, RefreshCw, CheckCircle } from 'lucide-react';
import { useMCP } from '@/hooks/useMCP';
import { toast } from 'sonner';

interface ContentGeneratorProps {
  businessData?: {
    name: string;
    category: string;
    location: string;
    services?: string[];
    targetAudience?: string;
  };
  onContentGenerated?: (content: string) => void;
}

const ContentGenerator = ({ businessData, onContentGenerated }: ContentGeneratorProps) => {
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'description' | 'marketing' | 'professional'>('description');
  const { processMessage, runFullAnalysis } = useMCP();

  const templates = [
    {
      id: 'description' as const,
      name: 'Business Description',
      description: 'Professional business description for directories'
    },
    {
      id: 'marketing' as const,
      name: 'Marketing Copy',
      description: 'Engaging marketing content for promotions'
    },
    {
      id: 'professional' as const,
      name: 'Professional Summary',
      description: 'Formal business summary for proposals'
    }
  ];

  const generateContent = async () => {
    if (!businessData) {
      toast.error('Business data is required to generate content');
      return;
    }

    setIsGenerating(true);
    try {
      // Create a detailed prompt based on business data and template
      const prompt = buildPrompt(businessData, selectedTemplate);
      
      // Process the prompt with MCP context
      await processMessage(prompt);
      
      // Run analysis to get enhanced content suggestions
      const results = await runFullAnalysis('content_generation', {
        businessData,
        template: selectedTemplate,
        prompt
      });

      // Generate content based on MCP insights
      const content = await generateEnhancedContent(businessData, selectedTemplate, results);
      
      setGeneratedContent(content);
      if (onContentGenerated) {
        onContentGenerated(content);
      }
      
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const buildPrompt = (data: any, template: string) => {
    let basePrompt = `Generate ${template} content for ${data.name}`;
    
    if (data.category) basePrompt += `, a ${data.category} business`;
    if (data.location) basePrompt += ` located in ${data.location}`;
    if (data.services?.length > 0) basePrompt += ` offering ${data.services.join(', ')}`;
    if (data.targetAudience) basePrompt += ` targeting ${data.targetAudience}`;
    
    return basePrompt;
  };

  const generateEnhancedContent = async (data: any, template: string, mcpResults: any) => {
    // Base content generation logic
    let content = '';
    
    switch (template) {
      case 'description':
        content = generateBusinessDescription(data, mcpResults);
        break;
      case 'marketing':
        content = generateMarketingCopy(data, mcpResults);
        break;
      case 'professional':
        content = generateProfessionalSummary(data, mcpResults);
        break;
    }
    
    return content;
  };

  const generateBusinessDescription = (data: any, mcpResults: any) => {
    const marketInsights = mcpResults.analyst?.insights;
    const connectorData = mcpResults.connector?.matches?.[0];
    
    let description = `${data.name} is a leading ${data.category} company`;
    
    if (data.location) {
      description += ` based in ${data.location}, Alabama`;
    }
    
    if (data.services?.length > 0) {
      description += `. We specialize in ${data.services.slice(0, 3).join(', ')}`;
    }
    
    if (marketInsights) {
      description += `. Operating in ${marketInsights.sector === 'growing' ? 'a rapidly expanding' : 'a stable'} market`;
      if (marketInsights.demandLevel === 'high') {
        description += ' with high demand for our services';
      }
    }
    
    description += '. Our team is committed to delivering exceptional results and building lasting partnerships with our clients.';
    
    if (connectorData?.reasoning) {
      description += ` ${connectorData.reasoning}`;
    }
    
    return description;
  };

  const generateMarketingCopy = (data: any, mcpResults: any) => {
    const marketInsights = mcpResults.analyst?.insights;
    
    let copy = `🚀 Transform Your Business with ${data.name}!\n\n`;
    copy += `Looking for exceptional ${data.category} services in ${data.location || 'Alabama'}? `;
    copy += `You've found the right partner!\n\n`;
    
    if (data.services?.length > 0) {
      copy += `✨ What We Do:\n`;
      data.services.slice(0, 4).forEach((service: string) => {
        copy += `• ${service}\n`;
      });
      copy += '\n';
    }
    
    if (marketInsights?.demandLevel === 'high') {
      copy += `📈 Join the ${marketInsights.competitorCount}+ satisfied clients who trust us!\n\n`;
    }
    
    copy += `Ready to elevate your business? Contact ${data.name} today and discover why we're Alabama's preferred choice for ${data.category} solutions.`;
    
    return copy;
  };

  const generateProfessionalSummary = (data: any, mcpResults: any) => {
    const marketInsights = mcpResults.analyst?.insights;
    
    let summary = `${data.name} - Professional ${data.category} Services\n\n`;
    summary += `COMPANY OVERVIEW\n`;
    summary += `${data.name} is a professional ${data.category} organization`;
    
    if (data.location) {
      summary += ` headquartered in ${data.location}, Alabama`;
    }
    
    summary += `. We provide comprehensive solutions designed to meet the evolving needs of our clients.\n\n`;
    
    if (data.services?.length > 0) {
      summary += `CORE SERVICES\n`;
      data.services.forEach((service: string, index: number) => {
        summary += `${index + 1}. ${service}\n`;
      });
      summary += '\n';
    }
    
    if (marketInsights) {
      summary += `MARKET POSITION\n`;
      summary += `Operating in the ${marketInsights.sector} sector with ${marketInsights.marketTrend} market conditions. `;
      summary += `Current market analysis indicates ${marketInsights.demandLevel} demand levels`;
      if (marketInsights.averageProjectCost) {
        summary += ` with typical project investments ranging from $${marketInsights.averageProjectCost.min.toLocaleString()} to $${marketInsights.averageProjectCost.max.toLocaleString()}`;
      }
      summary += '.\n\n';
    }
    
    summary += `COMMITMENT\n`;
    summary += `${data.name} is dedicated to delivering superior results through innovative solutions, professional excellence, and client-focused service delivery.`;
    
    return summary;
  };

  const copyToClipboard = async () => {
    if (generatedContent) {
      await navigator.clipboard.writeText(generatedContent);
      toast.success('Content copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            AI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Selection */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Content Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={selectedTemplate === template.id 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-700"
                  }
                >
                  {template.name}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {templates.find(t => t.id === selectedTemplate)?.description}
            </p>
          </div>

          {/* Business Data Display */}
          {businessData && (
            <div className="p-3 bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Business Information</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{businessData.name}</Badge>
                <Badge variant="secondary">{businessData.category}</Badge>
                {businessData.location && (
                  <Badge variant="secondary">{businessData.location}</Badge>
                )}
                {businessData.services?.slice(0, 2).map((service, index) => (
                  <Badge key={index} variant="outline" className="border-gray-500">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={generateContent}
            disabled={isGenerating || !businessData}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Generated Content
              </CardTitle>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="min-h-[200px] bg-gray-700 border-gray-600 text-white"
              placeholder="Generated content will appear here..."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentGenerator;
