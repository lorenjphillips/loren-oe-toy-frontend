import React from 'react';
import { IntentBreakdown } from '../../../types/analytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import type { TooltipProps } from 'recharts';

interface IntentAnalysisProps {
  data: IntentBreakdown[];
  viewType?: 'bar' | 'radar';
}

const COLORS = {
  diagnosis: '#0088FE',
  treatment: '#00C49F',
  mechanism: '#FFBB28',
  monitoring: '#FF8042',
  prevention: '#8884D8',
  prognosis: '#82CA9D'
};

export const IntentAnalysis: React.FC<IntentAnalysisProps> = ({
  data,
  viewType = 'bar'
}) => {
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="intent"
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
        />
        <YAxis />
        <Tooltip
          content={({ active, payload }: TooltipProps<number, string>) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as IntentBreakdown;
              return (
                <div className="bg-white p-4 rounded shadow">
                  <p className="font-bold">{data.intent}</p>
                  <p>Count: {data.count}</p>
                  <p>Percentage: {data.percentage.toFixed(1)}%</p>
                  {data.commonConcepts.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Common Concepts:</p>
                      <ul className="list-disc pl-4">
                        {data.commonConcepts.map((concept, i: number) => (
                          <li key={i}>{concept}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Bar
          dataKey="count"
          name="Question Count"
          fill="#0088FE"
          shape={(props: any) => {
            const { x, y, width, height, intent } = props;
            return (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={COLORS[intent as keyof typeof COLORS] || '#0088FE'}
              />
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="intent" />
        <PolarRadiusAxis />
        <Tooltip
          content={({ active, payload }: TooltipProps<number, string>) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as IntentBreakdown;
              return (
                <div className="bg-white p-4 rounded shadow">
                  <p className="font-bold">{data.intent}</p>
                  <p>Count: {data.count}</p>
                  <p>Percentage: {data.percentage.toFixed(1)}%</p>
                  {data.commonConcepts.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Common Concepts:</p>
                      <ul className="list-disc pl-4">
                        {data.commonConcepts.map((concept, i: number) => (
                          <li key={i}>{concept}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          }}
        />
        <Radar
          name="Question Count"
          dataKey="count"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Clinical Intent Analysis</h2>
      <div className="flex justify-end mb-4">
        <select
          className="border rounded px-3 py-1"
          value={viewType}
          onChange={(e) => {
            // Handle view type change through parent component
            console.log('View type changed:', e.target.value);
          }}
        >
          <option value="bar">Bar Chart</option>
          <option value="radar">Radar Chart</option>
        </select>
      </div>
      {viewType === 'bar' ? renderBarChart() : renderRadarChart()}
    </div>
  );
}; 