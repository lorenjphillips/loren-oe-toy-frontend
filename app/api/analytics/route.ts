import { NextRequest } from 'next/server';
import { trackImpression } from '../../services/adContentService';
import { createApiResponse, handleApiError, validateRequiredFields } from '../../lib/api-utils';

/**
 * Types of analytics events
 */
type AnalyticsEventType = 'impression' | 'click' | 'conversion' | 'dismiss' | 'feedback';

/**
 * Interface for analytics event
 */
interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  userId: string;
  adId?: string;
  questionId?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

/**
 * Process a single analytics event
 */
async function processEvent(event: AnalyticsEvent): Promise<{
  eventId: string;
  eventType: string;
  timestamp: string;
}> {
  // Generate a timestamp if not provided
  const timestamp = event.timestamp || new Date().toISOString();
  
  // Handle different event types
  switch (event.eventType) {
    case 'impression':
      // Validate impression-specific fields
      if (!event.adId || !event.questionId) {
        throw new Error('Missing required fields for impression event: adId, questionId');
      }
      
      // Track impression event
      const impressionId = trackImpression(
        event.adId,
        event.questionId,
        event.userId,
        event.metadata?.confidence || 1.0
      );
      
      return {
        eventId: impressionId,
        eventType: event.eventType,
        timestamp
      };
      
    case 'click':
      // Handle click events
      if (!event.adId) {
        throw new Error('Missing required field for click event: adId');
      }
      
      // Implement click tracking logic
      const clickId = `click_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      return {
        eventId: clickId,
        eventType: event.eventType,
        timestamp
      };
      
    case 'feedback':
    case 'conversion':
    case 'dismiss':
      // Implement other event type tracking
      const eventId = `${event.eventType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      return {
        eventId,
        eventType: event.eventType,
        timestamp
      };
      
    default:
      throw new Error(`Invalid event type: ${event.eventType}`);
  }
}

/**
 * API route for tracking analytics events
 * POST /api/analytics
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Check if it's a batch request (array of events) or single event
    if (Array.isArray(body)) {
      // Handle batch event submission
      if (body.length === 0) {
        return createApiResponse(undefined, {
          status: 400,
          message: 'Empty batch of events'
        });
      }
      
      if (body.length > 100) {
        return createApiResponse(undefined, {
          status: 400,
          message: 'Batch size exceeds maximum limit of 100 events'
        });
      }
      
      // Process each event in the batch
      const results = await Promise.allSettled(
        body.map(event => processEvent(event))
      );
      
      // Extract successful and failed events
      const successful = results
        .filter((result): result is PromiseFulfilledResult<{
          eventId: string;
          eventType: string;
          timestamp: string;
        }> => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failed = results
        .filter((result): result is PromiseRejectedResult => 
          result.status === 'rejected'
        )
        .map((result, index) => ({
          index,
          event: body[index],
          error: result.reason?.message || 'Unknown error'
        }));
      
      return createApiResponse({
        processed: successful.length,
        failed: failed.length,
        events: successful,
        failedEvents: failed
      });
    } else {
      // Handle single event submission
      // Validate required fields
      const missingField = validateRequiredFields(body, ['eventType', 'userId']);
      if (missingField) {
        return createApiResponse(undefined, {
          status: 400,
          message: missingField
        });
      }
      
      // Process the event
      const result = await processEvent(body);
      
      return createApiResponse(result);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 