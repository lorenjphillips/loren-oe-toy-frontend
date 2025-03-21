/**
 * Journey Processor
 * 
 * Tracks user journeys through the OpenEvidence platform.
 * Maintains anonymity and HIPAA compliance by focusing on flow patterns
 * rather than identifiable information.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  AnalyticsEvent, 
  AnalyticsEventCategory, 
  createAnalyticsEvent 
} from '../../../models/analytics/AnalyticsEvent';
import {
  SessionActionType,
  PageType,
  SessionStep,
  UserJourneyData,
  SessionStartEvent,
  SessionStepEvent,
  SessionEndEvent,
  QuestionFlowEvent,
  AggregateJourneyMetrics
} from '../../../models/analytics/UserJourneyMetrics';
import * as DataStore from '../dataStore';

// Map to track active sessions
const activeSessions = new Map<string, {
  sessionId: string;
  startTime: number;
  steps: SessionStep[];
  currentPage?: string;
  lastActivity: number;
  anonymous: boolean;
}>();

/**
 * Start tracking a new user session
 */
export function startSession(anonymous: boolean = true): string {
  const sessionId = uuidv4();
  const startTime = Date.now();
  
  // Initialize session data
  activeSessions.set(sessionId, {
    sessionId,
    startTime,
    steps: [],
    lastActivity: startTime,
    anonymous
  });
  
  // Create session start event
  const event: SessionStartEvent = createAnalyticsEvent(
    'session_start',
    AnalyticsEventCategory.JOURNEY,
    {
      referrer: document.referrer || 'direct',
      userAgent: anonymous ? 'anonymous' : getUserAgentCategory(),
      sessionType: 'web'
    },
    {
      sessionId,
      timestamp: startTime,
      anonymous
    }
  ) as SessionStartEvent;
  
  // Store the event
  DataStore.storeEvent(event);
  
  return sessionId;
}

/**
 * Track a step in the user's journey
 */
export function trackSessionStep(
  sessionId: string,
  actionType: SessionActionType,
  pageType: PageType,
  pageId: string,
  metadata: Record<string, any> = {}
): void {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    console.warn('Trying to track step for inactive session', sessionId);
    return;
  }
  
  const timestamp = Date.now();
  
  // Update session data
  const step: SessionStep = {
    stepId: uuidv4(),
    timestamp,
    actionType,
    pageType,
    pageId,
    durationSinceLast: timestamp - session.lastActivity,
    metadata: sanitizeMetadata(metadata, session.anonymous)
  };
  
  session.steps.push(step);
  session.lastActivity = timestamp;
  session.currentPage = pageId;
  
  // Create step event
  const event: SessionStepEvent = createAnalyticsEvent(
    'session_step',
    AnalyticsEventCategory.JOURNEY,
    {
      actionType,
      pageType
    },
    {
      sessionId,
      timestamp,
      step
    }
  ) as SessionStepEvent;
  
  // Store the event
  DataStore.storeEvent(event);
  
  // If this is a question event, track it specifically
  if (pageType === PageType.QUESTION || 
      pageType === PageType.ANSWER || 
      actionType === SessionActionType.ASK_QUESTION ||
      actionType === SessionActionType.VIEW_ANSWER) {
    trackQuestionFlow(sessionId, step);
  }
}

/**
 * End a user session and calculate metrics
 */
