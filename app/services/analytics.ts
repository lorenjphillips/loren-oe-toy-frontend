/**
 * Analytics Service
 * 
 * Provides functionality for tracking ad performance and user engagement.
 * Captures impression events, view duration, engagement events, and context data.
 */

import { v4 as uuidv4 } from 'uuid';
import { AdContent, TreatmentCategory } from '../models/adTypes';
import { AdType } from '../types/ad';

// Create a directory for storing analytics data if not available locally
let sessionId: string;

// Unique session identifier for this browser session
if (typeof window !== 'undefined') {
  sessionId = sessionStorage.getItem('analytics_session_id') || uuidv4();
  sessionStorage.setItem('analytics_session_id', sessionId);
} else {
  sessionId = uuidv4(); // Fallback for SSR
}

/**
 * Types of events that can be tracked
 */
export enum AnalyticsEventType {
  IMPRESSION_START = 'impression_start',
  IMPRESSION_END = 'impression_end',
  VISIBILITY_CHANGE = 'visibility_change',
  HOVER = 'hover',
  CLICK = 'click',
  CTA_CLICK = 'cta_click',
  RENDER_PERFORMANCE = 'render_performance',
  SCROLL_INTO_VIEW = 'scroll_into_view',
  SCROLL_OUT_OF_VIEW = 'scroll_out_of_view',
  AD_LOADED = 'ad_loaded',
  AD_ERROR = 'ad_error',
  AD_CLOSED = 'ad_closed',
  // Phase 2 analytics events
  MICROSIMULATION_START = 'microsimulation_start',
  MICROSIMULATION_STEP = 'microsimulation_step',
  MICROSIMULATION_DECISION = 'microsimulation_decision',
  MICROSIMULATION_CONTENT_VIEW = 'microsimulation_content_view',
  MICROSIMULATION_COMPLETE = 'microsimulation_complete',
  KNOWLEDGE_NODE_EXPLORE = 'knowledge_node_explore',
  KNOWLEDGE_ZOOM = 'knowledge_zoom',
  KNOWLEDGE_NAVIGATION = 'knowledge_navigation', 
  KNOWLEDGE_TREATMENT_FOCUS = 'knowledge_treatment_focus',
  KNOWLEDGE_RELATIONSHIP_CLICK = 'knowledge_relationship_click',
  FORMAT_ENGAGEMENT = 'format_engagement',
  FORMAT_COMPLETION = 'format_completion',
  QUESTION_TYPE_CORRELATION = 'question_type_correlation',
  // Phase 4 analytics events
  ETHICAL_BLOCK = 'ethical_block',
  CLINICAL_INFO_TOGGLE = 'clinical_info_toggle',
  FEEDBACK_SUBMIT = 'feedback_submit'
}

/**
 * Visibility states for the ad
 */
export enum VisibilityState {
  VISIBLE = 'visible',
  PARTIALLY_VISIBLE = 'partially_visible',
  HIDDEN = 'hidden'
}

/**
 * Knowledge graph interaction types for analytics
 */
export enum KnowledgeGraphInteractionType {
  NODE_CLICK = 'node_click',
  EDGE_CLICK = 'edge_click',
  EXPAND = 'expand',
  COLLAPSE = 'collapse',
  ZOOM = 'zoom',
  PAN = 'pan',
  FILTER = 'filter',
  SEARCH = 'search',
  RESET = 'reset',
  // Phase 2 interaction types
  NODE_FOCUS = 'node_focus',
  NODE_COMPARE = 'node_compare',
  TREATMENT_FOCUS = 'treatment_focus',
  PATH_TRACE = 'path_trace',
  ZOOM_IN = 'zoom_in',
  ZOOM_OUT = 'zoom_out',
  RELATIONSHIP_EXPLORE = 'relationship_explore'
}

/**
 * Interface for analytics events
 */
export interface AnalyticsEvent {
  id: string;                     // Unique event ID
  type: AnalyticsEventType;       // Type of event
  timestamp: number;              // When the event occurred (ms since epoch)
  sessionId: string;              // Anonymous session identifier
  
