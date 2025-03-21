import { NextRequest } from 'next/server';
import { createApiResponse, handleApiError, validateRequiredFields } from '../../lib/api-utils';

/**
 * Types of feedback
 */
type FeedbackType = 'answer' | 'ad' | 'system' | 'feature_request';

/**
 * API route for handling user feedback
 * POST /api/feedback
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const missingField = validateRequiredFields(body, ['feedbackType', 'content', 'userId']);
    if (missingField) {
      return createApiResponse(undefined, {
        status: 400,
        message: missingField
      });
    }
    
    const { feedbackType, content, userId, questionId, adId, rating } = body;
    
    // Validate feedback type
    if (!['answer', 'ad', 'system', 'feature_request'].includes(feedbackType)) {
      return createApiResponse(undefined, {
        status: 400,
        message: `Invalid feedback type: ${feedbackType}`
      });
    }
    
    // Store the feedback (this would connect to a database in production)
    const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Log the feedback for now
    console.log({
      id: feedbackId,
      feedbackType,
      content,
      userId,
      questionId,
      adId,
      rating,
      timestamp: new Date().toISOString()
    });
    
    // Return success response
    return createApiResponse({
      feedbackId,
      message: 'Feedback received successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get feedback statistics
 * GET /api/feedback
 */
export async function GET(request: NextRequest) {
  try {
    // This would be replaced with actual data from a database
    const stats = {
      totalFeedback: 0,
      byType: {
        answer: 0,
        ad: 0,
        system: 0,
        feature_request: 0
      },
      averageRating: 0
    };
    
    return createApiResponse(stats);
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 