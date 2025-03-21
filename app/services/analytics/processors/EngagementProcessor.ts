/**
 * Engagement Processor
 * 
 * Measures meaningful interactions with ads, including:
 * - Tracking interactive elements
 * - Measuring user engagement
 * - Tracking conversion events
 * - Measuring attention metrics
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  createAnalyticsEvent, 
  AnalyticsEventCategory 
} from '../../../models/analytics/AnalyticsEvent';
import {
  EngagementType,
  EngagementData,
  EngagementEvent,
  MicrosimulationEngagementData,
  KnowledgeGraphEngagementData,
  CTAEngagementData,
  MediaEngagementData,
  EngagementSession,
  AggregateEngagementMetrics
} from '../../../models/analytics/EngagementMetrics';
import * as DataStore from '../dataStore';

// Add missing EngagementType values
declare module '../../../models/analytics/EngagementMetrics' {
  export interface EngagementTypeAdditions {
    FORMAT_COMPLETION: 'format_completion'
  }
  
  export enum EngagementType {
    FORMAT_COMPLETION = 'format_completion'
  }
}

// Map to track active engagement sessions
const activeSessions = new Map<string, EngagementSession>();

/**
 * Start a new engagement session
 * 
 * @returns Engagement session ID
 */
export function startEngagementSession(
  adId: string,
  sessionContext?: Record<string, any>
): string {
  const sessionId = uuidv4();
  const startTime = Date.now();
  
  // Create new session
  const session: EngagementSession = {
    sessionId,
    adId,
    startTime,
    engagementSequence: [],
    completionRate: 0,
    engagementScore: 0
  };
  
  // Store in active sessions
  activeSessions.set(sessionId, session);
  
  // Create engagement start event
  const event = createAnalyticsEvent(
    'engagement_session_start',
    AnalyticsEventCategory.ENGAGEMENT,
    {
      page: 'current',
      component: 'ad'
    },
    {
      adId,
      sessionId,
      timestamp: startTime,
      ...sessionContext
    }
  );
  
  DataStore.storeEvent(event);
  
  return sessionId;
}

/**
 * End an engagement session
 */
export function endEngagementSession(
  engagementId: string,
  completionData: Record<string, any> = {}
): void {
  const session = activeSessions.get(engagementId);
  
  if (!session) {
    console.warn('Cannot end engagement session: ID not found', engagementId);
    return;
  }
  
  const endTime = Date.now();
  
  // Update session data
  session.endTime = endTime;
  session.durationMs = endTime - session.startTime;
  
  // Process completion data if provided
  if (completionData) {
    if (completionData.completed !== undefined) {
      session.completionRate = completionData.completed ? 1.0 : 0.0;
    }
    
    if (completionData.completionRate !== undefined) {
      session.completionRate = completionData.completionRate;
    }
    
    if (completionData.abandonmentPoint) {
      session.abandonmentPoint = completionData.abandonmentPoint;
    }
  }
  
  // Calculate metrics
  const metrics = calculateSessionMetrics(session);
  
  // Update with calculated metrics
  session.completionRate = metrics.completionRate;
  session.engagementScore = metrics.engagementScore;
  
  // Create engagement end event
  const event = createAnalyticsEvent(
    'engagement_session_end',
    AnalyticsEventCategory.ENGAGEMENT,
    {
      page: 'current',
      component: 'ad'
    },
    {
      sessionId: engagementId,
      adId: session.adId,
      timestamp: endTime,
      durationMs: session.durationMs,
      completionRate: session.completionRate,
      engagementScore: session.engagementScore,
      engagementCount: session.engagementSequence.length,
      ...completionData
    }
  );
  
  DataStore.storeEvent(event);
  
  // Update aggregates
  updateEngagementAggregates(session, metrics);
  
  // Remove from active sessions
  activeSessions.delete(engagementId);
}

/**
 * Track a microsimulation engagement
 */
