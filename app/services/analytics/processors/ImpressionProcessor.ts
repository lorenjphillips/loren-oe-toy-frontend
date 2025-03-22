/**
 * Impression Processor
 * 
 * Tracks when and how ads are displayed with focus on:
 * - Impression start/end times
 * - Viewability metrics
 * - Quality scores
 * - Contextual relevance
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  createAnalyticsEvent, 
  AnalyticsEventCategory
} from '../../../models/analytics/AnalyticsEvent';
import {
  ImpressionData,
  ImpressionStartEvent,
  ImpressionEndEvent,
  ImpressionQualityEvent,
  ImpressionVisibilityEvent,
  ImpressionVisibility,
  ImpressionQuality,
  ImpressionContext,
  AggregateImpressionMetrics
} from '../../../models/analytics/ImpressionMetrics';
import { AdContent } from '../../../models/adTypes';
import { AdType } from '../../../types/ad';
import * as DataStore from '../dataStore';

// Map to track active impressions
const activeImpressions = new Map<string, ActiveImpression>();

/**
 * Interface for active impression tracking
 */
interface ActiveImpression {
  adId: string;
  startTime: number;
  lastVisibilityCheck: number;
  visibleTime: number;
  lastVisibility: ImpressionVisibility;
  lastVisibilityPercentage: number;
  qualityChecked: boolean;
}

/**
 * Track the start of an ad impression
 * 
 * @returns Impression ID for future reference
 */
export function trackImpressionStart(
  adContent: AdContent,
  placementContext: ImpressionContext,
  confidenceScore?: number
): string {
  const impressionId = uuidv4();
  const startTime = Date.now();
  
  // Create impression data
  const impressionData: ImpressionData = {
    adId: adContent.id,
    adType: adContent.adType,
    companyId: adContent.manufacturer || 'unknown',
    companyName: adContent.manufacturer || 'unknown',
    treatmentCategoryId: adContent.treatmentCategory?.id,
    medicalCategoryId: adContent.treatmentCategory?.medicalCategory,
    placementContext,
    visibilityState: ImpressionVisibility.NOT_VISIBLE,
    viewportPercentage: 0,
    startTimestamp: startTime,
    confidenceScore,
    campaignId: adContent.campaignId,
    templateId: adContent.templateId // This is now defined in AdContent
  };
  
  // Track in the active impressions map
  activeImpressions.set(impressionId, {
    adId: adContent.id,
    startTime,
    lastVisibilityCheck: startTime,
    visibleTime: 0,
    lastVisibility: ImpressionVisibility.NOT_VISIBLE,
    lastVisibilityPercentage: 0,
    qualityChecked: false
  });
  
  // Create analytics event
  const event: ImpressionStartEvent = createAnalyticsEvent(
    'impression_start',
    AnalyticsEventCategory.IMPRESSION,
    {
      page: 'current',
      component: 'ad',
      placement: placementContext
    },
    impressionData
  ) as ImpressionStartEvent;
  
  // Store the event
  DataStore.storeEvent(event);
  
  return impressionId;
}

/**
 * Track the end of an ad impression
 */
export function trackImpressionEnd(
  impressionId: string,
  adContent: AdContent
): void {
  const impression = activeImpressions.get(impressionId);
  
  if (!impression) {
    console.warn('Cannot end impression: ID not found', impressionId);
    return;
  }
  
  const endTime = Date.now();
  const durationMs = endTime - impression.startTime;
  
  // Create impression data
  const impressionData: ImpressionData = {
    adId: adContent.id,
    adType: adContent.adType,
    companyId: adContent.manufacturer || 'unknown',
    companyName: adContent.manufacturer || 'unknown',
    treatmentCategoryId: adContent.treatmentCategory?.id,
    medicalCategoryId: adContent.treatmentCategory?.medicalCategory,
    placementContext: ImpressionContext.IN_ANSWER, // Default, should be passed in
    visibilityState: impression.lastVisibility,
    viewportPercentage: impression.lastVisibilityPercentage,
    startTimestamp: impression.startTime,
    endTimestamp: endTime,
    durationMs,
    viewableTimeMs: impression.visibleTime,
    campaignId: adContent.campaignId,
    templateId: adContent.templateId
  };
  
  // Create analytics event
  const event: ImpressionEndEvent = createAnalyticsEvent(
    'impression_end',
    AnalyticsEventCategory.IMPRESSION,
    {
      page: 'current',
      component: 'ad'
    },
    {
      ...impressionData,
      durationMs,
      viewableTimeMs: impression.visibleTime,
      scrollDepth: 0, // Should be calculated
      userInteracted: false // Should be passed in
    }
  ) as ImpressionEndEvent;
  
  // Store the event
  DataStore.storeEvent(event);
  
  // Update aggregates
  updateImpressionAggregates(adContent, durationMs, impression.visibleTime);
  
  // Remove from active impressions
  activeImpressions.delete(impressionId);
}

