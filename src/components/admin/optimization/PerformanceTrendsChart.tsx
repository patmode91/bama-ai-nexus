
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface PerformanceTrendsChartProps {
  score: number;
}

const PerformanceTrendsChart = ({ score }: PerformanceTrendsChartProps) => {
  const performanceData = [
    { time: '1h ago', score: score - 15 },
    { time: '45m ago', score: score - 12 },
    { time: '30m ago', score: score - 8 },
    { time: '15m ago', score: score - 3 },
    { time: 'Now', score: score }
  ];

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#00C2FF" 
              strokeWidth={3}
              dot={{ fill: '#00C2FF', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceTrendsChart;
