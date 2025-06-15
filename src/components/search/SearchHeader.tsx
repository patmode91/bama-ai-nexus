
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

const SearchHeader = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          AI-Powered Semantic Search
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default SearchHeader;
