import { v4 as uuidv4 } from 'uuid';
import {
  ReportDefinition,
  ReportComponentType,
  ChartType,
  DataFilterType,
} from '../../services/reporting/ReportDefinition';

const categoryPerformanceTemplate: ReportDefinition = {
  id: 'category-performance',
  name: 'Category Performance Report',
  description: 'Comprehensive analysis of pharmaceutical category performance',
  author: 'System',
  createdAt: new Date(),
  updatedAt: new Date(),
  sections: [
    {
      id: uuidv4(),
      title: 'Executive Summary',
      description: 'Key performance metrics for the selected pharmaceutical categories',
      components: [
        {
          id: uuidv4(),
          type: ReportComponentType.Text,
          title: 'Overview',
          dataSource: 'marketShare',
          description: 'Summary of the category performance analysis',
          settings: {
            markdown: true,
          },
        },
        {
          id: uuidv4(),
          type: ReportComponentType.MetricCard,
          title: 'Total Revenue',
          dataSource: 'salesData',
          description: 'Total revenue across all selected categories',
          settings: {
            format: '$#,###',
            showChange: true,
            comparisonPeriod: 'previous',
          },
        },
        {
          id: uuidv4(),
          type: ReportComponentType.MetricCard,
          title: 'Market Share',
          dataSource: 'marketShare',
          description: 'Overall market share percentage',
          settings: {
            format: '#.##%',
            showChange: true,
            comparisonPeriod: 'previous',
          },
        },
        {
          id: uuidv4(),
          type: ReportComponentType.MetricCard,
          title: 'Growth Rate',
          dataSource: 'salesData',
          description: 'Year-over-year growth rate',
          settings: {
            format: '+#.##%',
            showChange: true,
            comparisonPeriod: 'previous',
          },
        },
      ],
    },
    {
      id: uuidv4(),
      title: 'Category Breakdown',
      description: 'Detailed breakdown of performance by category',
      components: [
        {
          id: uuidv4(),
          type: ReportComponentType.Chart,
          title: 'Revenue by Category',
          dataSource: 'salesData',
          description: 'Revenue distribution across categories',
          settings: {
            chartType: ChartType.Bar,
            xAxis: 'category',
            yAxis: 'revenue',
            showLegend: true,
            colors: ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#9013FE'],
          },
        },
        {
          id: uuidv4(),
          type: ReportComponentType.Chart,
          title: 'Market Share Distribution',
          dataSource: 'marketShare',
          description: 'Market share percentage by category',
          settings: {
            chartType: ChartType.Pie,
            showLegend: true,
            donut: true,
            colors: ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#9013FE'],
          },
        },
        {
          id: uuidv4(),
          type: ReportComponentType.Table,
          title: 'Category Performance Table',
          dataSource: 'productPerformance',
          description: 'Detailed metrics for each category',
          settings: {
            pagination: true,
            search: true,
            sortable: true,
            columns: [
              { field: 'category', header: 'Category' },
              { field: 'revenue', header: 'Revenue', format: '$#,###' },
              { field: 'marketShare', header: 'Market Share', format: '#.##%' },
              { field: 'growth', header: 'YoY Growth', format: '+#.##%' },
              { field: 'prescriptions', header: 'Prescriptions', format: '#,###' },
            ],
          },
        },
      ],
    },
    {
      id: uuidv4(),
      title: 'Trend Analysis',
      description: 'Analysis of trends over time for selected categories',
      components: [
        {
          id: uuidv4(),
          type: ReportComponentType.TimeseriesChart,
          title: 'Revenue Trends',
          dataSource: 'timeSeriesAnalysis',
          description: 'Revenue trends over the selected time period',
          settings: {
            chartType: ChartType.Line,
            xAxis: 'date',
            yAxis: 'revenue',
            showLegend: true,
            colors: ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#9013FE'],
            smoothLine: true,
          },
        },
        {
          id: uuidv4(),
          type: ReportComponentType.TimeseriesChart,
          title: 'Prescription Volume Trends',
          dataSource: 'prescriptionTrends',
          description: 'Prescription volume trends over the selected time period',
          settings: {
            chartType: ChartType.Line,
            xAxis: 'date',
            yAxis: 'prescriptions',
            showLegend: true,
            colors: ['#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#9013FE'],
            smoothLine: true,
          },
        },
        {
          id: uuidv4(),
          type: ReportComponentType.HeatMap,
          title: 'Category Performance Heatmap',
          dataSource: 'geographicDistribution',
          description: 'Geographic distribution of category performance',
          settings: {
            colorScale: 'sequential',
            legendPosition: 'right',
          },
        },
      ],
    },
    {
      id: uuidv4(),
      title: 'Competitive Analysis',
      description: 'Comparison with competitors in the same categories',
      components: [
        {
          id: uuidv4(),
          type: ReportComponentType.ComparisonTable,
          title: 'Competitor Comparison',
          dataSource: 'competitorAnalysis',
          description: 'Head-to-head comparison with key competitors',
          settings: {
            highlightWinner: true,
            showDifference: true,
            columns: [
              { field: 'metric', header: 'Metric' },
              { field: 'ourValue', header: 'Our Value' },
              { field: 'competitorValue', header: 'Competitor Value' },
              { field: 'difference', header: 'Difference' },
            ],
          },
        },
        {
          id: uuidv4(),
          type: ReportComponentType.Chart,
          title: 'Market Share Comparison',
          dataSource: 'marketShare',
          description: 'Market share comparison with competitors',
          settings: {
            chartType: ChartType.Bar,
            xAxis: 'competitor',
            yAxis: 'marketShare',
            showLegend: true,
            stacked: false,
            horizontal: true,
            colors: ['#4A90E2', '#50E3C2', '#F5A623'],
          },
        },
        {
          id: uuidv4(),
          type: ReportComponentType.Text,
          title: 'Competitive Analysis Summary',
          dataSource: 'competitorAnalysis',
          description: 'Summary of competitive position',
          settings: {
            markdown: true,
          },
        },
      ],
    },
  ],
  filters: [
    {
      type: DataFilterType.Category,
      field: 'productCategory',
      operator: 'equals',
      value: 'all',
      label: 'Product Category',
    },
    {
      type: DataFilterType.DateRange,
      field: 'reportDate',
      operator: 'last 90 days',
      value: '',
      label: 'Time Period',
    },
    {
      type: DataFilterType.ComparisonType,
      field: 'vsLastPeriod',
      operator: 'is true',
      value: true,
      label: 'Compare with Previous Period',
    },
  ],
  branding: {
    logo: '/assets/logo.png',
    primaryColor: '#0066CC',
    secondaryColor: '#F5A623',
    fontFamily: 'Arial, sans-serif',
  },
};

export default categoryPerformanceTemplate; 