  // Ad-related data
  adId?: string;                  // Ad content ID
  adType?: AdType;                // Type of ad (text, banner, etc)
  companyId?: string;             // Company ID
  companyName?: string;           // Company name
  templateType?: string;          // Template used for rendering
  
  // Question and context data
  questionCategory?: string;      // Medical category of the question
  treatmentCategory?: string;     // Treatment category ID
  confidenceScore?: number;       // Confidence score for ad relevance
  
  // Engagement metrics
  durationMs?: number;            // Duration in milliseconds (if applicable)
  visibilityState?: VisibilityState; // Visibility state
  viewportPercentage?: number;    // Percentage of ad in viewport (0-100)
  
  // Performance metrics
  renderTimeMs?: number;          // Time to render the ad
  loadTimeMs?: number;            // Time to load ad content
  
  // Interaction data
  interactionType?: string;       // Type of interaction (if applicable)
  target?: string;                // Element interacted with
  position?: { x: number, y: number }; // Position of interaction
  
  // Additional custom data
  metadata?: Record<string, any>; // Any additional custom data
}

/**
 * Analytics options that can be configured
 */
export interface AnalyticsOptions {
  endpoint?: string;             // Backend endpoint for sending events
  batchSize?: number;            // Number of events to batch before sending
  sendIntervalMs?: number;       // How often to send events (ms)
  samplingRate?: number;         // Rate at which to sample events (0-1)
  debugMode?: boolean;           // Whether to log events to console
  disableAnalytics?: boolean;    // Whether analytics are disabled entirely
}

// Default options
const DEFAULT_OPTIONS: AnalyticsOptions = {
  endpoint: '/api/analytics/events',
  batchSize: 10,
  sendIntervalMs: 30000, // 30 seconds
  samplingRate: 1.0,     // Collect all events
  debugMode: false,
  disableAnalytics: false
};

// Current options
let analyticsOptions: AnalyticsOptions = { ...DEFAULT_OPTIONS };

/**
 * Configure analytics options
 */
export function configureAnalytics(options: Partial<AnalyticsOptions>): void {
  analyticsOptions = {
    ...analyticsOptions,
    ...options
  };
}

/**
 * Create a new analytics event
 */
export function createEvent(
  type: AnalyticsEventType,
  data: Partial<AnalyticsEvent> = {}
): AnalyticsEvent {
  return {
    id: uuidv4(),
    type,
    timestamp: Date.now(),
    sessionId,
    ...data
  };
}

/**
 * Track an impression start event
 */
export function trackImpressionStart(
  adContent: AdContent,
  confidenceScore?: number
): string {
  const eventId = uuidv4();
  
  const event = createEvent(AnalyticsEventType.IMPRESSION_START, {
    id: eventId,
    adId: adContent.id,
    adType: adContent.type,
    companyId: adContent.company.id,
    companyName: adContent.company.name,
    questionCategory: adContent.treatmentCategory.medicalCategory,
    treatmentCategory: adContent.treatmentCategory.id,
    confidenceScore,
    metadata: {
      adName: adContent.name,
      isActive: adContent.isActive,
      priority: adContent.metadata.priority,
      campaignId: adContent.metadata.campaignId
    }
  });
  
  // Dispatch to analytics store
  dispatchAnalyticsEvent(event);
  
  return eventId;
}

/**
 * Track an impression end event
 */
