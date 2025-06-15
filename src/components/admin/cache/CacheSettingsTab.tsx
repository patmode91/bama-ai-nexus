
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const CacheSettingsTab: React.FC = () => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Cache Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Auto-cleanup Interval</label>
              <div className="text-white">60 seconds</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Compression</label>
              <Badge className="bg-green-500 text-white">Enabled</Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Analytics</label>
              <Badge className="bg-green-500 text-white">Enabled</Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Eviction Policy</label>
              <div className="text-white">LRU (Least Recently Used)</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
