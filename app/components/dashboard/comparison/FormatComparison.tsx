import React, { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ComparisonService, CategoryMetrics } from '../../../services/analytics/comparison';

interface FormatComparisonProps {
  microsimulationData: CategoryMetrics;
  knowledgeGraphData: CategoryMetrics;
  showConfidence?: boolean;
}

const FormatComparison: React.FC<FormatComparisonProps> = ({
  microsimulationData,
  knowledgeGraphData,
  showConfidence = true,
}) => {
  const comparisonService = useMemo(() => new ComparisonService(), []);

  const normalizedData = useMemo(() => {
    const metrics = comparisonService.normalizeMetrics([
      microsimulationData.engagement,
      microsimulationData.retention,
      microsimulationData.conversion,
      microsimulationData.satisfaction,
      knowledgeGraphData.engagement,
      knowledgeGraphData.retention,
      knowledgeGraphData.conversion,
      knowledgeGraphData.satisfaction,
    ]);

    return [
      {
        metric: 'Engagement',
        microsimulation: metrics[0].value * 100,
        knowledgeGraph: metrics[4].value * 100,
        microsimulationConfidence: metrics[0].confidence,
        knowledgeGraphConfidence: metrics[4].confidence,
      },
      {
        metric: 'Retention',
        microsimulation: metrics[1].value * 100,
        knowledgeGraph: metrics[5].value * 100,
        microsimulationConfidence: metrics[1].confidence,
        knowledgeGraphConfidence: metrics[5].confidence,
      },
      {
        metric: 'Conversion',
        microsimulation: metrics[2].value * 100,
        knowledgeGraph: metrics[6].value * 100,
        microsimulationConfidence: metrics[2].confidence,
        knowledgeGraphConfidence: metrics[6].confidence,
      },
      {
        metric: 'Satisfaction',
        microsimulation: metrics[3].value * 100,
        knowledgeGraph: metrics[7].value * 100,
        microsimulationConfidence: metrics[3].confidence,
        knowledgeGraphConfidence: metrics[7].confidence,
      },
    ];
  }, [microsimulationData, knowledgeGraphData, comparisonService]);

  const renderTooltipContent = ({ active, payload, label }: any) => {
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
              {entry.name === 'microsimulation' ? 'Microsimulation' : 'Knowledge Graph'}:{' '}
              {entry.value.toFixed(1)}%
            </span>
            {showConfidence && (
              <span className="text-sm text-gray-500">
                (±{(entry.payload[`${entry.name}Confidence`] * 100).toFixed(1)}%)
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
        Format Performance Comparison
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={normalizedData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Microsimulation"
            dataKey="microsimulation"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Radar
            name="Knowledge Graph"
            dataKey="knowledgeGraph"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.6}
          />
          <Tooltip content={renderTooltipContent} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FormatComparison; 