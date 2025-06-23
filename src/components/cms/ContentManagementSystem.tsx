
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Edit, 
  Eye, 
  Calendar, 
  User, 
  TrendingUp,
  Share2,
  BookOpen,
  Lightbulb
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  author: string;
  category: 'thought_leadership' | 'market_insights' | 'agent_discoveries' | 'case_studies';
  status: 'draft' | 'published' | 'scheduled';
  publishDate: Date;
  tags: string[];
  views: number;
  shares: number;
}

export const ContentManagementSystem: React.FC = () => {
  const [contents, setContents] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'The Future of AI in Alabama\'s Business Ecosystem',
      content: 'Alabama is emerging as a significant player in the AI revolution...',
      author: 'The Oracle',
      category: 'thought_leadership',
      status: 'published',
      publishDate: new Date('2024-01-15'),
      tags: ['AI', 'Alabama', 'Business', 'Innovation'],
      views: 1247,
      shares: 89
    },
    {
      id: '2',
      title: 'AI Agent Discovery: Top Healthcare Innovators',
      content: 'Our Connector Agent has identified emerging healthcare AI companies...',
      author: 'Connector Agent',
      category: 'agent_discoveries',
      status: 'published',
      publishDate: new Date('2024-01-10'),
      tags: ['Healthcare', 'AI', 'Discovery'],
      views: 834,
      shares: 52
    }
  ]);

  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'thought_leadership': return <Lightbulb className="w-4 h-4" />;
      case 'market_insights': return <TrendingUp className="w-4 h-4" />;
      case 'agent_discoveries': return <Eye className="w-4 h-4" />;
      case 'case_studies': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'thought_leadership': return 'bg-purple-600';
      case 'market_insights': return 'bg-blue-600';
      case 'agent_discoveries': return 'bg-green-600';
      case 'case_studies': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-600';
      case 'scheduled': return 'bg-yellow-600';
      case 'draft': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <FileText className="w-6 h-6 text-[#00C2FF]" />
            <span>Nexus Intelligence Dispatch</span>
            <Badge className="bg-[#00C2FF] text-white">Content Management</Badge>
          </CardTitle>
          <p className="text-gray-300">
            Create and manage thought leadership content powered by AI insights
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="content-list" className="space-y-6">
        <TabsList className="bg-gray-800 w-full">
          <TabsTrigger value="content-list" className="flex-1">Content Library</TabsTrigger>
          <TabsTrigger value="create-content" className="flex-1">Create Content</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">Content Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="content-list" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Content List */}
            <div className="lg:col-span-2 space-y-4">
              {contents.map((content) => (
                <Card
                  key={content.id}
                  className="bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                  onClick={() => setSelectedContent(content)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getCategoryIcon(content.category)}
                          <h3 className="font-semibold text-white">{content.title}</h3>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                          {content.content.substring(0, 120)}...
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{content.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{content.publishDate.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{content.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share2 className="w-3 h-3" />
                            <span>{content.shares}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Badge className={`${getCategoryColor(content.category)} text-white text-xs`}>
                          {content.category.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getStatusColor(content.status)} text-white text-xs block`}>
                          {content.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {content.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Content Preview */}
            <div className="space-y-4">
              {selectedContent ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>Content Preview</span>
                      <Button
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">{selectedContent.title}</h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={`${getCategoryColor(selectedContent.category)} text-white text-xs`}>
                          {selectedContent.category.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getStatusColor(selectedContent.status)} text-white text-xs`}>
                          {selectedContent.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 space-y-2">
                      <p><strong>Author:</strong> {selectedContent.author}</p>
                      <p><strong>Published:</strong> {selectedContent.publishDate.toLocaleDateString()}</p>
                      <p><strong>Views:</strong> {selectedContent.views.toLocaleString()}</p>
                      <p><strong>Shares:</strong> {selectedContent.shares.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <p className="text-sm text-gray-300">{selectedContent.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Select content to preview</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create-content" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Create New Content</CardTitle>
              <p className="text-gray-400">
                Publish thought leadership content to establish authority in Alabama's AI ecosystem
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Content Title"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <select className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2">
                  <option value="thought_leadership">Thought Leadership</option>
                  <option value="market_insights">Market Insights</option>
                  <option value="agent_discoveries">Agent Discoveries</option>
                  <option value="case_studies">Case Studies</option>
                </select>
              </div>
              <Input
                placeholder="Tags (comma separated)"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Textarea
                placeholder="Content body..."
                className="bg-gray-700 border-gray-600 text-white min-h-[200px]"
              />
              <div className="flex space-x-2">
                <Button className="bg-[#00C2FF] hover:bg-[#00A8D8]">
                  Publish Now
                </Button>
                <Button variant="outline" className="border-gray-600">
                  Save as Draft
                </Button>
                <Button variant="outline" className="border-gray-600">
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-[#00C2FF]">24</div>
                <div className="text-sm text-gray-400">Total Articles</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">12.4K</div>
                <div className="text-sm text-gray-400">Total Views</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">847</div>
                <div className="text-sm text-gray-400">Total Shares</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">4.2</div>
                <div className="text-sm text-gray-400">Avg. Engagement</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
