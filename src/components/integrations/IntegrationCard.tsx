
import { useState } from 'react';
import { Integration } from '@/types/integrations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationCardProps {
  integration: Integration;
  onConfigure: (integration: Integration) => void;
  onToggle: (id: string) => Promise<{ success: boolean; error?: string }>;
  onTest: (id: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const IntegrationCard = ({ integration, onConfigure, onToggle, onTest }: IntegrationCardProps) => {
  const [isToggling, setIsToggling] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    const result = await onToggle(integration.id);
    if (result.success) {
      toast.success(`${integration.name} ${integration.isActive ? 'disabled' : 'enabled'}`);
    } else {
      toast.error(result.error || 'Failed to toggle integration');
    }
    setIsToggling(false);
  };

  const handleTest = async () => {
    if (!integration.isActive) {
      toast.error('Please enable and configure the integration first');
      return;
    }

    setIsTesting(true);
    const result = await onTest(integration.id);
    if (result.success) {
      toast.success(result.message || 'Test successful!');
    } else {
      toast.error(result.error || 'Test failed');
    }
    setIsTesting(false);
  };

  const isConfigured = () => {
    switch (integration.type) {
      case 'webhook':
      case 'zapier':
        return !!(integration.config.url || integration.config.webhookUrl);
      case 'slack':
        return !!(integration.config.webhookUrl && integration.config.channel);
      case 'api':
        return !!(integration.config.keyName);
      default:
        return false;
    }
  };

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{integration.icon}</span>
          <div>
            <CardTitle className="text-lg">{integration.name}</CardTitle>
            <CardDescription className="text-gray-400">
              {integration.description}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={integration.isActive ? "default" : "secondary"}>
            {integration.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {isConfigured() ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={integration.isActive}
                onCheckedChange={handleToggle}
                disabled={isToggling || !isConfigured()}
              />
              <span className="text-sm text-gray-400">
                {integration.isActive ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            {integration.lastTriggered && (
              <span className="text-xs text-gray-500">
                Last used: {new Date(integration.lastTriggered).toLocaleDateString()}
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfigure(integration)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Settings className="w-4 h-4 mr-1" />
              Configure
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={!integration.isActive || isTesting}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <TestTube className="w-4 h-4 mr-1" />
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
