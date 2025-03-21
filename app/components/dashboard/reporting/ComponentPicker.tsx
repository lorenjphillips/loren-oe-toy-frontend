'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  ReportComponentType,
  ChartType,
  ReportComponentConfig,
  ChartComponentConfig,
  TextComponentConfig,
  MetricCardConfig,
} from '../../../services/reporting/ReportDefinition';

interface ComponentPickerProps {
  onSelect: (component: ReportComponentConfig) => void;
  onClose: () => void;
}

// Data source options for components
const DATA_SOURCES = [
  { id: 'salesData', name: 'Sales Data' },
  { id: 'marketShare', name: 'Market Share Analysis' },
  { id: 'productPerformance', name: 'Product Performance' },
  { id: 'customerSegmentation', name: 'Customer Segmentation' },
  { id: 'geographicDistribution', name: 'Geographic Distribution' },
  { id: 'campaignPerformance', name: 'Campaign Performance' },
  { id: 'timeSeriesAnalysis', name: 'Time Series Analysis' },
  { id: 'competitorAnalysis', name: 'Competitor Analysis' },
  { id: 'prescriptionTrends', name: 'Prescription Trends' },
  { id: 'patientDemographics', name: 'Patient Demographics' },
  { id: 'hcpEngagement', name: 'HCP Engagement Metrics' },
];

// Component templates
const COMPONENT_TEMPLATES: {
  [key in ReportComponentType]?: Partial<ReportComponentConfig>[];
} = {
  [ReportComponentType.Chart]: [
    {
      title: 'Sales Trend Chart',
      type: ReportComponentType.Chart,
      dataSource: 'salesData',
      chartType: ChartType.Line,
      settings: {
        showLegend: true,
        animate: true,
      },
    },
    {
      title: 'Market Share Pie Chart',
      type: ReportComponentType.Chart,
      dataSource: 'marketShare',
      chartType: ChartType.Pie,
      settings: {
        showLegend: true,
        donut: true,
      },
    },
    {
      title: 'Product Comparison Bar Chart',
      type: ReportComponentType.Chart,
      dataSource: 'productPerformance',
      chartType: ChartType.Bar,
      settings: {
        stacked: false,
        horizontal: false,
      },
    },
  ],
  [ReportComponentType.Table]: [
    {
      title: 'Performance Data Table',
      type: ReportComponentType.Table,
      dataSource: 'productPerformance',
      settings: {
        pagination: true,
        search: true,
        sortable: true,
      },
    },
    {
      title: 'Competitor Analysis Table',
      type: ReportComponentType.Table,
      dataSource: 'competitorAnalysis',
      settings: {
        pagination: true,
        search: true,
        striped: true,
      },
    },
  ],
  [ReportComponentType.MetricCard]: [
    {
      title: 'Total Revenue',
      type: ReportComponentType.MetricCard,
      dataSource: 'salesData',
      metric: 'totalRevenue',
      format: '$#,###',
      settings: {
        showIcon: true,
        showChange: true,
      },
    },
    {
      title: 'Market Share',
      type: ReportComponentType.MetricCard,
      dataSource: 'marketShare',
      metric: 'percentShare',
      format: '#.##%',
      settings: {
        showIcon: true,
        showChange: true,
      },
    },
    {
      title: 'Prescription Count',
      type: ReportComponentType.MetricCard,
      dataSource: 'prescriptionTrends',
      metric: 'totalPrescriptions',
      format: '#,###',
      settings: {
        showIcon: true,
        showChange: true,
      },
    },
  ],
  [ReportComponentType.Text]: [
    {
      title: 'Analysis Summary',
      type: ReportComponentType.Text,
      dataSource: 'marketShare',
      content: '# Market Analysis\n\nThis section provides a detailed analysis of current market conditions.',
      markdown: true,
    },
    {
      title: 'Recommendations',
      type: ReportComponentType.Text,
      dataSource: 'productPerformance',
      content: '# Strategic Recommendations\n\nBased on the data, we recommend the following actions.',
      markdown: true,
    },
  ],
  [ReportComponentType.ComparisonTable]: [
    {
      title: 'Competitor Comparison',
      type: ReportComponentType.ComparisonTable,
      dataSource: 'competitorAnalysis',
      settings: {
        highlightWinner: true,
        showDifference: true,
      },
    },
  ],
  [ReportComponentType.TimeseriesChart]: [
    {
      title: 'Sales Trends Over Time',
      type: ReportComponentType.TimeseriesChart,
      dataSource: 'timeSeriesAnalysis',
      settings: {
        showRangeSelector: true,
        smoothLine: true,
      },
    },
  ],
  [ReportComponentType.HeatMap]: [
    {
      title: 'Regional Performance Heatmap',
      type: ReportComponentType.HeatMap,
      dataSource: 'geographicDistribution',
      settings: {
        colorScale: 'sequential',
        legendPosition: 'right',
      },
    },
  ],
};