/**
 * Track visibility changes for an impression
 */
export function trackImpressionVisibility(
  impressionId: string,
  visibilityState: ImpressionVisibility,
  viewportPercentage: number
): void {
  const impression = activeImpressions.get(impressionId);
  
  if (!impression) {
    console.warn('Cannot track visibility: impression ID not found', impressionId);
    return;
  }
  
  const now = Date.now();
  const timeInPreviousState = now - impression.lastVisibilityCheck;
  
  // Update visible time if previous state was visible
  if (impression.lastVisibility !== ImpressionVisibility.NOT_VISIBLE) {
    impression.visibleTime += timeInPreviousState;
  }
  
  // Skip if no change in visibility
  if (visibilityState === impression.lastVisibility && 
      Math.abs(viewportPercentage - impression.lastVisibilityPercentage) < 5) {
    impression.lastVisibilityCheck = now;
    return;
  }
  
  // Create visibility change event
  const event: ImpressionVisibilityEvent = createAnalyticsEvent(
    'impression_visibility_change',
    AnalyticsEventCategory.VISIBILITY,
    {
      page: 'current',
      component: 'ad'
    },
    {
      adId: impression.adId,
      adType: AdType.STANDARD,
      companyId: 'unknown',
      companyName: 'unknown',
      placementContext: ImpressionContext.IN_ANSWER,
      visibilityState,
      viewportPercentage,
      startTimestamp: impression.startTime,
      previousState: impression.lastVisibility,
      newState: visibilityState,
      previousPercentage: impression.lastVisibilityPercentage,
      newPercentage: viewportPercentage,
      timeInPreviousStateMs: timeInPreviousState
    }
  ) as ImpressionVisibilityEvent;
  
  // Store the event
  DataStore.storeEvent(event);
  
  // Update impression state
  impression.lastVisibility = visibilityState;
  impression.lastVisibilityPercentage = viewportPercentage;
  impression.lastVisibilityCheck = now;
  
  activeImpressions.set(impressionId, impression);
}

/**
 * Check and update the quality rating for an impression
 */
export function checkImpressionQuality(
  impressionId: string,
  adContent: AdContent,
  placementContext: ImpressionContext,
  confidenceScore?: number
): void {
  const impression = activeImpressions.get(impressionId);
  
  if (!impression) {
    console.warn('Cannot check quality: impression ID not found', impressionId);
    return;
  }
  
  // Skip if already checked
  if (impression.qualityChecked) {
    return;
  }
  
  // Calculate quality scores
  const viewabilityScore = calculateViewabilityScore(impression);
  const relevanceScore = confidenceScore || 0.5; // Default to medium if not provided
  const engagementScore = calculateEngagementPotential(adContent.adType, placementContext);
  const attentionScore = calculateAttentionScore(placementContext, impression.lastVisibilityPercentage);
  
  // Calculate overall quality score (0-1)
  const overallScore = (viewabilityScore * 0.3) + 
                       (relevanceScore * 0.3) + 
                       (engagementScore * 0.2) + 
                       (attentionScore * 0.2);
                       
  // Map to quality rating
  let qualityRating: ImpressionQuality;
  
  if (overallScore >= 0.8) {
    qualityRating = ImpressionQuality.PREMIUM;
  } else if (overallScore >= 0.6) {
    qualityRating = ImpressionQuality.STANDARD;
  } else if (overallScore >= 0.3) {
    qualityRating = ImpressionQuality.MINIMAL;
  } else {
    qualityRating = ImpressionQuality.IRRELEVANT;
  }
  
  // Create quality update event
  const event: ImpressionQualityEvent = createAnalyticsEvent(
    'impression_quality_update',
    AnalyticsEventCategory.IMPRESSION,
    {
      page: 'current',
      component: 'ad'
    },
    {
      adId: adContent.id,
      adType: adContent.adType,
      companyId: adContent.manufacturer || 'unknown',
      companyName: adContent.manufacturer || 'unknown',
      treatmentCategoryId: adContent.treatmentCategory?.id,
      medicalCategoryId: adContent.treatmentCategory?.medicalCategory,
      placementContext,
      visibilityState: impression.lastVisibility,
      viewportPercentage: impression.lastVisibilityPercentage,
      startTimestamp: impression.startTime,
      qualityRating,
      qualityFactors: {
        viewability: viewabilityScore,
        relevance: relevanceScore,
        engagement: engagementScore,
        attention: attentionScore
      }
    }
  ) as ImpressionQualityEvent;
  
  // Store the event
  DataStore.storeEvent(event);
  
  // Mark quality as checked
  impression.qualityChecked = true;
  activeImpressions.set(impressionId, impression);
}

