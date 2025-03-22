import React from 'react';
import { TopicDistribution as TopicData } from '../../../types/analytics';
import type {
  TooltipProps,
  PieLabelRenderProps
} from 'recharts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface TopicDistributionProps {
  data: TopicData[];
  viewType?: 'bar' | 'pie';
  showSubTopics?: boolean;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#F06292', '#BA68C8', '#4DB6AC', '#FFB74D'
];

export const TopicDistribution: React.FC<TopicDistributionProps> = ({
  data,
  viewType = 'bar',
  showSubTopics = true
}) => {
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="category"
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
        />
        <YAxis />
        <Tooltip
          content={({ active, payload }: TooltipProps<number, string>) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as TopicData;
              return (
                <div className="bg-white p-4 rounded shadow">
                  <p className="font-bold">{data.category}</p>
                  <p>Count: {data.count}</p>
                  <p>Percentage: {data.percentage.toFixed(1)}%</p>
                  {showSubTopics && data.subTopics.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Top Sub-topics:</p>
                      <ul className="list-disc pl-4">
                        {data.subTopics.slice(0, 3).map((topic, i: number) => (
                          <li key={i}>{topic.term} ({topic.count})</li>
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
        <Bar dataKey="count" fill="#0088FE" name="Question Count" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={150}
          fill="#8884d8"
          label={(props: PieLabelRenderProps) => {
            const {
              cx = 0,
              cy = 0,
              midAngle = 0,
              innerRadius = 0,
              outerRadius = 0,
              percent = 0,
              name = ''
            } = props;
            
            const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
            const x = Number(cx) + radius * Math.cos(-Number(midAngle) * (Math.PI / 180));
            const y = Number(cy) + radius * Math.sin(-Number(midAngle) * (Math.PI / 180));
            
            return (
              <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > Number(cx) ? 'start' : 'end'}
                dominantBaseline="central"
              >
                {`${name} (${(Number(percent) * 100).toFixed(1)}%)`}
              </text>
            );
          }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }: TooltipProps<number, string>) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as TopicData;
              return (
                <div className="bg-white p-4 rounded shadow">
                  <p className="font-bold">{data.category}</p>
                  <p>Count: {data.count}</p>
                  <p>Percentage: {data.percentage.toFixed(1)}%</p>
                  {showSubTopics && data.subTopics.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Top Sub-topics:</p>
                      <ul className="list-disc pl-4">
                        {data.subTopics.slice(0, 3).map((topic, i: number) => (
                          <li key={i}>{topic.term} ({topic.count})</li>
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
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Medical Topic Distribution</h2>
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
          <option value="pie">Pie Chart</option>
        </select>
      </div>
      {viewType === 'bar' ? renderBarChart() : renderPieChart()}
    </div>
  );
}; 