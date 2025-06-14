
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sparkles, 
  Wand2, 
  Copy, 
  RefreshCw, 
  Download, 
  CheckCircle,
  FileText,
  Tag
} from 'lucide-react';
import { aiService, ContentSuggestion } from '@/services/aiService';
import { toast } from 'sonner';

interface BusinessData {
  businessname: string;
  category: string;
  location: string;
  employees_count?: number;
  founded_year?: number;
  website?: string;
  description?: string;
}

interface ContentGeneratorProps {
  businessData?: BusinessData;
  onContentGenerated?: (content: ContentSuggestion) => void;
}

const ContentGenerator = ({ businessData, onContentGenerated }: ContentGeneratorProps) => {
  const [formData, setFormData] = useState<BusinessData>({
    businessname: businessData?.businessname || '',
    category: businessData?.category || '',
    location: businessData?.location || '',
    employees_count: businessData?.employees_count || undefined,
    founded_year: businessData?.founded_year || undefined,
    website: businessData?.website || '',
    description: businessData?.description || ''
  });
  
  const [generatedContent, setGeneratedContent] = useState<ContentSuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentType, setContentType] = useState<'description' | 'marketing' | 'complete'>('complete');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'innovative' | 'authoritative'>('professional');

  const handleInputChange = (field: keyof BusinessData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateContent = async () => {
    if (!formData.businessname || !formData.category) {
      toast.error('Please provide at least business name and category');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const content = aiService.generateBusinessContent({
        ...formData,
        tone,
        contentType
      });
      
      setGeneratedContent(content);
      onContentGenerated?.(content);
      toast.success('Content generated successfully!');
    } catch (error) {
      toast.error('Failed to generate content');
      console.error('Content generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateContent = () => {
    setGeneratedContent(null);
    generateContent();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const exportContent = () => {
    if (!generatedContent) return;
    
    const content = `
Business Title: ${generatedContent.title}

Description:
${generatedContent.description}

Tags: ${generatedContent.tags.join(', ')}

Marketing Points:
${generatedContent.marketingPoints.map(point => `• ${point}`).join('\n')}
    `.trim();
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.businessname || 'business'}-content.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Content exported successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Wand2 className="w-5 h-5 mr-2 text-[#00C2FF]" />
            AI Content Generator
            <Badge className="ml-2 bg-purple-500 text-white">Beta</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessname" className="text-white">Business Name *</Label>
              <Input
                id="businessname"
                value={formData.businessname}
                onChange={(e) => handleInputChange('businessname', e.target.value)}
                placeholder="Enter business name"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Aerospace">Aerospace</SelectItem>
                  <SelectItem value="Automotive">Automotive</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employees" className="text-white">Employee Count</Label>
              <Input
                id="employees"
                type="number"
                value={formData.employees_count || ''}
                onChange={(e) => handleInputChange('employees_count', parseInt(e.target.value) || 0)}
                placeholder="Number of employees"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone" className="text-white">Content Tone</Label>
              <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="innovative">Innovative</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentType" className="text-white">Content Type</Label>
              <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="complete">Complete Package</SelectItem>
                  <SelectItem value="description">Description Only</SelectItem>
                  <SelectItem value="marketing">Marketing Content</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Current Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Existing business description to improve upon..."
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          <Button
            onClick={generateContent}
            disabled={isGenerating || !formData.businessname || !formData.category}
            className="w-full bg-gradient-to-r from-[#00C2FF] to-purple-600 hover:from-[#00A8D8] hover:to-purple-500"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Generating Content...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate AI Content
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
              <CardTitle className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Generated Content
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateContent}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportContent}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white font-semibold">Business Title</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent.title)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-white text-lg font-medium">{generatedContent.title}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white font-semibold flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Business Description
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent.description)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-200 leading-relaxed">{generatedContent.description}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white font-semibold flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Suggested Tags
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent.tags.join(', '))}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {generatedContent.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-[#00C2FF]/30 text-[#00C2FF] bg-[#00C2FF]/10"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Marketing Points */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white font-semibold">Key Marketing Points</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent.marketingPoints.join('\n• '))}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <ul className="space-y-2">
                  {generatedContent.marketingPoints.map((point, index) => (
                    <li key={index} className="text-gray-200 flex items-start">
                      <span className="text-[#00C2FF] mr-2">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContentGenerator;
