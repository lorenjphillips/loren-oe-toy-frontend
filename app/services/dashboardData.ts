/**
 * Dashboard Data Service
 * 
 * Provides the data layer for the pharma insights dashboard,
 * handling data fetching, aggregation, filtering, and transformation.
 */
import * as Analytics from './analytics';
import * as AnalyticsDataStore from './analytics/dataStore';
import { AnalyticsEvent, AnalyticsEventCategory } from '../models/analytics/AnalyticsEvent';
import { AggregateImpressionMetrics, ImpressionContext, ImpressionQuality } from '../models/analytics/ImpressionMetrics';
import { AggregateEngagementMetrics, EngagementType } from '../models/analytics/EngagementMetrics';
import { getCompanyById, MEDICAL_CATEGORY_MAP } from '../data/pharmaCategories';

// Dashboard data request params
export interface DashboardDataRequest {
  dateRange: [Date, Date];
  companyId?: string | null;
  category?: string;
  [key: string]: any; // Additional filters
}

// Dashboard metrics response interface
export interface DashboardMetricsResponse {
  impressions: AggregateImpressionMetrics | null;
  engagements: AggregateEngagementMetrics | null;
}

// Timeseries data point
export interface TimeseriesPoint {
  date: Date;
  value: number;
}

// Timeseries dataset
export interface TimeseriesDataset {
  id: string;
  name: string;
  color: string;
  data: TimeseriesPoint[];
}

// Category metric for breakdown
export interface CategoryMetric {
  category: string;
  displayName: string;
  impressions: number;
  engagements: number;
  engagementRate: number;
  conversionRate: number;
  viewabilityRate: number;
  qualityScore: number;
  change: number; // Percent change vs previous period
}

// Category breakdown response
export interface CategoryBreakdownResponse {
  metrics: CategoryMetric[];
  topPerforming: string;
  mostImproved: string;
  totalImpressions: number;
  totalEngagements: number;
}

// Engagement node for flow visualization
export interface EngagementNode {
  id: string;
  name: string;
  value: number;
  type: string;
}

// Engagement link for flow visualization
export interface EngagementLink {
  source: string;
  target: string;
  value: number;
}

// Engagement flow data
export interface EngagementFlowData {
  nodes: EngagementNode[];
  links: EngagementLink[];
}

// Engagement metric for detail view
export interface EngagementMetric {
  type: EngagementType;
  displayName: string;
  count: number;
  percentage: number;
  avgDuration: number;
  completionRate: number;
  conversionRate: number;
}

// Heatmap data point
export interface HeatMapDataPoint {
  hour: number;
  day: number;
  value: number;
}

// Engagement detail response
export interface EngagementDetailResponse {
  totalEngagements: number;
  uniqueUsers: number;
  avgEngagementTime: number;
  mostEngagingComponent: string;
  engagementByType: EngagementMetric[];
  flowData: EngagementFlowData;
  heatMapData: HeatMapDataPoint[];
  topHeatMapValue: number;
}

/**
 * Retrieves and aggregates dashboard metrics
 */
