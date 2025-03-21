/**
 * Visualization Components Index
 * 
 * This file exports all visualization components for easy imports throughout the app.
 * It also provides type definitions for the visualization data structures.
 */

// Export all visualization components
export { default as EngagementFunnel } from './EngagementFunnel';
export { default as QualityDistribution } from './QualityDistribution';
export { default as CategoryHeatmap } from './CategoryHeatmap';
export { default as InteractionFlow } from './InteractionFlow';
export { default as TemporalPatterns } from './TemporalPatterns';

// Export type definitions from components
export type {
  FunnelStage,
  EngagementFunnelProps
} from './EngagementFunnel';

export type {
  QualityMetric,
  QualityDistributionProps
} from './QualityDistribution';

export type {
  CategoryDataPoint,
  CategoryHeatmapProps
} from './CategoryHeatmap';

export type {
  FlowNode,
  FlowLink,
  FlowData,
  InteractionFlowProps
} from './InteractionFlow';

export type {
  TimeSeriesPoint,
  TimeSeriesData,
  TimeRange,
  TemporalPatternsProps
} from './TemporalPatterns'; 