export function trackMicrosimulationEngagement(
  sessionId: string,
  data: Partial<MicrosimulationEngagementData>
): string {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    console.warn('Cannot track microsimulation: session ID not found', sessionId);
    return '';
  }
  
  const engagementId = uuidv4();
  const timestamp = Date.now();
  
  // Create engagement data
  const engagementData: MicrosimulationEngagementData = {
    adId: session.adId,
    engagementType: data.engagementType || EngagementType.MICROSIM_START,
    engagementTime: timestamp,
    simulationId: data.simulationId || 'unknown',
    simulationType: data.simulationType || 'unknown',
    stepId: data.stepId,
    stepNumber: data.stepNumber,
    totalSteps: data.totalSteps,
    decisionPath: data.decisionPath,
    completionPercentage: data.completionPercentage,
    timeSpentMs: data.timeSpentMs,
    ...data
  };
  
  // Create engagement event
  const event = createAnalyticsEvent(
    'microsimulation_engagement',
    AnalyticsEventCategory.ENGAGEMENT,
    {
      page: 'current',
      component: 'microsimulation'
    },
    engagementData
  );
  
  DataStore.storeEvent(event);
  
  // Add to session engagement sequence
  session.engagementSequence.push({
    type: engagementData.engagementType,
    timestamp,
    durationMs: data.timeSpentMs,
    metadata: {
      simulationType: data.simulationType,
      stepNumber: data.stepNumber,
      completionPercentage: data.completionPercentage
    }
  });
  
  // Update session
  activeSessions.set(sessionId, session);
  
  return engagementId;
}

/**
 * Track a knowledge graph engagement
 */
export function trackKnowledgeGraphEngagement(
  sessionId: string,
  data: Partial<KnowledgeGraphEngagementData>
): string {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    console.warn('Cannot track knowledge graph: session ID not found', sessionId);
    return '';
  }
  
  const engagementId = uuidv4();
  const timestamp = Date.now();
  
  // Create engagement data
  const engagementData: KnowledgeGraphEngagementData = {
    adId: session.adId,
    engagementType: data.engagementType || EngagementType.GRAPH_EXPLORE,
    engagementTime: timestamp,
    graphId: data.graphId || 'unknown',
    nodeId: data.nodeId,
    nodeType: data.nodeType,
    edgeId: data.edgeId,
    edgeType: data.edgeType,
    zoomLevel: data.zoomLevel,
    filterApplied: data.filterApplied,
    visibleNodeCount: data.visibleNodeCount,
    visibleEdgeCount: data.visibleEdgeCount,
    interactionSequence: data.interactionSequence,
    ...data
  };
  
  // Create engagement event
  const event = createAnalyticsEvent(
    'knowledge_graph_engagement',
    AnalyticsEventCategory.ENGAGEMENT,
    {
      page: 'current',
      component: 'knowledge_graph'
    },
    engagementData
  );
  
  DataStore.storeEvent(event);
  
  // Add to session engagement sequence
  session.engagementSequence.push({
    type: engagementData.engagementType,
    timestamp,
    durationMs: data.durationMs,
    metadata: {
      nodeType: data.nodeType,
      edgeType: data.edgeType,
      interactionSequence: data.interactionSequence
    }
  });
  
  // Update session
  activeSessions.set(sessionId, session);
  
  return engagementId;
}

/**
 * Track a CTA engagement
 */
export function trackCTAEngagement(
  sessionId: string,
  data: Partial<CTAEngagementData>
): string {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    console.warn('Cannot track CTA: session ID not found', sessionId);
    return '';
  }
  
  const engagementId = uuidv4();
  const timestamp = Date.now();
  
  // Create engagement data
  const engagementData: CTAEngagementData = {
    adId: session.adId,
    engagementType: data.engagementType || EngagementType.CTA_CLICK,
    engagementTime: timestamp,
    ctaType: data.ctaType || 'button',
    ctaText: data.ctaText || 'Learn More',
    ctaPosition: data.ctaPosition || 'bottom',
    ctaDestination: data.ctaDestination,
    conversionValue: data.conversionValue,
    ...data
  };
  
  // Create engagement event
  const event = createAnalyticsEvent(
    'cta_engagement',
    AnalyticsEventCategory.ENGAGEMENT,
    {
      page: 'current',
      component: 'cta'
    },
    engagementData
  );
  
  DataStore.storeEvent(event);
  
  // Add to session engagement sequence
  session.engagementSequence.push({
    type: engagementData.engagementType,
    timestamp,
    durationMs: data.durationMs,
    metadata: {
      ctaType: data.ctaType,
      ctaText: data.ctaText,
      ctaDestination: data.ctaDestination
    }
  });
  
  // Update session
  activeSessions.set(sessionId, session);
  
  return engagementId;
}

/**
 * Track media engagement
 */
