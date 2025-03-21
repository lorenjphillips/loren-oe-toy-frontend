'use client';

import React, { useState, useEffect } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts';
import { AnalyticsEvent, AnalyticsEventType } from '../../services/analytics';
import AnalyticsSerializer from '../../services/analyticsSerializer';

// Mock data for analytics dashboard
const mockAdFormatEngagementData = [
  { name: 'Knowledge Graph', impressions: 1200, clicks: 320, avgDuration: 45 },
  { name: 'Microsimulation', impressions: 850, clicks: 410, avgDuration: 120 },
  { name: 'Interactive Video', impressions: 720, clicks: 210, avgDuration: 60 },
  { name: 'Mini Quiz', impressions: 950, clicks: 380, avgDuration: 35 },
  { name: 'Decision Tree', impressions: 680, clicks: 220, avgDuration: 90 }
];

const mockPharmaPerformanceData = [
  { name: 'Cardio Pharma Corp', engagementRate: 37, completionRate: 62, conversionRate: 18 },
  { name: 'NeuroPharma Inc', engagementRate: 42, completionRate: 68, conversionRate: 22 },
  { name: 'Oncology Solutions', engagementRate: 51, completionRate: 73, conversionRate: 29 },
  { name: 'MetabolicRx', engagementRate: 33, completionRate: 58, conversionRate: 15 },
  { name: 'ImmunoTherapeutics', engagementRate: 45, completionRate: 71, conversionRate: 24 }
];

const mockInteractionPatternData = [
  { name: 'Node Exploration', value: 35 },
  { name: 'Treatment Focus', value: 25 },
  { name: 'Relationship Analysis', value: 20 },
  { name: 'Education Content', value: 15 },
  { name: 'Decision Pathways', value: 5 }
];

const mockTimeSeriesData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  knowledgeGraph: Math.floor(Math.random() * 100) + 50,
  microsimulation: Math.floor(Math.random() * 120) + 30,
  interactiveVideo: Math.floor(Math.random() * 80) + 40
}));