export async function getDashboardMetrics(params: DashboardDataRequest): Promise<DashboardMetricsResponse> {
  try {
    // Extract the query parameters
    const { dateRange, companyId, category } = params;
    const [startDate, endDate] = dateRange;

    // Initialize default response
    const response: DashboardMetricsResponse = {
      impressions: null,
      engagements: null
    };

    // Define aggregate IDs for caching
    const impressionsAggregateId = `impressions_metrics_${companyId || 'all'}_${category || 'all'}_${startDate.toISOString()}_${endDate.toISOString()}`;
    const engagementsAggregateId = `engagement_metrics_${companyId || 'all'}_${category || 'all'}_${startDate.toISOString()}_${endDate.toISOString()}`;

    // Try to get cached aggregates
    let impressionsData = await AnalyticsDataStore.getAggregateData<AggregateImpressionMetrics>(impressionsAggregateId);
    let engagementsData = await AnalyticsDataStore.getAggregateData<AggregateEngagementMetrics>(engagementsAggregateId);

    // If data doesn't exist in cache or refreshing, calculate it
    if (!impressionsData) {
      impressionsData = await calculateImpressionMetrics(dateRange, companyId, category);
      
      // Cache the results
      await AnalyticsDataStore.updateAggregateData<AggregateImpressionMetrics>(
        impressionsAggregateId,
        'impression_metrics',
        () => impressionsData as AggregateImpressionMetrics
      );
    }

    if (!engagementsData) {
      engagementsData = await calculateEngagementMetrics(dateRange, companyId, category);
      
      // Cache the results
      await AnalyticsDataStore.updateAggregateData<AggregateEngagementMetrics>(
        engagementsAggregateId,
        'engagement_metrics',
        () => engagementsData as AggregateEngagementMetrics
      );
    }

    response.impressions = impressionsData;
    response.engagements = engagementsData;

    return response;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
}

/**
 * Calculate impression metrics from raw analytics events
 */
async function calculateImpressionMetrics(
  dateRange: [Date, Date],
  companyId?: string | null,
  category?: string
): Promise<AggregateImpressionMetrics> {
  // Implementation would query the analytics events database
  // and aggregate impression metrics
  
  // For demo purposes, return mock data
  const mockImpressionMetrics: AggregateImpressionMetrics = {
    totalImpressions: getRandomInt(50000, 150000),
    uniqueAds: getRandomInt(10, 50),
    averageDurationMs: getRandomInt(10000, 60000),
    averageViewableTimeMs: getRandomInt(5000, 30000),
    viewabilityRate: Math.random() * 0.4 + 0.5, // 50-90%
    qualityDistribution: {
      premium: getRandomInt(25, 40),
      standard: getRandomInt(35, 50),
      minimal: getRandomInt(10, 25),
      irrelevant: getRandomInt(1, 10)
    },
    contextDistribution: {
      [ImpressionContext.IN_ANSWER]: getRandomInt(20, 30),
      [ImpressionContext.BELOW_ANSWER]: getRandomInt(15, 25),
      [ImpressionContext.SIDEBAR]: getRandomInt(20, 30),
      [ImpressionContext.KNOWLEDGE_GRAPH]: getRandomInt(10, 20),
      [ImpressionContext.MICROSIMULATION]: getRandomInt(5, 15),
      [ImpressionContext.TOP_OF_PAGE]: getRandomInt(1, 5),
      [ImpressionContext.BOTTOM_OF_PAGE]: getRandomInt(1, 5)
    },
    confidenceScoreAverage: Math.random() * 0.3 + 0.6 // 60-90%
  };
  
  return mockImpressionMetrics;
}

/**
 * Calculate engagement metrics from raw analytics events
 */
async function calculateEngagementMetrics(
  dateRange: [Date, Date],
  companyId?: string | null,
  category?: string
): Promise<AggregateEngagementMetrics> {
  // Implementation would query the analytics events database
  // and aggregate engagement metrics
  
  // For demo purposes, return mock data
  const mockEngagementMetrics: AggregateEngagementMetrics = {
    totalEngagements: getRandomInt(10000, 50000),
    uniqueUsers: getRandomInt(5000, 20000),
    averageEngagementTimeMs: getRandomInt(20000, 120000),
    engagementRateByType: {
      [EngagementType.MICROSIM_START]: getRandomInt(10, 20),
      [EngagementType.MICROSIM_COMPLETE]: getRandomInt(5, 15),
      [EngagementType.GRAPH_EXPLORE]: getRandomInt(15, 25),
      [EngagementType.EXPAND_CONTENT]: getRandomInt(20, 30),
      [EngagementType.CTA_CLICK]: getRandomInt(3, 10),
      [EngagementType.LEARN_MORE]: getRandomInt(5, 15),
      [EngagementType.VIDEO_START]: getRandomInt(10, 20),
      [EngagementType.VIDEO_COMPLETE]: getRandomInt(5, 10),
      [EngagementType.DOWNLOAD]: getRandomInt(1, 5)
    } as Record<EngagementType, number>,
    completionRates: {
      microsimulation: Math.random() * 0.4 + 0.3, // 30-70%
      knowledgeGraph: Math.random() * 0.3 + 0.5, // 50-80%
      video: Math.random() * 0.4 + 0.3, // 30-70%
      overall: Math.random() * 0.3 + 0.4 // 40-70%
    },
    averageInteractionDepth: Math.random() * 3 + 1, // 1-4
    mostEngagingComponents: ['Knowledge Graph', 'Treatment Comparison', 'Efficacy Visualization'],
    conversionRate: Math.random() * 0.05 + 0.01 // 1-6%
  };
  
  return mockEngagementMetrics;
}

/**
 * Get timeseries data for visualizations
 */
export async function getTimeseriesData(params: DashboardDataRequest & {
  metric: string;
  granularity: string;
}): Promise<TimeseriesDataset[]> {
  try {
    const { dateRange, metric, granularity, companyId, category } = params;
    const [startDate, endDate] = dateRange;
    
    // For demo purposes, generate mock timeseries data
    const datasets: TimeseriesDataset[] = [];
    
    if (companyId) {
      // Company-specific view with one dataset
      const company = getCompanyById(companyId);
      if (company) {
        datasets.push(generateTimeseriesDataset(
          companyId,
          company.name,
          '#1976d2', // primary blue
          dateRange,
          metric,
          granularity
        ));
      }
    } else {
      // Multi-company comparison view
      datasets.push(
        generateTimeseriesDataset(
          'pfizer',
          'Pfizer',
          '#1976d2', // primary blue
          dateRange,
          metric,
          granularity
        ),
        generateTimeseriesDataset(
          'genentech',
          'Genentech',
          '#9c27b0', // purple
          dateRange,
          metric,
          granularity
        ),
        generateTimeseriesDataset(
          'gsk',
          'GSK',
          '#2e7d32', // green
          dateRange,
          metric,
          granularity
        ),
        generateTimeseriesDataset(
          'lilly',
          'Eli Lilly',
          '#ed6c02', // orange
          dateRange,
          metric,
          granularity
        )
      );
    }
    
    return datasets;
  } catch (error) {
    console.error('Error fetching timeseries data:', error);
    throw error;
  }
}

/**
 * Generate a mock timeseries dataset
 */
function generateTimeseriesDataset(
  id: string,
  name: string,
  color: string,
  dateRange: [Date, Date],
  metric: string,
  granularity: string
): TimeseriesDataset {
  const [startDate, endDate] = dateRange;
  const data: TimeseriesPoint[] = [];
  
  let currentDate = new Date(startDate);
  let baseValue: number;
  let trendFactor: number;
  let volatility: number;
  
  // Set base parameters based on metric type
  switch (metric) {
    case 'impressions':
      baseValue = getRandomInt(1000, 5000);
      trendFactor = Math.random() * 0.4 + 0.8; // 0.8-1.2
      volatility = 0.2;
      break;
    case 'engagements':
      baseValue = getRandomInt(100, 1000);
      trendFactor = Math.random() * 0.4 + 0.8; // 0.8-1.2
      volatility = 0.3;
      break;
    case 'engagement_rate':
      baseValue = getRandomInt(5, 30);
      trendFactor = Math.random() * 0.2 + 0.9; // 0.9-1.1
      volatility = 0.1;
      break;
    case 'conversion_rate':
      baseValue = getRandomInt(1, 8);
      trendFactor = Math.random() * 0.2 + 0.9; // 0.9-1.1
      volatility = 0.15;
      break;
    case 'viewability_rate':
      baseValue = getRandomInt(60, 90);
      trendFactor = Math.random() * 0.1 + 0.95; // 0.95-1.05
      volatility = 0.05;
      break;
    case 'avg_engagement_time':
      baseValue = getRandomInt(20, 60);
      trendFactor = Math.random() * 0.2 + 0.9; // 0.9-1.1
      volatility = 0.15;
      break;
    default:
      baseValue = getRandomInt(1000, 5000);
      trendFactor = 1;
      volatility = 0.2;
  }
  
  // Adjust granularity increment
  let increment: number;
  switch (granularity) {
    case 'hour':
      increment = 60 * 60 * 1000; // 1 hour
      break;
    case 'day':
      increment = 24 * 60 * 60 * 1000; // 1 day
      break;
    case 'week':
      increment = 7 * 24 * 60 * 60 * 1000; // 1 week
      break;
    case 'month':
      increment = 30 * 24 * 60 * 60 * 1000; // ~1 month
      break;
    default:
      increment = 24 * 60 * 60 * 1000; // 1 day
  }
  
  // Generate time series points
  let value = baseValue;
  while (currentDate <= endDate) {
    // Add some random variation and trend
    value = value * (1 + (Math.random() - 0.5) * volatility) * trendFactor;
    
    // Add weekly seasonality (higher on weekdays)
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    const weekdayFactor = (dayOfWeek > 0 && dayOfWeek < 6) ? 1.1 : 0.8;
    
    data.push({
      date: new Date(currentDate),
      value: Math.round(value * weekdayFactor)
    });
    
    // Increment to next time period
    currentDate = new Date(currentDate.getTime() + increment);
  }
  
  return {
    id,
    name,
    color,
    data
  };
}

/**
 * Get category breakdown data
 */
export async function getCategoryBreakdownData(
  params: DashboardDataRequest
): Promise<CategoryBreakdownResponse> {
  try {
    const { dateRange, companyId } = params;
    
    // For demo purposes, return mock data
    const categories = Object.keys(MEDICAL_CATEGORY_MAP);
    const metrics: CategoryMetric[] = categories.map(category => {
      const displayName = category.replace('_', ' ');
      const impressions = getRandomInt(1000, 10000);
      const engagements = getRandomInt(100, impressions * 0.3);
      
      return {
        category,
        displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        impressions,
        engagements,
        engagementRate: (engagements / impressions) * 100,
        conversionRate: Math.random() * 5 + 1, // 1-6%
        viewabilityRate: Math.random() * 30 + 60, // 60-90%
        qualityScore: Math.random() * 40 + 60, // 60-100
        change: Math.random() * 60 - 20 // -20% to +40%
      };
    });
    
    // Sort metrics by impressions
    const sortedMetrics = [...metrics].sort((a, b) => b.impressions - a.impressions);
    
    // Sort by change for most improved
    const mostImprovedMetrics = [...metrics].sort((a, b) => b.change - a.change);
    
    const totalImpressions = metrics.reduce((sum, item) => sum + item.impressions, 0);
    const totalEngagements = metrics.reduce((sum, item) => sum + item.engagements, 0);
    
    return {
      metrics,
      topPerforming: sortedMetrics[0].displayName,
      mostImproved: mostImprovedMetrics[0].displayName,
      totalImpressions,
      totalEngagements
    };
  } catch (error) {
    console.error('Error fetching category breakdown data:', error);
    throw error;
  }
}

/**
 * Get engagement detail data
 */
export async function getEngagementDetailData(
  params: DashboardDataRequest & {
    engagementType?: string;
  }
): Promise<EngagementDetailResponse> {
  try {
    const { dateRange, companyId, category, engagementType } = params;
    
    // Mock engagement metrics
    const engagementMetrics: EngagementMetric[] = [
      {
        type: EngagementType.MICROSIM_START,
        displayName: 'Microsimulation Start',
        count: getRandomInt(1000, 5000),
        percentage: 0, // Will be calculated
        avgDuration: getRandomInt(30000, 180000),
        completionRate: Math.random() * 0.3 + 0.4, // 40-70%
        conversionRate: Math.random() * 0.05 + 0.01 // 1-6%
      },
      {
        type: EngagementType.GRAPH_EXPLORE,
        displayName: 'Knowledge Graph Exploration',
        count: getRandomInt(2000, 8000),
        percentage: 0, // Will be calculated
        avgDuration: getRandomInt(45000, 200000),
        completionRate: Math.random() * 0.3 + 0.5, // 50-80%
        conversionRate: Math.random() * 0.06 + 0.02 // 2-8%
      },
      {
        type: EngagementType.CTA_CLICK,
        displayName: 'Call to Action Clicks',
        count: getRandomInt(500, 3000),
        percentage: 0, // Will be calculated
        avgDuration: getRandomInt(5000, 30000),
        completionRate: Math.random() * 0.2 + 0.7, // 70-90%
        conversionRate: Math.random() * 0.1 + 0.05 // 5-15%
      },
      {
        type: EngagementType.VIDEO_START,
        displayName: 'Video Views',
        count: getRandomInt(1500, 6000),
        percentage: 0, // Will be calculated
        avgDuration: getRandomInt(20000, 90000),
        completionRate: Math.random() * 0.3 + 0.4, // 40-70%
        conversionRate: Math.random() * 0.04 + 0.01 // 1-5%
      },
      {
        type: EngagementType.EXPAND_CONTENT,
        displayName: 'Content Expansions',
        count: getRandomInt(3000, 10000),
        percentage: 0, // Will be calculated
        avgDuration: getRandomInt(15000, 60000),
        completionRate: Math.random() * 0.2 + 0.6, // 60-80%
        conversionRate: Math.random() * 0.03 + 0.01 // 1-4%
      }
    ];
    
    // Calculate total and percentages
    const totalCount = engagementMetrics.reduce((sum, item) => sum + item.count, 0);
    engagementMetrics.forEach(metric => {
      metric.percentage = (metric.count / totalCount) * 100;
    });
    
    // Generate mock flow data
    const flowData: EngagementFlowData = generateMockFlowData(engagementMetrics);
    
    // Generate mock heatmap data
    const heatMapData: HeatMapDataPoint[] = generateMockHeatmapData();
    const topHeatMapValue = Math.max(...heatMapData.map(d => d.value));
    
    // Find the metric with highest completion rate for "most engaging"
    const sortedByCompletion = [...engagementMetrics].sort((a, b) => b.completionRate - a.completionRate);
    
    return {
      totalEngagements: totalCount,
      uniqueUsers: getRandomInt(totalCount * 0.2, totalCount * 0.5),
      avgEngagementTime: getRandomInt(20000, 120000),
      mostEngagingComponent: sortedByCompletion[0].displayName,
      engagementByType: engagementMetrics,
      flowData,
      heatMapData,
      topHeatMapValue
    };
  } catch (error) {
    console.error('Error fetching engagement detail data:', error);
    throw error;
  }
}

/**
 * Generate mock flow data for the Sankey diagram
 */
function generateMockFlowData(metrics: EngagementMetric[]): EngagementFlowData {
  const nodes: EngagementNode[] = [
    { id: 'start', name: 'Session Start', value: 15000, type: 'start' }
  ];
  
  const links: EngagementLink[] = [];
  
  // Add nodes for each metric type
  metrics.forEach(metric => {
    nodes.push({
      id: metric.type,
      name: metric.displayName,
      value: metric.count,
      type: 'interaction'
    });
    
    // Link from start to this engagement type
    links.push({
      source: 'start',
      target: metric.type,
      value: metric.count
    });
    
    // Add completion node if relevant
    if (['MICROSIM_START', 'VIDEO_START', 'GRAPH_EXPLORE'].includes(metric.type)) {
      const completionNodeId = `${metric.type}_complete`;
      const completionCount = Math.floor(metric.count * metric.completionRate);
      
      nodes.push({
        id: completionNodeId,
        name: `${metric.displayName} Completed`,
        value: completionCount,
        type: 'completion'
      });
      
      links.push({
        source: metric.type,
        target: completionNodeId,
        value: completionCount
      });
      
      // Add abandonment node
      const abandonmentNodeId = `${metric.type}_abandon`;
      const abandonmentCount = metric.count - completionCount;
      
      nodes.push({
        id: abandonmentNodeId,
        name: `${metric.displayName} Abandoned`,
        value: abandonmentCount,
        type: 'abandonment'
      });
      
      links.push({
        source: metric.type,
        target: abandonmentNodeId,
        value: abandonmentCount
      });
    }
    
    // Add conversion node
    if (metric.conversionRate > 0) {
      const conversionNodeId = `${metric.type}_conversion`;
      const conversionCount = Math.floor(metric.count * metric.conversionRate);
      
      nodes.push({
        id: conversionNodeId,
        name: 'Conversion',
        value: conversionCount,
        type: 'completion'
      });
      
      links.push({
        source: metric.type,
        target: conversionNodeId,
        value: conversionCount
      });
    }
  });
  
  // Add some cross-links between engagement types
  if (metrics.length >= 2) {
    links.push({
      source: metrics[0].type,
      target: metrics[1].type,
      value: Math.floor(metrics[0].count * 0.3)
    });
  }
  
  if (metrics.length >= 3) {
    links.push({
      source: metrics[1].type,
      target: metrics[2].type,
      value: Math.floor(metrics[1].count * 0.25)
    });
  }
  
  return { nodes, links };
}

/**
 * Generate mock heatmap data
 */
function generateMockHeatmapData(): HeatMapDataPoint[] {
  const data: HeatMapDataPoint[] = [];
  
  // Generate data for each hour of each day
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // Higher values during business hours on weekdays
      let baseValue = 10;
      
      // Weekday vs weekend factor
      if (day >= 1 && day <= 5) { // Monday to Friday
        baseValue += 30;
      }
      
      // Business hours factor (9am-5pm)
      if (hour >= 9 && hour <= 17) {
        baseValue += 40;
      }
      
      // Lunch hour boost
      if (hour >= 12 && hour <= 13) {
        baseValue += 15;
      }
      
      // Early evening boost (after work)
      if (hour >= 18 && hour <= 21) {
        baseValue += 20;
      }
      
      // Late night drop
      if (hour >= 22 || hour <= 5) {
        baseValue = Math.max(5, baseValue - 30);
      }
      
      // Add random variation
      const value = Math.max(0, Math.floor(baseValue + (Math.random() - 0.3) * 20));
      
      data.push({ day, hour, value });
    }
  }
  
  return data;
}

/**
 * Helper function to generate random integers
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
} 