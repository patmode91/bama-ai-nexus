
import { useState } from 'react';
import { Integration } from '@/types/integrations';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationConfigProps {
  integration: Integration | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Integration>) => Promise<{ success: boolean; error?: string }>;
  generateApiKey: () => string;
}

const IntegrationConfig = ({ integration, isOpen, onClose, onSave, generateApiKey }: IntegrationConfigProps) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!integration) return;
    
    setIsSaving(true);
    const result = await onSave(integration.id, { config });
    if (result.success) {
      toast.success('Integration configuration saved');
      onClose();
    } else {
      toast.error(result.error || 'Failed to save configuration');
    }
    setIsSaving(false);
  };

  const handleGenerateApiKey = () => {
    const newKey = generateApiKey();
    setConfig(prev => ({ ...prev, apiKey: newKey }));
    toast.success('New API key generated');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!integration) return null;

  const renderConfigForm = () => {
    switch (integration.type) {
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-domain.com/webhook"
                value={config.url || integration.config.url || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="webhook-secret">Secret (Optional)</Label>
              <Input
                id="webhook-secret"
                type="password"
                placeholder="Your webhook secret"
                value={config.secret || integration.config.secret || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, secret: e.target.value }))}
              />
            </div>

            <div>
              <Label>Events to Send</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['new_contact', 'new_review', 'profile_update', 'verification_status'].map(event => (
                  <Badge key={event} variant="secondary" className="cursor-pointer">
                    {event.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'zapier':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="zapier-webhook">Zapier Webhook URL</Label>
              <Input
                id="zapier-webhook"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={config.webhookUrl || integration.config.webhookUrl || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
              />
              <p className="text-sm text-gray-400 mt-1">
                Create a webhook trigger in Zapier and paste the URL here
              </p>
            </div>
          </div>
        );

      case 'slack':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
              <Input
                id="slack-webhook"
                placeholder="https://hooks.slack.com/services/..."
                value={config.webhookUrl || integration.config.webhookUrl || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="slack-channel">Channel</Label>
              <Input
                id="slack-channel"
                placeholder="#general"
                value={config.channel || integration.config.channel || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, channel: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="slack-username">Bot Username (Optional)</Label>
              <Input
                id="slack-username"
                placeholder="Alabama AI Bot"
                value={config.username || integration.config.username || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="key-name">API Key Name</Label>
              <Input
                id="key-name"
                placeholder="My App Integration"
                value={config.keyName || integration.config.keyName || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, keyName: e.target.value }))}
              />
            </div>

            <div>
              <Label>Generated API Key</Label>
              <div className="flex space-x-2">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={config.apiKey || integration.config.apiKey || ''}
                  readOnly
                  placeholder="Click generate to create an API key"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(config.apiKey || integration.config.apiKey || '')}
                  disabled={!config.apiKey && !integration.config.apiKey}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateApiKey}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="space-y-2 mt-2">
                {['read_profile', 'read_reviews', 'write_reviews', 'manage_profile'].map(permission => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Switch
                      checked={(config.permissions || integration.config.permissions || []).includes(permission)}
                      onCheckedChange={(checked) => {
                        const currentPermissions = config.permissions || integration.config.permissions || [];
                        const newPermissions = checked
                          ? [...currentPermissions, permission]
                          : currentPermissions.filter((p: string) => p !== permission);
                        setConfig(prev => ({ ...prev, permissions: newPermissions }));
                      }}
                    />
                    <Label className="text-sm">{permission.replace('_', ' ')}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <p>Configuration not available for this integration type.</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-xl">{integration.icon}</span>
            <span>Configure {integration.name}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {integration.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {renderConfigForm()}

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntegrationConfig;
