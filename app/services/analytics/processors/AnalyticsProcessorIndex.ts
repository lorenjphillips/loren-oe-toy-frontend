/**
 * Analytics Processors Index
 * 
 * Central export file for all analytics processors.
 * Creates a unified interface for analytics tracking throughout the application.
 */

// Import and re-export all processors
import * as ImpressionProcessor from './ImpressionProcessor';
import * as EngagementProcessor from './EngagementProcessor';
import * as ContextProcessor from './ContextProcessor';
import * as JourneyProcessor from './JourneyProcessor';

// Import needed types
import { 
  SessionActionType, 
  PageType 
} from '../../../models/analytics/UserJourneyMetrics';
import { AdContent } from '../../../models/adTypes';
import { QuestionContextData } from '../../../models/analytics/QuestionContextMetrics';

// Configure processors and initialize required services
export async function initializeAnalyticsProcessors(config: {
  privacyCompliant: boolean;
  syncInterval: number;
  batchSize: number;
  autoTimeoutMinutes: number;
}): Promise<void> {
  // Set up impression processor auto-cleanup if the function exists
  if (typeof ImpressionProcessor.cleanupStaleImpressions === 'function') {
    setInterval(() => {
      ImpressionProcessor.cleanupStaleImpressions();
    }, 60000); // Check every minute
  }
  
  // Set up session auto-timeout
  setInterval(() => {
    JourneyProcessor.autoTimeoutSessions(config.autoTimeoutMinutes);
  }, 60000); // Check every minute
}

// Export all processor functions
export {
  // Impression tracking
  ImpressionProcessor,
  
  // Engagement tracking
  EngagementProcessor,
  
  // Context tracking
  ContextProcessor,
  
  // Journey tracking
  JourneyProcessor
};

// Utility functions
/**
 * Record a page view with all relevant analytics processors
 */
export function recordPageView(
  pageId: string, 
  pageType: PageType, 
  sessionId: string,
  metadata: Record<string, any> = {}
): void {
  // Use the journey processor to track the page view
  JourneyProcessor.trackSessionStep(
    sessionId,
    SessionActionType.VIEW_PAGE,
    pageType,
    pageId,
    metadata
  );
}

/**
 * Track a full question-answer interaction
 */
export function trackQuestionAnswerFlow(
  sessionId: string,
  questionId: string,
  questionText: string,
  answerMetadata: Record<string, any> = {}
): void {
  // Analyze the question context
  const contextId = ContextProcessor.analyzeQuestionContext(
    questionId,
    questionText
  );
  
  // Track in the user journey
  JourneyProcessor.trackSessionStep(
    sessionId,
    SessionActionType.ASK_QUESTION,
    PageType.QUESTION,
    questionId,
    {
      questionId,
      contextId
    }
  );
}

/**
 * Track ad display with all analytics processors
 */
export function trackAdDisplay(
  sessionId: string,
  adId: string,
  adContent: AdContent,
  placementId: string,
  questionId?: string,
  questionContextData?: QuestionContextData
): string {
  // Create impression in ImpressionProcessor
  const impressionId = ImpressionProcessor.trackImpressionStart(
    adId,
    adContent,
    placementId,
    { questionId }
  );
  
  // If we have question context data, analyze relevance
  if (questionId && questionContextData) {
    ContextProcessor.analyzeAdQuestionRelevance(
      adContent,
      questionId,
      questionContextData
    );
  }
  
  // Track in user journey
  JourneyProcessor.trackSessionStep(
    sessionId,
    SessionActionType.VIEW_AD,
    PageType.CURRENT,  // Use current page type
    placementId, // Use placement as the pageId
    {
      adId,
      impressionId,
      questionId
    }
  );
  
  return impressionId;
}

/**
 * Track ad engagement with all analytics processors
 */
export function trackAdEngagement(
  sessionId: string,
  adId: string,
  impressionId: string,
  engagementType: string,
  metadata: Record<string, any> = {}
): string {
  // Track in EngagementProcessor
  const engagementId = EngagementProcessor.startEngagementSession(
    adId,
    impressionId,
    engagementType,
    metadata
  );
  
  // Track in user journey
  JourneyProcessor.trackSessionStep(
    sessionId,
    SessionActionType.INTERACT_WITH_AD,
    PageType.CURRENT,
    'ad_engagement',
    {
      adId,
      impressionId,
      engagementId,
      engagementType,
      ...metadata
    }
  );
  
  return engagementId;
}

/**
 * Complete an ad engagement
 */
export function completeAdEngagement(
  engagementId: string,
  completionData: Record<string, any> = {}
): void {
  // End the engagement session
  EngagementProcessor.endEngagementSession(
    engagementId,
    completionData
  );
}

/**
 * Centralized error reporting for analytics failures
 */
export function reportAnalyticsError(
  component: string,
  errorType: string,
  errorDetails: any
): void {
  console.error(`Analytics Error in ${component}: ${errorType}`, errorDetails);
  
  // In a real system, you would log this to a monitoring service
  // but avoid including any PII/PHI in the error report
} 