export function endSession(sessionId: string, reason: string = 'manual'): void {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    console.warn('Trying to end inactive session', sessionId);
    return;
  }
  
  const endTime = Date.now();
  const duration = endTime - session.startTime;
  
  // Calculate session metrics
  const pageCount = new Set(session.steps.map(step => step.pageId)).size;
  const actionCount = session.steps.length;
  const questionPageViews = session.steps.filter(step => 
    step.pageType === PageType.QUESTION
  ).length;
  const answerPageViews = session.steps.filter(step => 
    step.pageType === PageType.ANSWER
  ).length;
  const adInteractions = session.steps.filter(step => 
    step.actionType === SessionActionType.INTERACT_WITH_AD
  ).length;
  
  // Create journey data
  const journeyData: UserJourneyData = {
    sessionId,
    startTime: session.startTime,
    endTime,
    duration,
    stepCount: session.steps.length,
    pagesVisited: pageCount,
    completedQuestions: answerPageViews,
    adImpressions: session.steps.filter(step => 
      step.actionType === SessionActionType.VIEW_AD
    ).length,
    adInteractions,
    adInteractionRate: adInteractions / session.steps.length,
    bounced: session.steps.length <= 1,
    entryPage: session.steps.length > 0 ? session.steps[0].pageId : undefined,
    exitPage: session.currentPage,
    endReason: reason
  };
  
  // Create session end event
  const event: SessionEndEvent = createAnalyticsEvent(
    'session_end',
    AnalyticsEventCategory.JOURNEY,
    {
      reason,
      duration,
      pageCount,
      stepCount: session.steps.length
    },
    journeyData
  ) as SessionEndEvent;
  
  // Store the event
  DataStore.storeEvent(event);
  
  // Update aggregate metrics
  updateSessionAggregates(journeyData);
  
  // Remove session from active sessions
  activeSessions.delete(sessionId);
}

/**
 * Track a question flow event
 */
function trackQuestionFlow(sessionId: string, step: SessionStep): void {
  if (!step.metadata || !step.metadata.questionId) {
    return;
  }
  
  const session = activeSessions.get(sessionId);
  if (!session) return;
  
  const questionId = step.metadata.questionId;
  
  // Find previous steps related to this question
  const questionSteps = session.steps.filter(s => 
    s.metadata && s.metadata.questionId === questionId
  );
  
  // Calculate current question flow metrics
  const startTime = questionSteps.length > 0 ? 
    questionSteps[0].timestamp : step.timestamp;
  
  const duration = step.timestamp - startTime;
  
  const hasViewedAnswer = questionSteps.some(s => 
    s.pageType === PageType.ANSWER || 
    s.actionType === SessionActionType.VIEW_ANSWER
  );
  
  const hasInteractedWithAd = questionSteps.some(s => 
    s.actionType === SessionActionType.INTERACT_WITH_AD &&
    s.metadata && s.metadata.questionId === questionId
  );
  
  // Create question flow event
  const event: QuestionFlowEvent = createAnalyticsEvent(
    'question_flow',
    AnalyticsEventCategory.JOURNEY,
    {
      questionId,
      action: step.actionType
    },
    {
      sessionId,
      questionId,
      startTime,
      currentTime: step.timestamp,
      duration,
      stepCount: questionSteps.length + 1,
      currentAction: step.actionType,
      hasViewedAnswer,
      hasInteractedWithAd,
      stepsInFlow: [...questionSteps, step].map(s => ({
        actionType: s.actionType,
        timestamp: s.timestamp
      }))
    }
  ) as QuestionFlowEvent;
  
  // Store the event
  DataStore.storeEvent(event);
}

/**
 * Track feature usage in the platform
 */
export function trackFeatureUsage(
  sessionId: string,
  featureName: string,
  featureCategory: string,
  action: string,
  metadata: Record<string, any> = {}
): void {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    console.warn('Trying to track feature usage for inactive session', sessionId);
    return;
  }
  
  const timestamp = Date.now();
  
  // Create feature usage event
  const event = createAnalyticsEvent(
    'feature_usage',
    AnalyticsEventCategory.JOURNEY,
    {
      feature: featureName,
      category: featureCategory,
      action
    },
    {
      sessionId,
      timestamp,
      featureName,
      featureCategory,
      action,
      metadata: sanitizeMetadata(metadata, session.anonymous)
    }
  );
  
  // Store the event
  DataStore.storeEvent(event);
}

/**
 * Auto-timeout sessions that have been inactive
 */
export function autoTimeoutSessions(inactiveMinutes: number = 30): void {
  const now = Date.now();
  const timeoutThreshold = now - (inactiveMinutes * 60 * 1000);
  
  // Check each active session
  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.lastActivity < timeoutThreshold) {
      endSession(sessionId, 'timeout');
    }
  }
}

/**
 * Sanitize metadata to ensure no PII is included
 */
