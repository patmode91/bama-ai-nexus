
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface RelatedQueriesProps {
  relatedQueries: string[];
  onRelatedQueryClick: (query: string) => void;
}

const RelatedQueries = ({ relatedQueries, onRelatedQueryClick }: RelatedQueriesProps) => {
  if (relatedQueries.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <TrendingUp className="w-4 h-4" />
            Related Searches:
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedQueries.map((query, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50"
                onClick={() => onRelatedQueryClick(query)}
              >
                {query}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedQueries;
