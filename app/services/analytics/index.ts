/**
 * Analytics Service
 * 
 * Main integration point for analytics within the OpenEvidence platform.
 * Provides a simple, unified interface for tracking events while ensuring
 * HIPAA compliance and physician privacy.
 */

import { initializeAnalyticsProcessors, recordPageView, trackQuestionAnswerFlow, trackAdDisplay, trackAdEngagement, completeAdEngagement } from './processors/AnalyticsProcessorIndex';
import * as DataStore from './dataStore';
import { PageType, SessionActionType } from '../../models/analytics/UserJourneyMetrics';
import { v4 as uuidv4 } from 'uuid';

/**
 * Analytics configuration interface
 */
interface AnalyticsConfig {
  privacyCompliant: boolean;
  syncInterval: number;
  batchSize: number;
  autoTimeoutMinutes: number;
  retentionDays: number;
  apiEndpoint?: string;
  autoStartSession?: boolean;
  privacyMode?: "standard" | "enhanced";
}

// Configuration
const DEFAULT_CONFIG: AnalyticsConfig = {
  privacyCompliant: true,
  syncInterval: 60, // seconds
  batchSize: 20,
  autoTimeoutMinutes: 30,
  retentionDays: 90
};

// Analytics service singleton
let initialized = false;
let currentSessionId: string | null = null;
let privacyMode = true;

/**
 * Initialize the analytics service
 */
export async function initialize(config: Partial<AnalyticsConfig> = {}): Promise<void> {
  if (initialized) {
    console.warn('Analytics service already initialized');
    return;
  }
  
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Initialize data store
  await DataStore.initDataStore({
    databaseName: 'open_evidence_analytics',
    apiEndpoint: mergedConfig.apiEndpoint,
    batchSize: mergedConfig.batchSize,
    syncInterval: mergedConfig.syncInterval,
    retentionDays: mergedConfig.retentionDays,
    privacyMode: mergedConfig.privacyMode || (mergedConfig.privacyCompliant ? "enhanced" : "standard")
  });
  
  // Initialize processors
  await initializeAnalyticsProcessors(mergedConfig);
  
  // Start session if auto start is enabled
  if (mergedConfig.autoStartSession) {
    startSession();
  }
  
  initialized = true;
  privacyMode = mergedConfig.privacyCompliant;
  
  console.log('Analytics service initialized in', 
    privacyMode ? 'privacy-compliant mode' : 'standard mode');
}

/**
 * Start a new analytics session
 */
export function startSession(): string {
  // Import JourneyProcessor dynamically to avoid circular imports
  const { JourneyProcessor } = require('./processors/AnalyticsProcessorIndex');
  
  // Create a new session
  const sessionId = JourneyProcessor.startSession(privacyMode);
  currentSessionId = sessionId;
  
  return sessionId;
}

/**
 * End the current analytics session
 */
export function endSession(reason = 'manual'): void {
  if (!currentSessionId) {
    console.warn('No active session to end');
    return;
  }
  
  // Import JourneyProcessor dynamically to avoid circular imports
  const { JourneyProcessor } = require('./processors/AnalyticsProcessorIndex');
  
  // End the session
  JourneyProcessor.endSession(currentSessionId, reason);
  currentSessionId = null;
}

/**
 * Track a page view
 */
export function trackPageView(
  pageId: string,
  pageType: PageType,
  metadata: Record<string, any> = {}
): void {
  ensureSession();
  
  if (currentSessionId) {
    recordPageView(
      pageId,
      pageType,
      currentSessionId,
      sanitizeMetadata(metadata)
    );
  }
}

/**
 * Track a question being asked
 */
export function trackQuestion(
  questionId: string,
  questionText: string,
  metadata: Record<string, any> = {}
): void {
  ensureSession();
  
  if (currentSessionId) {
    trackQuestionAnswerFlow(
      currentSessionId,
      questionId,
      questionText,
      sanitizeMetadata(metadata)
    );
  }
}

/**
 * Track an ad being displayed
 */
export function trackAd(
  adId: string,
  adContent: any,
  placementId: string,
  metadata: Record<string, any> = {}
): string | null {
  ensureSession();
  
  if (currentSessionId) {
    return trackAdDisplay(
      currentSessionId,
      adId,
      adContent,
      placementId,
      metadata.questionId,
      metadata.questionContext
    );
  }
  
  return null;
}

/**
 * Track an engagement with an ad
 */
export function trackAdInteraction(
  adId: string,
  impressionId: string,
  interactionType: string,
  metadata: Record<string, any> = {}
): string | null {
  ensureSession();
  
  if (currentSessionId) {
    return trackAdEngagement(
      currentSessionId,
      adId,
      impressionId,
      interactionType,
      sanitizeMetadata(metadata)
    );
  }
  
  return null;
}

/**
 * Complete an ad interaction
 */
export function completeAdInteraction(
  engagementId: string,
  metadata: Record<string, any> = {}
): void {
  completeAdEngagement(
    engagementId,
    sanitizeMetadata(metadata)
  );
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  category: string,
  metadata: Record<string, any> = {}
): void {
  ensureSession();
  
  // Import needed modules dynamically
  const { createAnalyticsEvent, AnalyticsEventCategory } = require('../../models/analytics/AnalyticsEvent');
  
  // Create and store event
  const event = createAnalyticsEvent(
    eventName,
    category as any,
    {
      sessionId: currentSessionId
    },
    sanitizeMetadata(metadata)
  );
  
  DataStore.storeEvent(event);
}

/**
 * Get the current session ID
 */
export function getSessionId(): string | null {
  return currentSessionId;
}

/**
 * Ensure there is an active session, creating one if needed
 */
function ensureSession(): void {
  if (!initialized) {
    console.warn('Analytics service not initialized, auto-initializing with default config');
    initialize();
  }
  
  if (!currentSessionId) {
    startSession();
  }
}

/**
 * Sanitize metadata to maintain privacy compliance
 */
function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  if (!privacyMode) {
    return metadata;
  }
  
  // Filter out potential PII
  const sanitized: Record<string, any> = {};
  
  // Whitelist approach - only copy known safe fields
  const safeKeys = [
    'id', 'type', 'category', 'questionId', 'answerId', 'adId', 
    'impressionId', 'placementId', 'interactionType', 'duration',
    'completed', 'success', 'value', 'count', 'position',
    'referrer', 'source', 'target', 'page', 'component',
    'questionContext' // Context data is already sanitized
  ];
  
  for (const key of Object.keys(metadata)) {
    if (safeKeys.includes(key)) {
      sanitized[key] = metadata[key];
    }
  }
  
  return sanitized;
}

// Export the DataStore for direct access if needed
export { DataStore }; 