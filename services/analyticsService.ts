import { AnalyticsEvent, AnalyticsEventCategory, EventSource, EventContext, createAnalyticsEvent } from '../app/models/analytics/AnalyticsEvent';
import { updateAdMetrics } from '../data/adRepository';

// In a real application, this would be persisted to a database
const analyticsEvents: AnalyticsEvent[] = [];

/**
 * Track an ad impression event
 * @param adId The ad ID
 * @param metadata Additional metadata about the event
 */
export async function trackImpression(
  adId: string,
  userId?: string,
  questionId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  // Create analytics event
  const event = createAnalyticsEvent(
    'impression',
    AnalyticsEventCategory.IMPRESSION,
    { page: 'ad-display' },
    {
      adId,
      userId,
      questionId,
      ...metadata
    }
  );
  
  // Store the event
  analyticsEvents.push(event);
  
  // Update ad metrics
  await updateAdMetrics(adId, { impressions: 1 });
  
  // In a production environment, we might batch these events
  // and send them to an analytics service
  console.log('Ad impression tracked:', event);
}

/**
 * Track an ad click event
 * @param adId The ad ID
 * @param metadata Additional metadata about the event
 */
export async function trackClick(
  adId: string,
  userId?: string,
  questionId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  // Create analytics event
  const event = createAnalyticsEvent(
    'click',
    AnalyticsEventCategory.ENGAGEMENT,
    { page: 'ad-display' },
    {
      adId,
      userId,
      questionId,
      ...metadata
    }
  );
  
  // Store the event
  analyticsEvents.push(event);
  
  // Update ad metrics
  await updateAdMetrics(adId, { clicks: 1 });
  
  // In a production environment, we might batch these events
  // and send them to an analytics service
  console.log('Ad click tracked:', event);
}

/**
 * Track a conversion event
 * @param adId The ad ID
 * @param metadata Additional metadata about the event
 */
export async function trackConversion(
  adId: string,
  userId?: string,
  questionId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  // Create analytics event
  const event = createAnalyticsEvent(
    'conversion',
    AnalyticsEventCategory.CONVERSION,
    { page: 'ad-display' },
    {
      adId,
      userId,
      questionId,
      ...metadata
    }
  );
  
  // Store the event
  analyticsEvents.push(event);
  
  // In a production environment, we might batch these events
  // and send them to an analytics service
  console.log('Conversion tracked:', event);
}

/**
 * Get analytics events, optionally filtered
 * @param filter Optional filter criteria
 * @returns Array of matching analytics events
 */
export function getAnalyticsEvents(
  filter?: {
    type?: 'impression' | 'click' | 'conversion';
    adId?: string;
    userId?: string;
    questionId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): AnalyticsEvent[] {
  if (!filter) return [...analyticsEvents];
  
  return analyticsEvents.filter(event => {
    if (filter.type && event.eventType !== filter.type) return false;
    if (filter.adId && (!event.metadata || event.metadata.adId !== filter.adId)) return false;
    if (filter.userId && (!event.metadata || event.metadata.userId !== filter.userId)) return false;
    if (filter.questionId && (!event.metadata || event.metadata.questionId !== filter.questionId)) return false;
    if (filter.startDate && event.context.timestamp < filter.startDate.getTime()) return false;
    if (filter.endDate && event.context.timestamp > filter.endDate.getTime()) return false;
    return true;
  });
} 