function sanitizeMetadata(
  metadata: Record<string, any>,
  anonymous: boolean
): Record<string, any> {
  // If anonymous mode, remove all potentially identifying fields
  if (anonymous) {
    const sanitized: Record<string, any> = {};
    
    // Whitelist of safe keys that don't contain PII
    const safeKeys = [
      'questionId', 
      'answerId', 
      'adId',
      'pageId',
      'category',
      'type',
      'action',
      'position',
      'viewable',
      'duration',
      'count',
      'success',
      'error',
      'value'
    ];
    
    // Only copy safe keys
    for (const key of safeKeys) {
      if (metadata[key] !== undefined) {
        sanitized[key] = metadata[key];
      }
    }
    
    return sanitized;
  }
  
  // Even in identified mode, sanitize known PII fields
  const result = { ...metadata };
  
  const piiFields = [
    'email', 
    'username', 
    'name', 
    'firstName', 
    'lastName',
    'phone',
    'address',
    'ip',
    'location'
  ];
  
  // Remove PII fields
  for (const field of piiFields) {
    delete result[field];
  }
  
  return result;
}

/**
 * Get user agent category without storing the actual user agent
 */
function getUserAgentCategory(): string {
  const ua = navigator.userAgent;
  
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Mac OS X/.test(ua)) return 'mac';
  if (/Linux/.test(ua)) return 'linux';
  
  return 'other';
}

/**
 * Update journey aggregate metrics
 */
function updateSessionAggregates(journeyData: UserJourneyData): void {
  // Aggregate ID based on day
  const today = new Date().toISOString().split('T')[0];
  const aggregateId = `journey_metrics_${today}`;
  
  // Update the aggregate data
  DataStore.updateAggregateData(
    aggregateId,
    'journey_metrics',
    (currentData: AggregateJourneyMetrics | null) => {
      // Initialize if not exists
      if (!currentData) {
        return {
          date: today,
          totalSessions: 1,
          totalSessionDuration: journeyData.duration,
          averageSessionDuration: journeyData.duration,
          bounceCount: journeyData.bounced ? 1 : 0,
          bounceRate: journeyData.bounced ? 1 : 0,
          totalPageViews: journeyData.pagesVisited,
          avgPagesPerSession: journeyData.pagesVisited,
          entryPageCounts: {
            [journeyData.entryPage || 'unknown']: 1
          },
          exitPageCounts: {
            [journeyData.exitPage || 'unknown']: 1
          },
          totalAdImpressions: journeyData.adImpressions || 0,
          totalAdInteractions: journeyData.adInteractions || 0,
          adInteractionRate: journeyData.adInteractionRate || 0,
          totalQuestions: journeyData.completedQuestions || 0,
          avgQuestionsPerSession: journeyData.completedQuestions || 0
        };
      }
      
      // Update existing data
      const data = { ...currentData };
      
      // Update session counts
      data.totalSessions += 1;
      data.totalSessionDuration += journeyData.duration;
      data.averageSessionDuration = data.totalSessionDuration / data.totalSessions;
      
      // Update bounce metrics
      if (journeyData.bounced) {
        data.bounceCount += 1;
      }
      data.bounceRate = data.bounceCount / data.totalSessions;
      
      // Update page metrics
      data.totalPageViews += journeyData.pagesVisited;
      data.avgPagesPerSession = data.totalPageViews / data.totalSessions;
      
      // Update entry page counts
      if (journeyData.entryPage) {
        data.entryPageCounts[journeyData.entryPage] = 
          (data.entryPageCounts[journeyData.entryPage] || 0) + 1;
      }
      
      // Update exit page counts
      if (journeyData.exitPage) {
        data.exitPageCounts[journeyData.exitPage] = 
          (data.exitPageCounts[journeyData.exitPage] || 0) + 1;
      }
      
      // Update ad metrics
      data.totalAdImpressions += journeyData.adImpressions || 0;
      data.totalAdInteractions += journeyData.adInteractions || 0;
      data.adInteractionRate = data.totalAdInteractions / 
        (data.totalAdImpressions || 1); // Avoid division by zero
      
      // Update question metrics
      data.totalQuestions += journeyData.completedQuestions || 0;
      data.avgQuestionsPerSession = data.totalQuestions / data.totalSessions;
      
      return data;
    }
  );
} 