import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ComparisonService, PerformanceMetric } from '../../../services/analytics/comparison';

interface TimeSeriesData {
  timestamp: Date;
  metrics: PerformanceMetric;
}

interface TimeComparisonProps {
  timeSeriesData: TimeSeriesData[];
  metric: 'engagement' | 'retention' | 'conversion' | 'satisfaction';
  showTrend?: boolean;
  showConfidence?: boolean;
}

const TimeComparison: React.FC<TimeComparisonProps> = ({
  timeSeriesData,
  metric,
  showTrend = true,
  showConfidence = true,
}) => {
  const comparisonService = useMemo(() => new ComparisonService(), []);

  const { transformedData, trend } = useMemo(() => {
    const metricData = timeSeriesData.map(d => d.metrics);
    const trendAnalysis = comparisonService.calculateTimeTrends(metricData);

    const data = timeSeriesData.map((point, index) => {
      const value = point.metrics.value * 100;
      const confidence = point.metrics.confidence || 0;

      return {
        timestamp: point.timestamp.toISOString().split('T')[0],
        value,
        upperBound: value + (confidence * 100),
        lowerBound: value - (confidence * 100),
        trendValue: trendAnalysis.velocity * index + value,
      };
    });

    return {
      transformedData: data,
      trend: trendAnalysis,
    };
  }, [timeSeriesData, comparisonService]);

  const renderTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-4 rounded shadow-lg border">
        <h3 className="font-semibold mb-2">{label}</h3>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#8884d8' }}
            />
            <span className="font-medium">
              Value: {payload[0].value.toFixed(1)}%
            </span>
          </div>
          {showConfidence && (
            <div className="text-sm text-gray-500">
              Confidence Interval:
              <br />
              {payload[0].payload.lowerBound.toFixed(1)}% - {payload[0].payload.upperBound.toFixed(1)}%
            </div>
          )}
          {showTrend && (
            <div className="text-sm text-blue-500">
              Trend: {trend.trend}
              {trend.significance ? ' (Significant)' : ' (Not Significant)'}
            </div>
          )}
        </div>
      </div>
    );
  };

  const metricLabels = {
    engagement: 'Engagement Rate',
    retention: 'Retention Rate',
    conversion: 'Conversion Rate',
    satisfaction: 'Satisfaction Score',
  };

  return (
    <div className="w-full h-[500px] p-4">
      <h2 className="text-xl font-semibold mb-4">
        {metricLabels[metric]} Over Time
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={transformedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Value (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={renderTooltip} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name={metricLabels[metric]}
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
          {showConfidence && (
            <>
              <Line
                type="monotone"
                dataKey="upperBound"
                name="Upper Bound"
                stroke="#82ca9d"
                strokeDasharray="3 3"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="lowerBound"
                name="Lower Bound"
                stroke="#82ca9d"
                strokeDasharray="3 3"
                dot={false}
              />
            </>
          )}
          {showTrend && (
            <Line
              type="monotone"
              dataKey="trendValue"
              name="Trend"
              stroke="#ff7300"
              strokeDasharray="5 5"
              dot={false}
            />
          )}
          <ReferenceLine y={0} stroke="#666" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeComparison; 