export function trackImpressionEnd(
  impressionId: string,
  adId: string,
  durationMs: number
): void {
  const event = createEvent(AnalyticsEventType.IMPRESSION_END, {
    adId,
    durationMs,
    metadata: {
      impressionId
    }
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track visibility changes
 */
export function trackVisibilityChange(
  adId: string,
  visibilityState: VisibilityState,
  viewportPercentage: number
): void {
  const event = createEvent(AnalyticsEventType.VISIBILITY_CHANGE, {
    adId,
    visibilityState,
    viewportPercentage
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track hover events
 */
export function trackHover(
  adId: string,
  target: string,
  position?: { x: number, y: number }
): void {
  const event = createEvent(AnalyticsEventType.HOVER, {
    adId,
    target,
    position
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track click events
 */
export function trackClick(
  adId: string,
  target: string,
  interactionType?: string,
  position?: { x: number, y: number }
): void {
  const event = createEvent(AnalyticsEventType.CLICK, {
    adId,
    target,
    interactionType,
    position
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track CTA click events
 */
export function trackCTAClick(
  adId: string,
  companyId: string,
  impressionId: string
): void {
  const event = createEvent(AnalyticsEventType.CTA_CLICK, {
    adId,
    companyId,
    metadata: {
      impressionId
    }
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track render performance
 */
export function trackRenderPerformance(
  adId: string,
  renderTimeMs: number,
  loadTimeMs?: number
): void {
  const event = createEvent(AnalyticsEventType.RENDER_PERFORMANCE, {
    adId,
    renderTimeMs,
    loadTimeMs
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track when ad scrolls into view
 */
export function trackScrollIntoView(
  adId: string,
  viewportPercentage: number
): void {
  const event = createEvent(AnalyticsEventType.SCROLL_INTO_VIEW, {
    adId,
    viewportPercentage
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track when ad scrolls out of view
 */
export function trackScrollOutOfView(
  adId: string,
  durationMs: number
): void {
  const event = createEvent(AnalyticsEventType.SCROLL_OUT_OF_VIEW, {
    adId,
    durationMs
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track a knowledge graph visualization being shown
 */
export function trackKnowledgeGraphVisualization(
  graphId: string,
  questionContext: string,
  graphSize: { nodes: number, relationships: number },
  pharmaCompanies: string[],
  sessionId: string
): string {
  const eventId = uuidv4();
  
  const event: AnalyticsEvent = {
    id: eventId,
    type: AnalyticsEventType.IMPRESSION_START,
    timestamp: Date.now(),
    sessionId,
    target: 'knowledge_graph',
    metadata: {
      graphId,
      questionContext,
      nodeCount: graphSize.nodes,
      relationshipCount: graphSize.relationships,
      pharmaCompanies,
      contentType: 'knowledge_graph'
    }
  };
  
  dispatchAnalyticsEvent(event);
  
  return eventId;
}

/**
 * Track an interaction with a knowledge graph node
 */
export function trackKnowledgeGraphNodeInteraction(
  graphId: string,
  nodeId: string,
  nodeType: string,
  interactionType: KnowledgeGraphInteractionType,
  sessionId: string,
  position?: { x: number, y: number }
): void {
  const event: AnalyticsEvent = {
    id: uuidv4(),
    type: AnalyticsEventType.CLICK,
    timestamp: Date.now(),
    sessionId,
    target: 'knowledge_graph_node',
    interactionType: interactionType,
    position,
    metadata: {
      graphId,
      nodeId,
      nodeType,
      interactionType
    }
  };
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track an interaction with a knowledge graph relationship
 */
export function trackKnowledgeGraphRelationshipInteraction(
  graphId: string,
  relationshipId: string,
  relationshipType: string,
  sourceNodeId: string, 
  targetNodeId: string,
  interactionType: KnowledgeGraphInteractionType,
  sessionId: string,
  position?: { x: number, y: number }
): void {
  const event: AnalyticsEvent = {
    id: uuidv4(),
    type: AnalyticsEventType.CLICK,
    timestamp: Date.now(),
    sessionId,
    target: 'knowledge_graph_relationship',
    interactionType: interactionType,
    position,
    metadata: {
      graphId,
      relationshipId,
      relationshipType,
      sourceNodeId,
      targetNodeId,
      interactionType
    }
  };
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track a navigation event within a knowledge graph
 */
export function trackKnowledgeGraphNavigation(
  graphId: string,
  navigationType: 'zoom' | 'pan' | 'reset' | 'filter',
  detail: Record<string, any>,
  sessionId: string
): void {
  const event: AnalyticsEvent = {
    id: uuidv4(),
    type: AnalyticsEventType.CLICK,
    timestamp: Date.now(),
    sessionId,
    target: 'knowledge_graph_navigation',
    interactionType: navigationType,
    metadata: {
      graphId,
      navigationType,
      ...detail
    }
  };
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track the end of a knowledge graph visualization session
 */
export function trackKnowledgeGraphEnd(
  graphId: string,
  impressionId: string,
  durationMs: number,
  interactionStats: {
    nodeClicks: number,
    relationshipClicks: number,
    navigationEvents: number,
    expandEvents: number,
    totalInteractions: number
  },
  sessionId: string
): void {
  // Track the end of the impression
  trackImpressionEnd(impressionId, graphId, durationMs);
  
  // Track additional knowledge graph specific metrics
  const event: AnalyticsEvent = {
    id: uuidv4(),
    type: AnalyticsEventType.IMPRESSION_END,
    timestamp: Date.now(),
    sessionId,
    target: 'knowledge_graph',
    durationMs,
    metadata: {
      graphId,
      impressionId,
      interactionStats,
      avgInteractionTimeMs: interactionStats.totalInteractions > 0 
        ? durationMs / interactionStats.totalInteractions 
        : 0,
      contentType: 'knowledge_graph'
    }
  };
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track pharma affiliations displayed in a knowledge graph
 */
export function trackPharmaAffiliationsViewed(
  graphId: string,
  pharmaCompanies: { id: string, name: string }[],
  treatmentCount: number,
  sessionId: string
): void {
  const event: AnalyticsEvent = {
    id: uuidv4(),
    type: AnalyticsEventType.IMPRESSION_START,
    timestamp: Date.now(),
    sessionId,
    target: 'pharma_affiliations',
    metadata: {
      graphId,
      pharmaCompanies: pharmaCompanies.map(p => p.id),
      pharmaCompanyNames: pharmaCompanies.map(p => p.name),
      treatmentCount,
      contentType: 'pharma_affiliations'
    }
  };
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track microsimulation start event
 */
export function trackMicrosimulationStart(
  simulationId: string,
  questionContext: string,
  simulationType: string,
  expectedStepCount: number,
  userId?: string,
  sessionId?: string,
  metadata?: Record<string, any>
): string {
  const eventId = uuidv4();
  
  const event = createEvent(AnalyticsEventType.MICROSIMULATION_START, {
    id: eventId,
    sessionId: sessionId || sessionId,
    metadata: {
      simulationId,
      questionContext,
      simulationType,
      expectedStepCount,
      userId,
      startTimestamp: Date.now()
    }
  });
  
  dispatchAnalyticsEvent(event);
  return eventId;
}

/**
 * Track microsimulation step completion
 */
export function trackMicrosimulationStep(
  simulationId: string,
  stepId: string,
  stepNumber: number,
  stepType: string,
  timeSpentMs: number,
  sessionId?: string,
  metadata?: Record<string, any>
): void {
  const event = createEvent(AnalyticsEventType.MICROSIMULATION_STEP, {
    sessionId: sessionId || sessionId,
    metadata: {
      simulationId,
      stepId,
      stepNumber,
      stepType,
      timeSpentMs,
      cumulativeTimeMs: metadata?.cumulativeTimeMs,
      previousStepId: metadata?.previousStepId
    }
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track a decision made in a microsimulation
 */
export function trackMicrosimulationDecision(
  simulationId: string,
  stepId: string,
  decisionId: string,
  decisionPath: string,
  timeToDecideMs: number,
  sessionId?: string,
  metadata?: Record<string, any>
): void {
  const event = createEvent(AnalyticsEventType.MICROSIMULATION_DECISION, {
    sessionId: sessionId || sessionId,
    metadata: {
      simulationId,
      stepId,
      decisionId,
      decisionPath,
      timeToDecideMs,
      optionsPresented: metadata?.optionsPresented,
      decisionRationale: metadata?.decisionRationale
    }
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track educational content viewed during simulation
 */
export function trackMicrosimulationContentView(
  simulationId: string,
  contentId: string,
  contentType: string,
  stepId: string,
  viewDurationMs: number,
  sessionId?: string,
  metadata?: Record<string, any>
): void {
  const event = createEvent(AnalyticsEventType.MICROSIMULATION_CONTENT_VIEW, {
    sessionId: sessionId || sessionId,
    metadata: {
      simulationId,
      contentId,
      contentType,
      stepId,
      viewDurationMs,
      contentTopic: metadata?.contentTopic,
      contentProvider: metadata?.contentProvider,
      completionPercentage: metadata?.completionPercentage
    }
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track microsimulation completion
 */
export function trackMicrosimulationComplete(
  simulationId: string,
  totalTimeMs: number,
  completedSteps: number,
  totalSteps: number,
  finalPath: string,
  sessionId?: string,
  metadata?: Record<string, any>
): void {
  const event = createEvent(AnalyticsEventType.MICROSIMULATION_COMPLETE, {
    sessionId: sessionId || sessionId,
    metadata: {
      simulationId, 
      totalTimeMs,
      completedSteps,
      totalSteps,
      completionRate: completedSteps / totalSteps,
      finalPath,
      averageTimePerStepMs: totalTimeMs / completedSteps,
      decisionsCount: metadata?.decisionsCount,
      contentViewsCount: metadata?.contentViewsCount
    }
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track treatment node focus time in knowledge graph
 */
export function trackKnowledgeTreatmentFocus(
  graphId: string,
  nodeId: string,
  treatmentName: string,
  focusDurationMs: number,
  companyId?: string,
  sessionId?: string,
  metadata?: Record<string, any>
): void {
  const event = createEvent(AnalyticsEventType.KNOWLEDGE_TREATMENT_FOCUS, {
    sessionId: sessionId || sessionId,
    metadata: {
      graphId,
      nodeId,
      treatmentName,
      focusDurationMs,
      companyId,
      contextCategory: metadata?.contextCategory,
      nodeDegree: metadata?.nodeDegree, // number of connections
      isHighlighted: metadata?.isHighlighted
    }
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track knowledge graph zoom and navigation patterns
 */
export function trackKnowledgeGraphZoomNavigation(
  graphId: string,
  navigationType: KnowledgeGraphInteractionType,
  zoomLevel: number,
  visibleNodes: number,
  sessionId?: string,
  metadata?: Record<string, any>
): void {
  const event = createEvent(AnalyticsEventType.KNOWLEDGE_ZOOM, {
    sessionId: sessionId || sessionId,
    metadata: {
      graphId,
      navigationType,
      zoomLevel,
      visibleNodes,
      centerNodeId: metadata?.centerNodeId,
      visibleRelationships: metadata?.visibleRelationships,
      navigationSequence: metadata?.navigationSequence
    }
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track ad format engagement metrics
 */
export function trackFormatEngagement(
  adId: string,
  formatType: string,
  engagementType: string,
  engagementDurationMs: number,
  questionType?: string,
  sessionId?: string,
  metadata?: Record<string, any>
): void {
  const event = createEvent(AnalyticsEventType.FORMAT_ENGAGEMENT, {
    sessionId: sessionId || sessionId,
    adId,
    metadata: {
      formatType,
      engagementType,
      engagementDurationMs,
      questionType,
      interactiveElements: metadata?.interactiveElements,
      userInteractions: metadata?.userInteractions,
      engagementDepth: metadata?.engagementDepth
    }
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track ad format completion rates
 */
export function trackFormatCompletion(
  adId: string,
  formatType: string,
  completionRate: number,
  totalDurationMs: number,
  questionType?: string,
  sessionId?: string,
  metadata?: Record<string, any>
): void {
  const event = createEvent(AnalyticsEventType.FORMAT_COMPLETION, {
    sessionId: sessionId || sessionId,
    adId,
    metadata: {
      formatType,
      completionRate,
      totalDurationMs,
      questionType,
      abandonment: metadata?.abandonment,
      abandonmentStep: metadata?.abandonmentStep,
      completionTimestamp: Date.now()
    }
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Track correlation between ad format and question type
 */
export function trackFormatQuestionCorrelation(
  adId: string,
  formatType: string,
  questionType: string,
  correlationScore: number,
  engagementRate: number,
  sessionId?: string,
  metadata?: Record<string, any>
): void {
  const event = createEvent(AnalyticsEventType.QUESTION_TYPE_CORRELATION, {
    sessionId: sessionId || sessionId,
    adId,
    metadata: {
      formatType,
      questionType,
      correlationScore,
      engagementRate,
      medicalSpecialty: metadata?.medicalSpecialty,
      demographicData: metadata?.demographicData,
      completionRate: metadata?.completionRate
    }
  });
  
  dispatchAnalyticsEvent(event);
}

/**
 * Dispatch an analytics event to the store
 */
export function dispatchAnalyticsEvent(event: AnalyticsEvent): void {
  // Skip if analytics are disabled
  if (analyticsOptions.disableAnalytics) {
    return;
  }
  
  // Apply sampling
  if (Math.random() > analyticsOptions.samplingRate!) {
    return;
  }
  
  // Log to console if in debug mode
  if (analyticsOptions.debugMode) {
    console.log('Analytics event:', event);
  }
  
  // Import store here to avoid circular dependencies
  import('../store/analyticsStore')
    .then(({ addEvent }) => {
      addEvent(event);
    })
    .catch(error => {
      console.error('Failed to dispatch analytics event:', error);
    });
}

/**
 * Create intersection observer to track ad visibility
 */
export function createVisibilityTracker(
  element: HTMLElement,
  adId: string,
  callback?: (visible: boolean, percentage: number) => void
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        const percentage = Math.floor(entry.intersectionRatio * 100);
        let visibilityState: VisibilityState;
        
        if (entry.intersectionRatio === 0) {
          visibilityState = VisibilityState.HIDDEN;
        } else if (entry.intersectionRatio === 1) {
          visibilityState = VisibilityState.VISIBLE;
        } else {
          visibilityState = VisibilityState.PARTIALLY_VISIBLE;
        }
        
        // Track visibility change
        trackVisibilityChange(adId, visibilityState, percentage);
        
        // Call the callback if provided
        if (callback) {
          callback(entry.isIntersecting, percentage);
        }
        
        // Track scroll into/out of view
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          trackScrollIntoView(adId, percentage);
        } else if (!entry.isIntersecting && entry.intersectionRatio === 0) {
          // Only track scroll out if it's completely out of view
          trackScrollOutOfView(adId, 0);
        }
      });
    },
    {
      threshold: [0, 0.25, 0.5, 0.75, 1.0],
      root: null,
      rootMargin: '0px'
    }
  );
  
  observer.observe(element);
  return observer;
}

/**
 * Measure performance metrics for ad rendering
 */
export function measureAdPerformance(
  adId: string,
  renderStartTime: number
): void {
  const renderEndTime = performance.now();
  const renderTimeMs = renderEndTime - renderStartTime;
  
  trackRenderPerformance(adId, renderTimeMs);
  
  // Report to browser's performance timeline if available
  if (window.performance && window.performance.mark) {
    window.performance.mark(`ad-render-complete-${adId}`);
    
    try {
      window.performance.measure(
        `ad-render-duration-${adId}`,
        `ad-render-start-${adId}`,
        `ad-render-complete-${adId}`
      );
    } catch (error) {
      console.error('Error measuring ad render performance:', error);
    }
  }
}

/**
 * Initialize performance measurement for ad rendering
 */
export function initAdPerformanceMeasurement(adId: string): number {
  // Mark the start time in the performance timeline if available
  if (window.performance && window.performance.mark) {
    window.performance.mark(`ad-render-start-${adId}`);
  }
  
  return performance.now();
}

// Export all functions
export default {
  trackImpressionStart,
  trackImpressionEnd,
  trackVisibilityChange,
  trackHover,
  trackClick,
  trackCTAClick,
  trackRenderPerformance,
  createVisibilityTracker,
  measureAdPerformance,
  initAdPerformanceMeasurement,
  configureAnalytics,
  createEvent,
  dispatchAnalyticsEvent,
  trackKnowledgeGraphVisualization,
  trackKnowledgeGraphNodeInteraction,
  trackKnowledgeGraphRelationshipInteraction,
  trackKnowledgeGraphNavigation,
  trackKnowledgeGraphEnd,
  trackPharmaAffiliationsViewed,
  trackMicrosimulationStart,
  trackMicrosimulationStep,
  trackMicrosimulationDecision,
  trackMicrosimulationContentView,
  trackMicrosimulationComplete,
  trackKnowledgeTreatmentFocus,
  trackKnowledgeGraphZoomNavigation,
  trackFormatEngagement,
  trackFormatCompletion,
  trackFormatQuestionCorrelation
}; 