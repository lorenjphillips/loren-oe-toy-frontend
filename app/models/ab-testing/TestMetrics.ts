/**
 * Test metrics model
 * 
 * Contains all metrics measured for a test variant
 */
export interface TestMetrics {
  // Core metrics
  impressions: number;           // Number of ad impressions
  conversions: number;           // Number of primary conversions
  
  // Engagement metrics
  clicks: number;               // Number of clicks
  clickThroughRate: number;     // Click-through rate (clicks / impressions)
  conversionRate: number;        // Conversion rate (conversions / impressions)
  bounceRate?: number;           // Bounce rate (percentage of users who leave after viewing only one page)
  averageTimeOnPage?: number;   // Average time spent on page in seconds
  engagementRate?: number;       // Engagement rate (percentage of users who engage with the ad)
  
  // Custom conversion metrics
  customConversions?: {
    [key: string]: number;       // Custom conversion type mapped to count
  };
  
  // Ad-specific metrics
  adEngagement?: {
    interactionRate?: number;    // Percentage of impressions with interactions
    interactionCount?: number;   // Total number of interactions
    expandRate?: number;         // Percentage of impressions where ad was expanded
    videoCompletionRate?: number; // Video completion rate
    averageInteractionTime?: number; // Average time spent interacting with ad
  };
  
  // Post-click metrics
  postClick?: {
    landingPageViews?: number;   // Number of landing page views
    signups?: number;            // Number of signups
    formCompletions?: number;    // Number of form completions
    durationOnSite?: number;     // Average duration on site in seconds
    pageDepth?: number;          // Average number of pages viewed
  };
  
  // Revenue metrics (if applicable)
  revenue?: number;              // Total revenue from this variant
  revenuePerImpression?: number; // Average revenue per impression
  revenuePerClick?: number;      // Average revenue per click
  costPerAcquisition?: number;   // Cost per acquisition
  revenuePerUser?: number;        // Average revenue per user
  
  // Segmented metrics
  segments?: Record<string, {
    impressions: number;
    conversions: number;
    clickThroughRate?: number;
  }>;
} 