const mockContentEffectivenessData = [
  { format: 'Knowledge Graph', cardiology: 82, oncology: 75, neurology: 88, endocrinology: 67 },
  { format: 'Microsimulation', cardiology: 65, oncology: 92, neurology: 72, endocrinology: 81 },
  { format: 'Interactive Video', cardiology: 78, oncology: 69, neurology: 61, endocrinology: 74 },
  { format: 'Mini Quiz', cardiology: 91, oncology: 83, neurology: 79, endocrinology: 88 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

interface AnalyticsDashboardProps {
  analyticsEvents?: AnalyticsEvent[];
  refreshInterval?: number; // in seconds
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analyticsEvents = [],
  refreshInterval = 60
}) => {
  const [activeTab, setActiveTab] = useState('engagement');
  const [timeframe, setTimeframe] = useState('30d');
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  
  // Simulate fetching analytics events
  useEffect(() => {
    // In a real implementation, we would fetch real analytics data
    // For now, we'll just use the mock data and props
    setEvents(analyticsEvents);
    
    // Set up refresh interval
    const intervalId = setInterval(() => {
      // Fetch updated analytics data
      console.log('Refreshing analytics data...');
    }, refreshInterval * 1000);
    
    return () => clearInterval(intervalId);
  }, [analyticsEvents, refreshInterval]);
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      {/* Dashboard Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'engagement' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('engagement')}
          >
            Engagement Metrics
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'performance' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance Comparisons
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'interactions' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('interactions')}
          >
            Physician Interactions
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'effectiveness' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('effectiveness')}
          >
            Content Effectiveness
          </button>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <button className="px-4 py-2 bg-gray-200 rounded-md">
            Export Data
          </button>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="space-y-8">
        {/* Engagement Metrics Tab */}
        {activeTab === 'engagement' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Ad Format Engagement</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={mockAdFormatEngagementData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="impressions" fill="#8884d8" name="Impressions" />
                    <Bar dataKey="clicks" fill="#82ca9d" name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Average Engagement Duration (seconds)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={mockAdFormatEngagementData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgDuration" fill="#ff7300" name="Duration (seconds)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Engagement Trends Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={mockTimeSeriesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Engagement Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="knowledgeGraph" stroke="#8884d8" name="Knowledge Graph" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="microsimulation" stroke="#82ca9d" name="Microsimulation" />
                  <Line type="monotone" dataKey="interactiveVideo" stroke="#ffc658" name="Interactive Video" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        
        {/* Performance Comparisons Tab */}
        {activeTab === 'performance' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Pharma Company Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={mockPharmaPerformanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="engagementRate" fill="#8884d8" name="Engagement Rate (%)" />
                    <Bar dataKey="completionRate" fill="#82ca9d" name="Completion Rate (%)" />
                    <Bar dataKey="conversionRate" fill="#ffc658" name="Conversion Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Performance by Ad Format and Medical Specialty</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={mockContentEffectivenessData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="format" />
                    <YAxis label={{ value: 'Effectiveness Score', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="cardiology" stackId="1" fill="#8884d8" stroke="#8884d8" name="Cardiology" />
                    <Area type="monotone" dataKey="oncology" stackId="1" fill="#82ca9d" stroke="#82ca9d" name="Oncology" />
                    <Area type="monotone" dataKey="neurology" stackId="1" fill="#ffc658" stroke="#ffc658" name="Neurology" />
                    <Area type="monotone" dataKey="endocrinology" stackId="1" fill="#ff8042" stroke="#ff8042" name="Endocrinology" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Format Effectiveness by Category</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Format</th>
                      <th className="py-2 px-4 border-b">Cardiology</th>
                      <th className="py-2 px-4 border-b">Oncology</th>
                      <th className="py-2 px-4 border-b">Neurology</th>
                      <th className="py-2 px-4 border-b">Endocrinology</th>
                      <th className="py-2 px-4 border-b">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockContentEffectivenessData.map((item, index) => {
                      const avg = (item.cardiology + item.oncology + item.neurology + item.endocrinology) / 4;
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2 px-4 border-b font-medium">{item.format}</td>
                          <td className="py-2 px-4 border-b">{item.cardiology}%</td>
                          <td className="py-2 px-4 border-b">{item.oncology}%</td>
                          <td className="py-2 px-4 border-b">{item.neurology}%</td>
                          <td className="py-2 px-4 border-b">{item.endocrinology}%</td>
                          <td className="py-2 px-4 border-b font-semibold">{avg.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
        {/* Physician Interactions Tab */}
        {activeTab === 'interactions' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Interaction Pattern Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockInteractionPatternData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockInteractionPatternData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value}%`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">HIPAA Compliant Analysis</h3>
                <p className="mb-4 text-sm text-gray-600">
                  All physician interaction data is anonymized and aggregated to maintain HIPAA compliance.
                  No personally identifiable information is collected or stored.
                </p>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Microsimulation Engagement</h4>
                    <p className="text-sm text-gray-600">Physicians engage most with cardiology and oncology microsimulations, averaging 2.3 minutes per session.</p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">Knowledge Graph Navigation</h4>
                    <p className="text-sm text-gray-600">Most frequent pattern is exploring treatment relationships, focusing on efficacy comparisons.</p>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-medium">Content Consumption</h4>
                    <p className="text-sm text-gray-600">Educational content is viewed 42% longer when presented in interactive format vs. static content.</p>
                  </div>
                  
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-medium">Decision Points</h4>
                    <p className="text-sm text-gray-600">Users spend 35% more time on decision points that include comparative efficacy data.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Interaction Heat Map by Specialty</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Interaction Type</th>
                      <th className="py-2 px-4 border-b">Cardiology</th>
                      <th className="py-2 px-4 border-b">Oncology</th>
                      <th className="py-2 px-4 border-b">Neurology</th>
                      <th className="py-2 px-4 border-b">Endocrinology</th>
                      <th className="py-2 px-4 border-b">General Practice</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b font-medium">Knowledge Exploration</td>
                      <td className="py-2 px-4 border-b bg-green-100">High</td>
                      <td className="py-2 px-4 border-b bg-green-200">Very High</td>
                      <td className="py-2 px-4 border-b bg-green-100">High</td>
                      <td className="py-2 px-4 border-b bg-yellow-100">Medium</td>
                      <td className="py-2 px-4 border-b bg-yellow-100">Medium</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">Treatment Comparison</td>
                      <td className="py-2 px-4 border-b bg-green-200">Very High</td>
                      <td className="py-2 px-4 border-b bg-green-100">High</td>
                      <td className="py-2 px-4 border-b bg-yellow-100">Medium</td>
                      <td className="py-2 px-4 border-b bg-green-100">High</td>
                      <td className="py-2 px-4 border-b bg-red-100">Low</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b font-medium">Educational Content</td>
                      <td className="py-2 px-4 border-b bg-yellow-100">Medium</td>
                      <td className="py-2 px-4 border-b bg-green-100">High</td>
                      <td className="py-2 px-4 border-b bg-green-200">Very High</td>
                      <td className="py-2 px-4 border-b bg-yellow-100">Medium</td>
                      <td className="py-2 px-4 border-b bg-green-100">High</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">Decision Simulation</td>
                      <td className="py-2 px-4 border-b bg-green-100">High</td>
                      <td className="py-2 px-4 border-b bg-green-200">Very High</td>
                      <td className="py-2 px-4 border-b bg-green-100">High</td>
                      <td className="py-2 px-4 border-b bg-green-100">High</td>
                      <td className="py-2 px-4 border-b bg-yellow-100">Medium</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-2 px-4 border-b font-medium">Clinical Study Review</td>
                      <td className="py-2 px-4 border-b bg-green-200">Very High</td>
                      <td className="py-2 px-4 border-b bg-green-200">Very High</td>
                      <td className="py-2 px-4 border-b bg-green-100">High</td>
                      <td className="py-2 px-4 border-b bg-green-100">High</td>
                      <td className="py-2 px-4 border-b bg-red-100">Low</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
        {/* Content Effectiveness Tab */}
        {activeTab === 'effectiveness' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Format Effectiveness by Medical Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={mockContentEffectivenessData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="format" />
                    <YAxis label={{ value: 'Effectiveness Score', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cardiology" fill="#8884d8" name="Cardiology" />
                    <Bar dataKey="oncology" fill="#82ca9d" name="Oncology" />
                    <Bar dataKey="neurology" fill="#ffc658" name="Neurology" />
                    <Bar dataKey="endocrinology" fill="#ff8042" name="Endocrinology" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Completion Rates by Format</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={mockAdFormatEngagementData.map(item => ({
                      name: item.name,
                      completionRate: (item.clicks / item.impressions) * 100
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Completion Rate']} />
                    <Line type="monotone" dataKey="completionRate" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Content Effectiveness Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="font-medium text-lg mb-2">Top Performing Format</h4>
                  <div className="text-4xl font-bold text-blue-600 mb-2">Microsimulation</div>
                  <p className="text-sm text-gray-600">For Oncology Topics</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-green-600 font-semibold">+24%</span>
                    <span className="ml-2 text-sm text-gray-600">vs. Industry Average</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="font-medium text-lg mb-2">Highest Engagement</h4>
                  <div className="text-4xl font-bold text-green-600 mb-2">Knowledge Graph</div>
                  <p className="text-sm text-gray-600">For Neurology Topics</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-green-600 font-semibold">+17%</span>
                    <span className="ml-2 text-sm text-gray-600">vs. Previous Quarter</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded shadow">
                  <h4 className="font-medium text-lg mb-2">Best ROI Format</h4>
                  <div className="text-4xl font-bold text-purple-600 mb-2">Mini Quiz</div>
                  <p className="text-sm text-gray-600">Across All Categories</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-green-600 font-semibold">3.2x</span>
                    <span className="ml-2 text-sm text-gray-600">Return on Ad Spend</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-green-500 rounded-full p-1 mr-3 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Increase microsimulation content for oncology</span>
                    <p className="text-sm text-gray-600">Highest engagement and completion rates observed for this combination.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-500 rounded-full p-1 mr-3 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Optimize knowledge graph interactions for cardiology</span>
                    <p className="text-sm text-gray-600">Focus on treatment comparisons which show highest physician engagement.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-500 rounded-full p-1 mr-3 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Expand mini quiz format across all specialties</span>
                    <p className="text-sm text-gray-600">Best ROI and consistent performance across different medical categories.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-green-500 rounded-full p-1 mr-3 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Redesign interactive video format for neurology</span>
                    <p className="text-sm text-gray-600">Currently underperforming compared to other formats in this specialty.</p>
                  </div>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>All analytics data is anonymized and compliant with HIPAA regulations. No personally identifiable information is collected or stored.</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 