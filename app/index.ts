/**
 * Medical Trend Reporting System
 * 
 * A comprehensive system for analyzing emerging clinical topics
 * based on physician questions, with trend detection, correlation
 * analysis, and forecasting capabilities.
 */

// Export analytics services
export { trendAnalysisService } from './services/analytics/trends';

// Export insights services
export { trendInsightsService } from './services/insights/trendInsights';

// Export dashboard components
export * from './components/dashboard/trends';

// Export dashboard page
export { default as TrendsDashboard } from './pages/TrendsDashboard';

// Export dashboard context
export { DashboardContext } from './components/dashboard/DashboardContext'; 