import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ErrorBar,
} from 'recharts';
import { ComparisonService, CategoryMetrics, MetricComparisonResult } from '../../../services/analytics/comparison';

interface BenchmarkData {
  category: string;
  benchmarks: CategoryMetrics;
  confidenceInterval: {
    engagement: [number, number];
    retention: [number, number];
    conversion: [number, number];
    satisfaction: [number, number];
  };
}

interface BenchmarkComparisonProps {
  currentData: CategoryMetrics;
  industryBenchmarks: BenchmarkData[];
  showConfidence?: boolean;
}

const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({
  currentData,
  industryBenchmarks,
  showConfidence = true,
}) => {
  const comparisonService = useMemo(() => new ComparisonService(), []);

  const transformedData = useMemo(() => {
    return industryBenchmarks.map(benchmark => {
      const comparisonResults = {
        engagement: comparisonService.calculateRelativePerformance(
          benchmark.benchmarks.engagement,
          currentData.engagement
        ),
        retention: comparisonService.calculateRelativePerformance(
          benchmark.benchmarks.retention,
          currentData.retention
        ),
        conversion: comparisonService.calculateRelativePerformance(
          benchmark.benchmarks.conversion,
          currentData.conversion
        ),
        satisfaction: comparisonService.calculateRelativePerformance(
          benchmark.benchmarks.satisfaction,
          currentData.satisfaction
        ),
      };

      return {
        category: benchmark.category,
        engagement: currentData.engagement.value * 100,
        engagementBenchmark: benchmark.benchmarks.engagement.value * 100,
        engagementError: [
          benchmark.confidenceInterval.engagement[0] * 100,
          benchmark.confidenceInterval.engagement[1] * 100,
        ],
        retention: currentData.retention.value * 100,
        retentionBenchmark: benchmark.benchmarks.retention.value * 100,
        retentionError: [
          benchmark.confidenceInterval.retention[0] * 100,
          benchmark.confidenceInterval.retention[1] * 100,
        ],
        conversion: currentData.conversion.value * 100,
        conversionBenchmark: benchmark.benchmarks.conversion.value * 100,
        conversionError: [
          benchmark.confidenceInterval.conversion[0] * 100,
          benchmark.confidenceInterval.conversion[1] * 100,
        ],
        satisfaction: currentData.satisfaction.value * 100,
        satisfactionBenchmark: benchmark.benchmarks.satisfaction.value * 100,
        satisfactionError: [
          benchmark.confidenceInterval.satisfaction[0] * 100,
          benchmark.confidenceInterval.satisfaction[1] * 100,
        ],
      };
    });
  }, [currentData, industryBenchmarks, comparisonService]);

  const renderTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-4 rounded shadow-lg border">
        <h3 className="font-semibold mb-2">{label}</h3>
        {payload.map((entry: any) => {
          const isBenchmark = entry.dataKey.includes('Benchmark');
          const metricName = entry.dataKey.replace('Benchmark', '');
          const confidenceInterval = isBenchmark
            ? payload.find((p: any) => p.dataKey === `${metricName}Error`)?.value
            : null;

          return (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">
                {isBenchmark ? 'Industry Benchmark' : 'Your Performance'}: {entry.value.toFixed(1)}%
              </span>
              {showConfidence && confidenceInterval && (
                <span className="text-sm text-gray-500">
                  (CI: {confidenceInterval[0].toFixed(1)}% - {confidenceInterval[1].toFixed(1)}%)
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-[500px] p-4">
      <h2 className="text-xl font-semibold mb-4">
        Performance vs. Industry Benchmarks
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={transformedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis label={{ value: 'Value (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip content={renderTooltip} />
          <Legend />
          
          {/* Engagement */}
          <Bar
            dataKey="engagement"
            name="Engagement"
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="engagementBenchmark"
            name="Engagement Benchmark"
            stroke="#8884d8"
            strokeDasharray="5 5"
          >
            {showConfidence && <ErrorBar dataKey="engagementError" stroke="#8884d8" />}
          </Line>

          {/* Retention */}
          <Bar
            dataKey="retention"
            name="Retention"
            fill="#82ca9d"
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="retentionBenchmark"
            name="Retention Benchmark"
            stroke="#82ca9d"
            strokeDasharray="5 5"
          >
            {showConfidence && <ErrorBar dataKey="retentionError" stroke="#82ca9d" />}
          </Line>

          {/* Conversion */}
          <Bar
            dataKey="conversion"
            name="Conversion"
            fill="#ffc658"
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="conversionBenchmark"
            name="Conversion Benchmark"
            stroke="#ffc658"
            strokeDasharray="5 5"
          >
            {showConfidence && <ErrorBar dataKey="conversionError" stroke="#ffc658" />}
          </Line>

          {/* Satisfaction */}
          <Bar
            dataKey="satisfaction"
            name="Satisfaction"
            fill="#ff7300"
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="satisfactionBenchmark"
            name="Satisfaction Benchmark"
            stroke="#ff7300"
            strokeDasharray="5 5"
          >
            {showConfidence && <ErrorBar dataKey="satisfactionError" stroke="#ff7300" />}
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BenchmarkComparison; 