// Available component types to display
const AVAILABLE_COMPONENTS = [
  { type: ReportComponentType.Chart, label: 'Chart', icon: '📊' },
  { type: ReportComponentType.Table, label: 'Table', icon: '🧾' },
  { type: ReportComponentType.MetricCard, label: 'Metric Card', icon: '📈' },
  { type: ReportComponentType.Text, label: 'Text Block', icon: '📝' },
  { type: ReportComponentType.ComparisonTable, label: 'Comparison Table', icon: '⚖️' },
  { type: ReportComponentType.TimeseriesChart, label: 'Time Series Chart', icon: '📅' },
  { type: ReportComponentType.HeatMap, label: 'Heat Map', icon: '🔥' },
];

const ComponentPicker: React.FC<ComponentPickerProps> = ({ onSelect, onClose }) => {
  const [selectedType, setSelectedType] = useState<ReportComponentType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState('');

  const handleSelectComponent = () => {
    if (!selectedType || selectedTemplate === null) return;

    const template = COMPONENT_TEMPLATES[selectedType]?.[selectedTemplate];
    if (!template) return;

    const componentConfig: ReportComponentConfig = {
      id: uuidv4(),
      title: customTitle || template.title || 'New Component',
      type: selectedType,
      dataSource: selectedDataSource || template.dataSource || '',
      settings: template.settings || {},
      ...(template as any), // Include any other template properties
    };

    onSelect(componentConfig);
  };

  const renderTemplateOptions = () => {
    if (!selectedType) return null;

    const templates = COMPONENT_TEMPLATES[selectedType] || [];

    return (
      <div className="grid grid-cols-2 gap-3">
        {templates.map((template, index) => (
          <div
            key={index}
            className={`border rounded p-3 cursor-pointer ${
              selectedTemplate === index ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => {
              setSelectedTemplate(index);
              setCustomTitle(template.title || '');
              setSelectedDataSource(template.dataSource || '');
            }}
          >
            <h3 className="font-semibold">{template.title}</h3>
            <div className="text-sm text-gray-500">{template.dataSource}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderCustomizationOptions = () => {
    if (selectedTemplate === null || !selectedType) return null;

    const template = COMPONENT_TEMPLATES[selectedType]?.[selectedTemplate];
    if (!template) return null;

    return (
      <div className="space-y-4 mt-4">
        <h3 className="font-semibold">Customize Component</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Component Title</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Enter component title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
          <select
            className="w-full border rounded p-2"
            value={selectedDataSource}
            onChange={(e) => setSelectedDataSource(e.target.value)}
          >
            <option value="">Select a data source</option>
            {DATA_SOURCES.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add Component</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Component Type</h3>
        <div className="grid grid-cols-3 gap-3">
          {AVAILABLE_COMPONENTS.map((component) => (
            <div
              key={component.type}
              className={`border rounded p-3 cursor-pointer text-center ${
                selectedType === component.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                setSelectedType(component.type);
                setSelectedTemplate(null);
              }}
            >
              <div className="text-2xl mb-1">{component.icon}</div>
              <div className="font-medium">{component.label}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedType && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Select Template</h3>
          {renderTemplateOptions()}
        </div>
      )}

      {renderCustomizationOptions()}

      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSelectComponent}
          disabled={selectedTemplate === null || !customTitle || !selectedDataSource}
          className={`px-4 py-2 rounded ${
            selectedTemplate !== null && customTitle && selectedDataSource
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Add Component
        </button>
      </div>
    </div>
  );
};

export default ComponentPicker; 