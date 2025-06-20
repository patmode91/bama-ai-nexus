
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface RelatedQueriesProps {
  relatedQueries: string[];
  onRelatedQueryClick: (query: string) => void;
}

const RelatedQueries = ({ relatedQueries, onRelatedQueryClick }: RelatedQueriesProps) => {
  if (relatedQueries.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Related Searches
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {relatedQueries.map((query, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-auto py-2 px-3 text-sm border border-border hover:bg-muted"
              onClick={() => onRelatedQueryClick(query)}
            >
              {query}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedQueries;
