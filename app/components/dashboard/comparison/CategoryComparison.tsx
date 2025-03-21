import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ComparisonService, CategoryMetrics, ComparisonResult } from '../../../services/analytics/comparison';

interface CategoryComparisonProps {
  categories: Record<string, CategoryMetrics>;
  baselineCategory?: string;
  showSignificance?: boolean;
}

const CategoryComparison: React.FC<CategoryComparisonProps> = ({
  categories,
  baselineCategory,
  showSignificance = true,
}) => {
  const comparisonService = useMemo(() => new ComparisonService(), []);

  const transformedData = useMemo(() => {
    const baseline = baselineCategory || Object.keys(categories)[0];
    const comparisons = comparisonService.compareCategoryPerformance(categories);
    
    return Object.entries(comparisons).map(([category, metrics]) => ({
      name: category,
      engagement: metrics.engagement.relativeChange * 100,
      engagementSignificant: metrics.engagement.isSignificant,
      retention: metrics.retention.relativeChange * 100,
      retentionSignificant: metrics.retention.isSignificant,
      conversion: metrics.conversion.relativeChange * 100,
      conversionSignificant: metrics.conversion.isSignificant,
      satisfaction: metrics.satisfaction.relativeChange * 100,
      satisfactionSignificant: metrics.satisfaction.isSignificant,
    }));
  }, [categories, baselineCategory, comparisonService]);

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-4 rounded shadow-lg border">
        <h3 className="font-semibold mb-2">{label}</h3>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">
              {entry.name}: {entry.value.toFixed(1)}%
            </span>
            {showSignificance && (
              <span className="text-sm text-gray-500">
                {entry.payload[`${entry.dataKey}Significant`]
                  ? '(Significant)'
                  : '(Not Significant)'}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-[500px] p-4">
      <h2 className="text-xl font-semibold mb-4">
        Category Performance Comparison
        {baselineCategory && ` (vs. ${baselineCategory})`}
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={transformedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            label={{ value: 'Relative Change (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={renderCustomTooltip} />
          <Legend />
          <Bar
            dataKey="engagement"
            name="Engagement"
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="retention"
            name="Retention"
            fill="#82ca9d"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="conversion"
            name="Conversion"
            fill="#ffc658"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="satisfaction"
            name="Satisfaction"
            fill="#ff7300"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryComparison; 