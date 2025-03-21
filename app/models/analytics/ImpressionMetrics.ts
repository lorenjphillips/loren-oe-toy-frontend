/**
 * Impression Metrics Model
 * 
 * Models for tracking ad impressions with quality indicators including
 * viewability, engagement potential, and contextual relevance.
 * Used for advanced analytics in pharma reporting dashboards.
 */

import { AnalyticsEvent, AnalyticsEventCategory } from './AnalyticsEvent';
import { AdType } from '../../types/ad';

/**
 * Visibility states for impression tracking
 */
export enum ImpressionVisibility {
  FULLY_VISIBLE = 'fully_visible',   // 100% of ad in viewport
  MOSTLY_VISIBLE = 'mostly_visible', // 50-99% of ad in viewport
  PARTIALLY_VISIBLE = 'partially_visible', // 1-49% of ad in viewport
  NOT_VISIBLE = 'not_visible'        // 0% of ad in viewport
}

/**
 * Quality rating for ad impressions
 */
export enum ImpressionQuality {
  PREMIUM = 'premium',       // High engagement potential & relevance
  STANDARD = 'standard',     // Average engagement potential
  MINIMAL = 'minimal',       // Low engagement potential
  IRRELEVANT = 'irrelevant'  // Served but likely not relevant
}

/**
 * Context types for impressions
 */
export enum ImpressionContext {
  IN_ANSWER = 'in_answer',             // Within the actual answer content
  BELOW_ANSWER = 'below_answer',       // Below the answer content
  SIDEBAR = 'sidebar',                 // In the sidebar
  KNOWLEDGE_GRAPH = 'knowledge_graph', // Within knowledge graph
  MICROSIMULATION = 'microsimulation', // Within microsimulation
  TOP_OF_PAGE = 'top_of_page',         // At the top of the page
  BOTTOM_OF_PAGE = 'bottom_of_page'    // At the bottom of the page
}

/**
 * Core impression data model
 */
export interface ImpressionData {
  adId: string;               // The ad content ID
  adType: AdType;             // Type of ad (text, banner, etc.)
  companyId: string;          // Company ID the ad is for
  companyName: string;        // Company name
  treatmentCategoryId?: string; // Treatment category ID
  medicalCategoryId?: string; // Medical category ID
  placementContext: ImpressionContext; // Where the ad was placed
  visibilityState: ImpressionVisibility; // Current visibility
  viewportPercentage: number; // Percentage of ad in viewport (0-100)
  startTimestamp: number;     // When impression started
  endTimestamp?: number;      // When impression ended (if tracked)
  durationMs?: number;        // Duration of impression if complete
  qualityRating?: ImpressionQuality; // Quality rating if calculated
  confidenceScore?: number;   // Confidence score (0-1) for relevance
  viewableTimeMs?: number;    // Time ad was actually viewable
  campaignId?: string;        // Campaign ID from metadata
  templateId?: string;        // Template ID used for rendering
}

/**
 * Impression start event interface
 */
export interface ImpressionStartEvent extends AnalyticsEvent {
  eventType: 'impression_start';
  eventCategory: AnalyticsEventCategory.IMPRESSION;
  metadata: ImpressionData;
}

/**
 * Impression end event interface
 */
export interface ImpressionEndEvent extends AnalyticsEvent {
  eventType: 'impression_end';
  eventCategory: AnalyticsEventCategory.IMPRESSION;
  metadata: ImpressionData & {
    durationMs: number;         // How long the impression lasted
    viewableTimeMs: number;     // Time the ad was viewable
    scrollDepth?: number;       // Maximum scroll depth reached
    userInteracted?: boolean;   // Whether the user interacted with the ad
  };
}

/**
 * Impression quality update event
 */
export interface ImpressionQualityEvent extends AnalyticsEvent {
  eventType: 'impression_quality_update';
  eventCategory: AnalyticsEventCategory.IMPRESSION;
  metadata: ImpressionData & {
    qualityRating: ImpressionQuality;
    qualityFactors: {
      viewability: number;      // 0-1 score for viewability
      relevance: number;        // 0-1 score for content relevance
      engagement: number;       // 0-1 score for engagement potential
      attention: number;        // 0-1 score for estimated attention
    };
  };
}

/**
 * Impression visibility change event
 */
export interface ImpressionVisibilityEvent extends AnalyticsEvent {
  eventType: 'impression_visibility_change';
  eventCategory: AnalyticsEventCategory.VISIBILITY;
  metadata: ImpressionData & {
    previousState: ImpressionVisibility;
    newState: ImpressionVisibility;
    previousPercentage: number;
    newPercentage: number;
    timeInPreviousStateMs: number;
  };
}

/**
 * Aggregate impression metrics for reporting
 */
export interface AggregateImpressionMetrics {
  totalImpressions: number;
  uniqueAds: number;
  averageDurationMs: number;
  averageViewableTimeMs: number;
  viewabilityRate: number;    // Percentage of impressions that were viewable
  qualityDistribution: {
    premium: number;
    standard: number;
    minimal: number; 
    irrelevant: number;
  };
  contextDistribution: Record<ImpressionContext, number>;
  confidenceScoreAverage: number;
} 