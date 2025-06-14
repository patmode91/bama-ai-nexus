
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useMemo } from 'react';

const CategoryInsights = () => {
  const { data: businesses, isLoading } = useBusinesses();

  const categoryData = useMemo(() => {
    if (!businesses) return [];
    
    const categoryCount = businesses.reduce((acc, business) => {
      const category = business.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [businesses]);

  const pieData = useMemo(() => {
    if (!businesses) return [];
    
    const employeeRanges = {
      '1-10': 0,
      '11-50': 0,
      '51-200': 0,
      '201-500': 0,
      '500+': 0
    };

    businesses.forEach(business => {
      const count = business.employees_count;
      if (!count) return;
      
      if (count <= 10) employeeRanges['1-10']++;
      else if (count <= 50) employeeRanges['11-50']++;
      else if (count <= 200) employeeRanges['51-200']++;
      else if (count <= 500) employeeRanges['201-500']++;
      else employeeRanges['500+']++;
    });

    return Object.entries(employeeRanges).map(([range, value]) => ({
      name: range,
      value
    }));
  }, [businesses]);

  const COLORS = ['#00C2FF', '#0099CC', '#007399', '#004D66', '#002633'];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse h-64 bg-gray-600 rounded"></div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse h-64 bg-gray-600 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="category" 
                stroke="#9CA3AF"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#00C2FF" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Company Size Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryInsights;
