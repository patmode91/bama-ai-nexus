
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Star, Download, ExternalLink, Filter, Zap, Mail, MessageSquare, BarChart3, Cloud, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface MarketplaceIntegration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rating: number;
  installs: number;
  price: 'free' | 'paid' | 'freemium';
  developer: string;
  featured: boolean;
  setupTime: string;
  tags: string[];
}

const IntegrationMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');

  const integrations: MarketplaceIntegration[] = [
    {
      id: 'zapier-pro',
      name: 'Zapier Pro',
      description: 'Connect with 5000+ apps and automate your business workflows',
      icon: '⚡',
      category: 'automation',
      rating: 4.8,
      installs: 15420,
      price: 'freemium',
      developer: 'Zapier Inc.',
      featured: true,
      setupTime: '5 minutes',
      tags: ['automation', 'workflow', 'productivity']
    },
    {
      id: 'slack-notifications',
      name: 'Slack Business',
      description: 'Get instant notifications for reviews, contacts, and business updates',
      icon: '💬',
      category: 'communication',
      rating: 4.9,
      installs: 8930,
      price: 'free',
      developer: 'Slack Technologies',
      featured: true,
      setupTime: '2 minutes',
      tags: ['notifications', 'team', 'chat']
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics 4',
      description: 'Track visitor behavior and business performance metrics',
      icon: '📊',
      category: 'analytics',
      rating: 4.7,
      installs: 12560,
      price: 'free',
      developer: 'Google LLC',
      featured: false,
      setupTime: '10 minutes',
      tags: ['analytics', 'tracking', 'metrics']
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Sync contacts and create targeted email campaigns',
      icon: '📧',
      category: 'marketing',
      rating: 4.6,
      installs: 6780,
      price: 'freemium',
      developer: 'Mailchimp',
      featured: false,
      setupTime: '8 minutes',
      tags: ['email', 'marketing', 'campaigns']
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      description: 'Manage leads and customer relationships effectively',
      icon: '🎯',
      category: 'crm',
      rating: 4.5,
      installs: 4320,
      price: 'freemium',
      developer: 'HubSpot Inc.',
      featured: false,
      setupTime: '15 minutes',
      tags: ['crm', 'leads', 'sales']
    },
    {
      id: 'discord',
      name: 'Discord Webhooks',
      description: 'Send notifications to your Discord server channels',
      icon: '🎮',
      category: 'communication',
      rating: 4.4,
      installs: 2150,
      price: 'free',
      developer: 'Discord Inc.',
      featured: false,
      setupTime: '3 minutes',
      tags: ['discord', 'notifications', 'community']
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks Online',
      description: 'Sync business data with your accounting software',
      icon: '💰',
      category: 'finance',
      rating: 4.3,
      installs: 1890,
      price: 'paid',
      developer: 'Intuit Inc.',
      featured: false,
      setupTime: '20 minutes',
      tags: ['accounting', 'finance', 'invoicing']
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Enterprise CRM integration for large businesses',
      icon: '☁️',
      category: 'crm',
      rating: 4.7,
      installs: 980,
      price: 'paid',
      developer: 'Salesforce.com',
      featured: false,
      setupTime: '30 minutes',
      tags: ['enterprise', 'crm', 'sales']
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories', icon: Filter },
    { value: 'automation', label: 'Automation', icon: Zap },
    { value: 'communication', label: 'Communication', icon: MessageSquare },
    { value: 'analytics', label: 'Analytics', icon: BarChart3 },
    { value: 'marketing', label: 'Marketing', icon: Mail },
    { value: 'crm', label: 'CRM', icon: Cloud },
    { value: 'finance', label: 'Finance', icon: Shield }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesPrice = selectedPrice === 'all' || integration.price === selectedPrice;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const featuredIntegrations = filteredIntegrations.filter(i => i.featured);
  const popularIntegrations = [...filteredIntegrations].sort((a, b) => b.installs - a.installs).slice(0, 6);

  const handleInstall = (integration: MarketplaceIntegration) => {
    toast.success(`${integration.name} integration started! Check your integrations page.`);
  };

  const getPriceColor = (price: string) => {
    switch (price) {
      case 'free': return 'bg-green-500';
      case 'paid': return 'bg-blue-500';
      case 'freemium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const renderIntegrationCard = (integration: MarketplaceIntegration) => (
    <Card key={integration.id} className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-gray-600 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{integration.icon}</div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <p className="text-sm text-gray-400">by {integration.developer}</p>
            </div>
          </div>
          {integration.featured && (
            <Badge className="bg-purple-500">Featured</Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">{integration.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{integration.rating}</span>
              <span className="text-gray-400">({integration.installs.toLocaleString()} installs)</span>
            </div>
            <Badge className={`${getPriceColor(integration.price)} text-white capitalize`}>
              {integration.price}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1">
            {integration.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Setup: {integration.setupTime}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-3 h-3 mr-1" />
                Details
              </Button>
              <Button size="sm" onClick={() => handleInstall(integration)}>
                <Download className="w-3 h-3 mr-1" />
                Install
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Integration Marketplace</span>
          </CardTitle>
          <CardDescription>
            Discover and install integrations to supercharge your business
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-600">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Select value={selectedPrice} onValueChange={setSelectedPrice}>
              <SelectTrigger className="w-full md:w-32 bg-gray-800 border-gray-600">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="freemium">Freemium</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="all">All ({filteredIntegrations.length})</TabsTrigger>
              <TabsTrigger value="featured">Featured ({featuredIntegrations.length})</TabsTrigger>
              <TabsTrigger value="popular">Popular ({popularIntegrations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIntegrations.map(renderIntegrationCard)}
              </div>
            </TabsContent>

            <TabsContent value="featured" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredIntegrations.map(renderIntegrationCard)}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularIntegrations.map(renderIntegrationCard)}
              </div>
            </TabsContent>
          </Tabs>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No integrations found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationMarketplace;