export function trackMediaEngagement(
  sessionId: string,
  data: Partial<MediaEngagementData>
): string {
  const session = activeSessions.get(sessionId);
  
  if (!session) {
    console.warn('Cannot track media: session ID not found', sessionId);
    return '';
  }
  
  const engagementId = uuidv4();
  const timestamp = Date.now();
  
  // Create engagement data
  const engagementData: MediaEngagementData = {
    adId: session.adId,
    engagementType: data.engagementType || EngagementType.VIDEO_START,
    engagementTime: timestamp,
    mediaType: data.mediaType || 'video',
    mediaId: data.mediaId || 'unknown',
    mediaDurationMs: data.mediaDurationMs,
    playbackPositionMs: data.playbackPositionMs,
    completionPercentage: data.completionPercentage,
    playbackRate: data.playbackRate,
    quality: data.quality,
    autoPlayed: data.autoPlayed,
    ...data
  };
  
  // Create engagement event
  const event = createAnalyticsEvent(
    'media_engagement',
    AnalyticsEventCategory.ENGAGEMENT,
    {
      page: 'current',
      component: data.mediaType || 'video'
    },
    engagementData
  );
  
  DataStore.storeEvent(event);
  
  // Add to session engagement sequence
  session.engagementSequence.push({
    type: engagementData.engagementType,
    timestamp,
    durationMs: data.durationMs,
    metadata: {
      mediaType: data.mediaType,
      completionPercentage: data.completionPercentage,
      playbackPositionMs: data.playbackPositionMs
    }
  });
  
  // Update session
  activeSessions.set(sessionId, session);
  
  return engagementId;
}

/**
 * Calculate metrics for an engagement session
 */
function calculateSessionMetrics(session: EngagementSession): {
  completionRate: number;
  engagementScore: number;
} {
  // Default values
  let completionRate = session.completionRate || 0;
  let engagementScore = 0;
  
  // If we have no sequence data, return defaults
  if (!session.engagementSequence || session.engagementSequence.length === 0) {
    return { completionRate, engagementScore };
  }
  
  // Analyze engagement sequence
  const sequence = session.engagementSequence;
  const lastEngagement = sequence[sequence.length - 1];
  
  // Calculate completion rate based on last engagement type
  if (lastEngagement.type === EngagementType.MICROSIM_COMPLETE || 
      lastEngagement.type === EngagementType.VIDEO_COMPLETE || 
      lastEngagement.type === EngagementType.FORMAT_COMPLETION) {
    completionRate = 1.0;
  } else if (sequence.some(e => e.type === EngagementType.MICROSIM_START)) {
    // For microsimulations, check how far they got
    const microsimSteps = sequence.filter(e => 
      e.type === EngagementType.MICROSIM_STEP || 
      e.type === EngagementType.MICROSIM_DECISION
    ).length;
    
    if (microsimSteps > 0) {
      const lastMicrosim = sequence.filter(e => 
        e.type === EngagementType.MICROSIM_STEP || 
        e.type === EngagementType.MICROSIM_DECISION
      ).pop();
      
      if (lastMicrosim?.metadata?.completionPercentage) {
        completionRate = lastMicrosim.metadata.completionPercentage / 100;
      } else {
        completionRate = Math.min(0.8, microsimSteps * 0.2);
      }
    }
  } else if (sequence.some(e => e.type === EngagementType.VIDEO_START)) {
    // For videos, use the last progress point
    const lastVideo = sequence.filter(e => 
      e.type === EngagementType.VIDEO_PROGRESS
    ).pop();
    
    if (lastVideo?.metadata?.completionPercentage) {
      completionRate = lastVideo.metadata.completionPercentage / 100;
    }
  }
  
  // Calculate engagement score based on:
  // 1. Number of interactions
  // 2. Duration of engagement
  // 3. Depth of interaction (e.g., microsim decisions, graph exploration)
  // 4. Completion rate
  
  // Base score from interaction count (0-30 points)
  const interactionScore = Math.min(30, sequence.length * 5);
  
  // Duration score (0-30 points)
  const durationMs = session.durationMs || (Date.now() - session.startTime);
  const durationScore = Math.min(30, (durationMs / 60000) * 20); // 20 points per minute, max 30
  
  // Depth score (0-20 points)
  let depthScore = 0;
  if (sequence.some(e => e.type === EngagementType.MICROSIM_DECISION)) {
    depthScore += 10;
  }
  if (sequence.some(e => e.type === EngagementType.GRAPH_NODE_CLICK)) {
    depthScore += 5;
  }
  if (sequence.some(e => e.type === EngagementType.CTA_CLICK)) {
    depthScore += 5;
  }
  
  // Completion score (0-20 points)
  const completionScore = completionRate * 20;
  
  // Final score (0-100)
  engagementScore = Math.round(interactionScore + durationScore + depthScore + completionScore);
  
  return { completionRate, engagementScore };
}

