import React from 'react';
import { TreatmentJourneyStage } from '../../../types/analytics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sankey,
  Scatter,
  ScatterChart
} from 'recharts';
import type { TooltipProps } from 'recharts';

interface TreatmentJourneyMapProps {
  data: TreatmentJourneyStage[];
  viewType?: 'timeline' | 'scatter';
}

const STAGE_COLORS = {
  initial_symptoms: '#0088FE',
  diagnosis: '#00C49F',
  treatment_planning: '#FFBB28',
  active_treatment: '#FF8042',
  monitoring: '#8884D8',
  follow_up: '#82CA9D',
  long_term_management: '#F06292'
};

export const TreatmentJourneyMap: React.FC<TreatmentJourneyMapProps> = ({
  data,
  viewType = 'timeline'
}) => {
  const renderTimeline = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="stage"
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
        />
        <YAxis yAxisId="left" label={{ value: 'Question Count', angle: -90, position: 'insideLeft' }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: 'Avg. Days from Diagnosis', angle: 90, position: 'insideRight' }} />
        <Tooltip
          content={({ active, payload }: TooltipProps<number, string>) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as TreatmentJourneyStage;
              return (
                <div className="bg-white p-4 rounded shadow">
                  <p className="font-bold">{data.stage}</p>
                  <p>Questions: {data.questionCount}</p>
                  <p>Avg. Days from Diagnosis: {data.averageTiming.toFixed(1)}</p>
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
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="questionCount"
          stroke="#0088FE"
          name="Question Count"
          strokeWidth={2}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="averageTiming"
          stroke="#82ca9d"
          name="Avg. Days from Diagnosis"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderScatterPlot = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="averageTiming"
          name="Days from Diagnosis"
          label={{ value: 'Days from Diagnosis', position: 'bottom' }}
        />
        <YAxis
          type="number"
          dataKey="questionCount"
          name="Question Count"
          label={{ value: 'Question Count', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          content={({ active, payload }: TooltipProps<number, string>) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as TreatmentJourneyStage;
              return (
                <div className="bg-white p-4 rounded shadow">
                  <p className="font-bold">{data.stage}</p>
                  <p>Questions: {data.questionCount}</p>
                  <p>Avg. Days from Diagnosis: {data.averageTiming.toFixed(1)}</p>
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
        <Scatter
          name="Treatment Stages"
          data={data}
          fill="#8884d8"
          shape={(props: any) => {
            const { cx, cy, stage } = props;
            return (
              <circle
                cx={cx}
                cy={cy}
                r={10}
                fill={STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || '#8884d8'}
              />
            );
          }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Treatment Journey Analysis</h2>
      <div className="flex justify-end mb-4">
        <select
          className="border rounded px-3 py-1"
          value={viewType}
          onChange={(e) => {
            // Handle view type change through parent component
            console.log('View type changed:', e.target.value);
          }}
        >
          <option value="timeline">Timeline View</option>
          <option value="scatter">Scatter Plot</option>
        </select>
      </div>
      {viewType === 'timeline' ? renderTimeline() : renderScatterPlot()}
    </div>
  );
}; 