/**
 * Calculate viewability score based on visibility duration and percentage
 */
function calculateViewabilityScore(impression: ActiveImpression): number {
  const totalDuration = Date.now() - impression.startTime;
  
  // If total duration is 0, avoid division by zero
  if (totalDuration === 0) return 0;
  
  // Calculate what percentage of time the impression was visible
  const visibilityRatio = impression.visibleTime / totalDuration;
  
  // Factor in the visibility percentage
  const visibilityFactor = getVisibilityFactor(impression.lastVisibility);
  
  return visibilityRatio * visibilityFactor;
}

/**
 * Get a factor representing the value of each visibility state
 */
function getVisibilityFactor(visibility: ImpressionVisibility): number {
  switch (visibility) {
    case ImpressionVisibility.FULLY_VISIBLE:
      return 1.0;
    case ImpressionVisibility.MOSTLY_VISIBLE:
      return 0.8;
    case ImpressionVisibility.PARTIALLY_VISIBLE:
      return 0.4;
    case ImpressionVisibility.NOT_VISIBLE:
      return 0;
    default:
      return 0;
  }
}

/**
 * Calculate engagement potential based on ad type and context
 */
function calculateEngagementPotential(adType: AdType, context: ImpressionContext): number {
  // Base engagement potential by ad type
  let typePotential = 0;
  
  if (adType === AdType.MICROSIMULATION) {
    typePotential = 0.9;
  } else if (adType === AdType.KNOWLEDGE_GRAPH) {
    typePotential = 0.85;
  } else if (adType === AdType.INTERACTIVE) {
    typePotential = 0.8;
  } else if (adType === AdType.VIDEO) {
    typePotential = 0.7;
  } else if (adType === AdType.ENHANCED) {
    typePotential = 0.6;
  } else {
    typePotential = 0.4;
  }
  
  // Context-based modifier
  let contextModifier = 0;
  
  switch (context) {
    case ImpressionContext.IN_ANSWER:
      contextModifier = 0.3;
      break;
    case ImpressionContext.KNOWLEDGE_GRAPH:
      contextModifier = 0.25;
      break;
    case ImpressionContext.MICROSIMULATION:
      contextModifier = 0.2;
      break;
    case ImpressionContext.BELOW_ANSWER:
      contextModifier = 0.15;
      break;
    case ImpressionContext.SIDEBAR:
      contextModifier = 0.1;
      break;
    case ImpressionContext.TOP_OF_PAGE:
      contextModifier = 0.05;
      break;
    case ImpressionContext.BOTTOM_OF_PAGE:
      contextModifier = 0;
      break;
    default:
      contextModifier = 0;
  }
  
  // Combine with min of 0 and max of 1
  return Math.min(1, Math.max(0, typePotential + contextModifier));
}

/**
 * Calculate attention score based on placement context and viewport percentage
 */
