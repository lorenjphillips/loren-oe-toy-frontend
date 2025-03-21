import React from 'react';
import { DemographicSummary } from '../../../types/analytics';
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
import type { TooltipProps } from 'recharts';

interface DemographicContextProps {
  data: DemographicSummary;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#F06292', '#BA68C8', '#4DB6AC', '#FFB74D'
];

export const DemographicContext: React.FC<DemographicContextProps> = ({ data }) => {
  const ageGroupData = Object.entries(data.ageGroups).map(([group, count]) => ({
    group,
    count
  }));

  const genderData = Object.entries(data.genderDistribution).map(([gender, count]) => ({
    gender,
    count
  }));

  const renderAgeGroupChart = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Age Group Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={ageGroupData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="group"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis />
          <Tooltip
            content={({ active, payload }: TooltipProps<number, string>) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as { group: string; count: number };
                return (
                  <div className="bg-white p-4 rounded shadow">
                    <p className="font-bold">{data.group}</p>
                    <p>Count: {data.count}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#0088FE" name="Patient Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderGenderDistribution = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={genderData}
            dataKey="count"
            nameKey="gender"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
          >
            {genderData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }: TooltipProps<number, string>) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as { gender: string; count: number };
                return (
                  <div className="bg-white p-4 rounded shadow">
                    <p className="font-bold">{data.gender}</p>
                    <p>Count: {data.count}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderComorbidities = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Common Comorbidities</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data.commonComorbidities}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="condition"
            type="category"
            width={150}
          />
          <Tooltip
            content={({ active, payload }: TooltipProps<number, string>) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-4 rounded shadow">
                    <p className="font-bold">{data.condition}</p>
                    <p>Count: {data.count}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#00C49F" name="Occurrence Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderRiskFactors = () => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Risk Factors</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data.riskFactors}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="factor"
            type="category"
            width={150}
          />
          <Tooltip
            content={({ active, payload }: TooltipProps<number, string>) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-4 rounded shadow">
                    <p className="font-bold">{data.factor}</p>
                    <p>Count: {data.count}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#FFBB28" name="Occurrence Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Patient Demographic Context</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderAgeGroupChart()}
        {renderGenderDistribution()}
        {renderComorbidities()}
        {renderRiskFactors()}
      </div>
    </div>
  );
}; 