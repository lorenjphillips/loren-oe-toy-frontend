/**
 * Engagement Metrics Model
 * 
 * Models for tracking user engagement with advanced ad formats including
 * microsimulations, knowledge graphs, and interactive components.
 */

import { AnalyticsEvent, AnalyticsEventCategory } from './AnalyticsEvent';

/**
 * Types of engagement interactions
 */
export enum EngagementType {
  // Microsimulation engagements
  MICROSIM_START = 'microsim_start',
  MICROSIM_STEP = 'microsim_step',
  MICROSIM_DECISION = 'microsim_decision',
  MICROSIM_COMPLETE = 'microsim_complete',
  
  // Knowledge graph engagements
  GRAPH_EXPLORE = 'graph_explore',
  GRAPH_NODE_CLICK = 'graph_node_click',
  GRAPH_EDGE_CLICK = 'graph_edge_click', 
  GRAPH_ZOOM = 'graph_zoom',
  GRAPH_PAN = 'graph_pan',
  GRAPH_FILTER = 'graph_filter',
  
  // Content-related engagements
  EXPAND_CONTENT = 'expand_content',
  MINIMIZE_CONTENT = 'minimize_content',
  SAVE_CONTENT = 'save_content',
  SHARE_CONTENT = 'share_content',
  
  // Calls to action
  CTA_CLICK = 'cta_click',
  LEARN_MORE = 'learn_more',
  DOWNLOAD = 'download',
  EXTERNAL_LINK = 'external_link',
  
  // Media engagement
  VIDEO_START = 'video_start',
  VIDEO_COMPLETE = 'video_complete',
  VIDEO_PROGRESS = 'video_progress',
  AUDIO_PLAY = 'audio_play'
}

/**
 * Common data for all engagement events
 */
export interface EngagementData {
  adId: string;               // The ad content ID
  companyId?: string;         // Company ID
  engagementType: EngagementType; // Type of engagement
  engagementTime: number;     // When engagement occurred
  durationMs?: number;        // Duration of engagement if applicable
  interactionDepth?: number;  // Level of depth in interaction (e.g., steps)
  targetElement?: string;     // UI element interacted with
  engagementValue?: number;   // Value score for the engagement (1-10)
  previousEngagements?: EngagementType[]; // Previous engagement types in sequence
}

/**
 * Base engagement event interface
 */
export interface EngagementEvent extends AnalyticsEvent {
  eventType: string;
  eventCategory: AnalyticsEventCategory.ENGAGEMENT;
  metadata: EngagementData;
}

/**
 * Microsimulation engagement data
 */
export interface MicrosimulationEngagementData extends EngagementData {
  simulationId: string;       // ID of the microsimulation
  simulationType: string;     // Type of simulation (disease, treatment, etc.)
  stepId?: string;            // Current step ID if applicable
  stepNumber?: number;        // Current step number if applicable
  totalSteps?: number;        // Total steps in simulation
  decisionPath?: string;      // Path of decisions taken
  completionPercentage?: number; // Percentage of simulation completed
  timeSpentMs?: number;       // Time spent in current step
}

/**
 * Knowledge graph engagement data
 */
export interface KnowledgeGraphEngagementData extends EngagementData {
  graphId: string;            // ID of the knowledge graph
  nodeId?: string;            // ID of node interacted with
  nodeType?: string;          // Type of node (treatment, disease, etc.)
  edgeId?: string;            // ID of edge interacted with
  edgeType?: string;          // Type of edge (treats, causes, etc.)
  zoomLevel?: number;         // Zoom level if applicable
  filterApplied?: string;     // Filter that was applied
  visibleNodeCount?: number;  // Number of visible nodes 
  visibleEdgeCount?: number;  // Number of visible edges
  interactionSequence?: number; // Sequence number in interaction chain
}

/**
 * CTA engagement data
 */
export interface CTAEngagementData extends EngagementData {
  ctaType: string;            // Type of CTA (button, link, etc.)
  ctaText: string;            // Text of the CTA
  ctaDestination?: string;    // Destination of the CTA (URL, etc.)
  ctaPosition: string;        // Position of CTA in the ad
  conversionValue?: number;   // Value of the conversion if applicable
}

/**
 * Media engagement data
 */
export interface MediaEngagementData extends EngagementData {
  mediaType: 'video' | 'audio' | 'image' | 'interactive';
  mediaId: string;            // ID of the media
  mediaDurationMs?: number;   // Total duration of media
  playbackPositionMs?: number; // Current playback position
  completionPercentage?: number; // Percentage of media completed
  playbackRate?: number;      // Playback rate (1.0 = normal)
  quality?: string;           // Quality level of media (HD, SD, etc.)
  autoPlayed?: boolean;       // Whether media was automatically played
}

/**
 * Engagement session data for tracking full engagement flows
 */
export interface EngagementSession {
  sessionId: string;          // Session identifier
  adId: string;               // Ad associated with session
  startTime: number;          // When session started
  endTime?: number;           // When session ended (if complete)
  durationMs?: number;        // Total duration of session
  engagementSequence: {       // Sequence of engagements in session
    type: EngagementType;
    timestamp: number;
    durationMs?: number;
    metadata?: Record<string, any>;
  }[];
  completionRate: number;     // Rate of completion (0-1)
  engagementScore: number;    // Overall engagement score (0-100)
  abandonmentPoint?: string;  // Where user abandoned if not complete
}

/**
 * Aggregated metrics for reporting
 */
export interface AggregateEngagementMetrics {
  totalEngagements: number;
  uniqueUsers: number; // Anonymized/hashed
  averageEngagementTimeMs: number;
  engagementRateByType: Record<EngagementType, number>;
  completionRates: {
    microsimulation: number;
    knowledgeGraph: number;
    video: number;
    overall: number;
  };
  averageInteractionDepth: number;
  mostEngagingComponents: string[];
  conversionRate: number;
} 