function calculateAttentionScore(context: ImpressionContext, viewportPercentage: number): number {
  // Base score from viewport percentage (0-1)
  const viewportScore = viewportPercentage / 100;
  
  // Context-based attention multiplier
  let contextMultiplier = 1;
  
  switch (context) {
    case ImpressionContext.IN_ANSWER:
      contextMultiplier = 1.5;
      break;
    case ImpressionContext.KNOWLEDGE_GRAPH:
      contextMultiplier = 1.3;
      break;
    case ImpressionContext.MICROSIMULATION:
      contextMultiplier = 1.4;
      break;
    case ImpressionContext.BELOW_ANSWER:
      contextMultiplier = 1.2;
      break;
    case ImpressionContext.SIDEBAR:
      contextMultiplier = 1.0;
      break;
    case ImpressionContext.TOP_OF_PAGE:
      contextMultiplier = 0.9;
      break;
    case ImpressionContext.BOTTOM_OF_PAGE:
      contextMultiplier = 0.7;
      break;
    default:
      contextMultiplier = 1.0;
  }
  
  // Calculate score with a maximum of 1
  return Math.min(1, viewportScore * contextMultiplier);
}

/**
 * Update aggregate impression metrics
 */
function updateImpressionAggregates(
  adContent: AdContent,
  durationMs: number,
  viewableTimeMs: number
): void {
  // Get today's date as a string for the aggregate key
  const today = new Date().toISOString().split('T')[0];
  
  // Update aggregate impression metrics
  DataStore.updateAggregateData<AggregateImpressionMetrics>(
    `impression_metrics_${today}`,
    'impression_metrics',
    (current) => {
      // Initialize if not exists
      if (!current) {
        return {
          totalImpressions: 1,
          uniqueAds: 1,
          averageDurationMs: durationMs,
          averageViewableTimeMs: viewableTimeMs,
          viewabilityRate: viewableTimeMs > 0 ? 1 : 0,
          qualityDistribution: {
            premium: 0,
            standard: 0,
            minimal: 0,
            irrelevant: 0
          },
          contextDistribution: {
            [ImpressionContext.IN_ANSWER]: 0,
            [ImpressionContext.BELOW_ANSWER]: 0,
            [ImpressionContext.SIDEBAR]: 0,
            [ImpressionContext.KNOWLEDGE_GRAPH]: 0,
            [ImpressionContext.MICROSIMULATION]: 0,
            [ImpressionContext.TOP_OF_PAGE]: 0,
            [ImpressionContext.BOTTOM_OF_PAGE]: 0
          },
          confidenceScoreAverage: 0
        };
      }
      
      // Create a copy for updates
      const updated = { ...current };
      
      // Update counters
      updated.totalImpressions += 1;
      
      // Update duration metrics
      updated.averageDurationMs = 
        (updated.averageDurationMs * (updated.totalImpressions - 1) + durationMs) / 
        updated.totalImpressions;
      
      // Update viewable time metrics
      updated.averageViewableTimeMs = 
        (updated.averageViewableTimeMs * (updated.totalImpressions - 1) + viewableTimeMs) / 
        updated.totalImpressions;
      
      // Update viewability rate
      const wasViewable = viewableTimeMs > 0;
      updated.viewabilityRate = 
        (updated.viewabilityRate * (updated.totalImpressions - 1) + (wasViewable ? 1 : 0)) / 
        updated.totalImpressions;
      
      return updated;
    }
  );
}

/**
 * Clean up stale impressions that weren't properly ended
 */
export function cleanupStaleImpressions(maxAgeMs: number = 30 * 60 * 1000): void {
  const now = Date.now();
  
  activeImpressions.forEach((impression, id) => {
    // If the impression is older than the max age, end it
    if (now - impression.startTime > maxAgeMs) {
      // We don't have the ad content here, so we'll need to create a stub
      const adContent = {
        id: impression.adId,
        adType: AdType.STANDARD,
        campaignId: 'unknown',
        title: 'Unknown',
        description: 'Stale impression',
        company: {
          id: 'unknown',
          name: 'Unknown'
        },
        treatmentCategory: {
          id: 'unknown',
          name: 'Unknown',
          medicalCategory: 'unknown',
          relevantSpecialties: []
        },
        treatmentCategoryId: 'unknown',
        targetConditions: [],
        keywords: [],
        entityMappings: [],
        createdAt: 0,
        updatedAt: 0,
        activeTo: 0,
        isActive: false,
        regulatoryApproved: false,
        disclaimers: [],
        references: []
      } as AdContent;
      
      trackImpressionEnd(id, adContent);
    }
  });
} 