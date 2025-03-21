/**
 * Analytics Event Model
 * 
 * Core model for all analytics events in the OpenEvidence platform.
 * Defines the base structure for tracking user interactions while
 * maintaining HIPAA compliance and physician privacy.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Analytics event categories
 */
export enum AnalyticsEventCategory {
  IMPRESSION = 'impression',
  ENGAGEMENT = 'engagement',
  PERFORMANCE = 'performance',
  CONTEXT = 'context',
  USER_JOURNEY = 'user_journey',
  CONTENT = 'content',
  INTERACTION = 'interaction',
  CONVERSION = 'conversion',
  VISIBILITY = 'visibility',
  ERROR = 'error'
}

/**
 * Analytics event severity levels
 */
export enum AnalyticsEventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Source application information
 */
export interface EventSource {
  page: string;              // Page where the event occurred
  section?: string;          // Section within the page
  component?: string;        // UI component that generated the event
  placement?: string;        // Specific placement within component
  version?: string;          // App version
}

/**
 * Device and environment information
 */
export interface EventContext {
  sessionId: string;         // Anonymous session identifier
  timestamp: number;         // Unix timestamp in milliseconds
  deviceType?: string;       // Desktop, mobile, tablet
  browser?: string;          // Browser type and version
  viewportSize?: {
    width: number;
    height: number;
  };
  timeZone?: string;         // Timezone identifier (IANA format)
  locale?: string;           // User locale
}

/**
 * Base interface for all analytics events
 */
export interface AnalyticsEvent {
  id: string;                        // Unique event ID
  eventType: string;                 // Specific type of event
  eventCategory: AnalyticsEventCategory; // Event category
  source: EventSource;               // Where the event occurred
  context: EventContext;             // Environmental context
  metadata?: Record<string, any>;    // Additional event-specific data
  severity?: AnalyticsEventSeverity; // Event severity level (default: INFO)
  relatedEventIds?: string[];        // Related event IDs for correlation
  dataVersion: string;               // Schema version for forward compatibility
}

/**
 * Create a new analytics event with default values
 */
export function createAnalyticsEvent(
  eventType: string,
  eventCategory: AnalyticsEventCategory,
  source: Partial<EventSource>,
  metadata?: Record<string, any>,
  context?: Partial<EventContext>
): AnalyticsEvent {
  // Generate session ID if not present in context
  const sessionId = context?.sessionId || getSessionId();
  
  return {
    id: uuidv4(),
    eventType,
    eventCategory,
    source: {
      page: source.page || 'unknown',
      section: source.section,
      component: source.component,
      placement: source.placement,
      version: source.version || process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    },
    context: {
      sessionId,
      timestamp: Date.now(),
      ...context
    },
    metadata,
    severity: AnalyticsEventSeverity.INFO,
    dataVersion: '1.0'
  };
}

/**
 * Get or create a unique session identifier
 */
function getSessionId(): string {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
  return uuidv4(); // Fallback for server-side rendering
}

/**
 * Validate that an analytics event doesn't contain PHI/PII
 */
export function validatePrivacyCompliance(event: AnalyticsEvent): boolean {
  // Implementation would check for PII/PHI patterns in the event
  // Return true if compliant, false if potentially contains sensitive info
  return true;
}

/**
 * Anonymize any potentially sensitive data in the event
 */
export function anonymizeEvent(event: AnalyticsEvent): AnalyticsEvent {
  // Create a deep copy to avoid modifying the original
  const sanitizedEvent = JSON.parse(JSON.stringify(event)) as AnalyticsEvent;
  
  // Ensure no identifying information is present
  // This is a simplified implementation - real version would be more thorough
  if (sanitizedEvent.metadata) {
    delete sanitizedEvent.metadata.userId;
    delete sanitizedEvent.metadata.email;
    delete sanitizedEvent.metadata.ip;
    delete sanitizedEvent.metadata.deviceId;
  }
  
  return sanitizedEvent;
} 