/**
 * Update aggregate engagement metrics
 */
function updateEngagementAggregates(session: EngagementSession, metrics: {
  completionRate: number;
  engagementScore: number;
}): void {
  // Get today's date as a string for the aggregate key
  const today = new Date().toISOString().split('T')[0];
  
  // Update aggregate engagement metrics
  DataStore.updateAggregateData<AggregateEngagementMetrics>(
    `engagement_metrics_${today}`,
    'engagement_metrics',
    (current) => {
      // Initialize if not exists
      if (!current) {
        const initialDistribution: Record<EngagementType, number> = {} as Record<EngagementType, number>;
        // Initialize counts for all engagement types to zero
        Object.values(EngagementType).forEach(type => {
          initialDistribution[type as EngagementType] = 0;
        });
        
        return {
          totalEngagements: 1,
          uniqueUsers: 1,
          averageEngagementTimeMs: session.durationMs || 0,
          engagementRateByType: initialDistribution,
          completionRates: {
            microsimulation: session.engagementSequence.some(e => e.type === EngagementType.MICROSIM_START) ? metrics.completionRate : 0,
            knowledgeGraph: session.engagementSequence.some(e => e.type === EngagementType.GRAPH_EXPLORE) ? metrics.completionRate : 0,
            video: session.engagementSequence.some(e => e.type === EngagementType.VIDEO_START) ? metrics.completionRate : 0,
            overall: metrics.completionRate
          },
          averageInteractionDepth: session.engagementSequence.length,
          mostEngagingComponents: [],
          conversionRate: session.engagementSequence.some(e => e.type === EngagementType.CTA_CLICK) ? 1 : 0
        };
      }
      
      // Create a copy for updates
      const updated = { ...current };
      
      // Update counters
      updated.totalEngagements += 1;
      
      // Update time metrics
      updated.averageEngagementTimeMs = 
        (updated.averageEngagementTimeMs * (updated.totalEngagements - 1) + (session.durationMs || 0)) / 
        updated.totalEngagements;
      
      // Count engagement types
      session.engagementSequence.forEach(item => {
        if (updated.engagementRateByType[item.type]) {
          updated.engagementRateByType[item.type]++;
        } else {
          updated.engagementRateByType[item.type] = 1;
        }
      });
      
      // Update average interaction depth
      updated.averageInteractionDepth = 
        (updated.averageInteractionDepth * (updated.totalEngagements - 1) + session.engagementSequence.length) / 
        updated.totalEngagements;
      
      // Update completion rates
      if (session.engagementSequence.some(e => e.type === EngagementType.MICROSIM_START)) {
        updated.completionRates.microsimulation = 
          (updated.completionRates.microsimulation * (updated.totalEngagements - 1) + metrics.completionRate) / 
          updated.totalEngagements;
      }
      
      if (session.engagementSequence.some(e => e.type === EngagementType.GRAPH_EXPLORE)) {
        updated.completionRates.knowledgeGraph = 
          (updated.completionRates.knowledgeGraph * (updated.totalEngagements - 1) + metrics.completionRate) / 
          updated.totalEngagements;
      }
      
      if (session.engagementSequence.some(e => e.type === EngagementType.VIDEO_START)) {
        updated.completionRates.video = 
          (updated.completionRates.video * (updated.totalEngagements - 1) + metrics.completionRate) / 
          updated.totalEngagements;
      }
      
      updated.completionRates.overall = 
        (updated.completionRates.overall * (updated.totalEngagements - 1) + metrics.completionRate) / 
        updated.totalEngagements;
      
      // Update conversion rate
      const converted = session.engagementSequence.some(e => e.type === EngagementType.CTA_CLICK) ? 1 : 0;
      updated.conversionRate = 
        (updated.conversionRate * (updated.totalEngagements - 1) + converted) / 
        updated.totalEngagements;
      
      return updated;
    }
  );
} 