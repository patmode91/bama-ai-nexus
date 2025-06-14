
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, ChevronRight, TrendingUp } from 'lucide-react';
import { useBusinesses } from '@/hooks/useBusinesses';

interface CategoryBrowserProps {
  onCategorySelect: (category: string) => void;
}

const CategoryBrowser = ({ onCategorySelect }: CategoryBrowserProps) => {
  const { data: businesses } = useBusinesses();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate category statistics
  const categoryStats = businesses?.reduce((acc, business) => {
    const category = business.category || 'Other';
    if (!acc[category]) {
      acc[category] = {
        count: 0,
        verified: 0,
        avgEmployees: 0,
        totalEmployees: 0
      };
    }
    acc[category].count++;
    if (business.verified) acc[category].verified++;
    if (business.employees_count) {
      acc[category].totalEmployees += business.employees_count;
    }
    return acc;
  }, {} as Record<string, { count: number; verified: number; avgEmployees: number; totalEmployees: number }>);

  // Calculate average employees for each category
  Object.keys(categoryStats || {}).forEach(category => {
    if (categoryStats![category].totalEmployees > 0) {
      categoryStats![category].avgEmployees = Math.round(
        categoryStats![category].totalEmployees / categoryStats![category].count
      );
    }
  });

  // Sort categories by business count
  const sortedCategories = Object.entries(categoryStats || {})
    .sort(([, a], [, b]) => b.count - a.count);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    onCategorySelect(category);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Browse by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedCategories.map(([category, stats]) => (
            <Button
              key={category}
              variant="ghost"
              onClick={() => handleCategoryClick(category)}
              className={`p-4 h-auto flex-col items-start text-left hover:bg-gray-700 transition-colors ${
                selectedCategory === category ? 'bg-gray-700 border border-[#00C2FF]' : 'border border-gray-600'
              }`}
            >
              <div className="w-full flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{category}</h3>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="w-full space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gray-600 text-gray-200">
                    {stats.count} businesses
                  </Badge>
                  {stats.verified > 0 && (
                    <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                      {stats.verified} verified
                    </Badge>
                  )}
                </div>
                
                {stats.avgEmployees > 0 && (
                  <p className="text-xs text-gray-400">
                    Avg. {stats.avgEmployees} employees
                  </p>
                )}
              </div>
            </Button>
          ))}
        </div>

        {selectedCategory && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory(null);
                onCategorySelect('');
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              View All Categories
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryBrowser;
