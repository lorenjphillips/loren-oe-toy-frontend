import { NextRequest } from 'next/server';
import { trackImpression } from '../../services/adContentService';
import { createApiResponse, handleApiError, validateRequiredFields } from '../../lib/api-utils';

/**
 * Types of analytics events
 */
type AnalyticsEventType = 'impression' | 'click' | 'conversion' | 'dismiss' | 'feedback';

/**
 * API route for tracking analytics events
 * POST /api/analytics
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const missingField = validateRequiredFields(body, ['eventType', 'userId']);
    if (missingField) {
      return createApiResponse(undefined, {
        status: 400,
        message: missingField
      });
    }
    
    const { eventType, userId, adId, questionId, metadata } = body;
    
    // Handle different event types
    switch (eventType as AnalyticsEventType) {
      case 'impression':
        // Validate impression-specific fields
        if (!adId || !questionId) {
          return createApiResponse(undefined, {
            status: 400,
            message: 'Missing required fields for impression event: adId, questionId'
          });
        }
        
        // Track impression event
        const impressionId = trackImpression(
          adId,
          questionId,
          userId,
          metadata?.confidence || 1.0
        );
        
        return createApiResponse({
          eventId: impressionId,
          eventType,
          timestamp: new Date().toISOString()
        });
        
      case 'click':
        // Handle click events
        if (!adId) {
          return createApiResponse(undefined, {
            status: 400,
            message: 'Missing required field for click event: adId'
          });
        }
        
        // Implement click tracking logic
        const clickId = `click_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        return createApiResponse({
          eventId: clickId,
          eventType,
          timestamp: new Date().toISOString()
        });
        
      case 'feedback':
      case 'conversion':
      case 'dismiss':
        // Implement other event type tracking
        const eventId = `${eventType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        return createApiResponse({
          eventId,
          eventType,
          timestamp: new Date().toISOString()
        });
        
      default:
        return createApiResponse(undefined, {
          status: 400,
          message: `Invalid event type: ${eventType}`
        });
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