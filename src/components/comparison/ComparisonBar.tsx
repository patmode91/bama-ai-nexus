
import { Business } from '@/hooks/useBusinesses';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Badge } from '../ui/badge';

interface ComparisonBarProps {
  businesses: Business[];
  onClear: () => void;
  onCompare: () => void;
  onRemove: (businessId: number) => void;
}

const ComparisonBar = ({ businesses, onClear, onCompare, onRemove }: ComparisonBarProps) => {
  const remainingSlots = 4 - businesses.length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 animate-in slide-in-from-bottom-10 duration-500">
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 max-w-5xl mx-auto shadow-lg">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-2">Comparison List ({businesses.length}/4)</h4>
            <div className="flex flex-wrap gap-2">
              {businesses.map(b => (
                <Badge key={b.id} variant="secondary" className="bg-gray-700 text-white pl-3 pr-1 py-1">
                  {b.businessname}
                  <button onClick={() => onRemove(b.id)} className="ml-1.5 text-gray-400 hover:text-white text-xs font-bold rounded-full hover:bg-gray-600 w-4 h-4 flex items-center justify-center">x</button>
                </Badge>
              ))}
              {Array.from({ length: remainingSlots }).map((_, i) => (
                <div key={`placeholder-${i}`} className="text-xs bg-gray-800 border border-dashed border-gray-600 text-gray-500 px-2 py-1 rounded">
                  Add a business
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onCompare} disabled={businesses.length < 2} className="bg-[#00C2FF] hover:bg-[#00A8D8]">
              Compare ({businesses.length})
            </Button>
            <Button variant="outline" onClick={onClear} className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <X className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Clear</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonBar;
