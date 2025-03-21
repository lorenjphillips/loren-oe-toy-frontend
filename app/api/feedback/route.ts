import { NextRequest } from 'next/server';
import { createApiResponse, handleApiError, validateRequiredFields } from '../../lib/api-utils';

/**
 * Types of feedback
 */
type FeedbackType = 'answer' | 'ad' | 'system' | 'feature_request' | 'content_quality' | 'ad_relevance';

/**
 * Specific feedback categories
 */
interface FeedbackCategories {
  answerCategories: ('accuracy' | 'completeness' | 'tone' | 'clarity' | 'relevance')[];
  adCategories: ('relevance' | 'design' | 'content' | 'intrusiveness' | 'usefulness')[];
  systemCategories: ('performance' | 'ui' | 'ux' | 'bug' | 'accessibility')[];
}

/**
 * Interface for feedback submission
 */
interface FeedbackSubmission {
  feedbackType: FeedbackType;
  content: string;
  userId: string;
  questionId?: string;
  adId?: string;
  rating?: number;
  categories?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  metadata?: {
    browser?: string;
    device?: string;
    screen?: string;
    url?: string;
    sessionDuration?: number;
    userRole?: string;
    contextData?: Record<string, any>;
  };
}

// In-memory storage for feedback (would be a database in production)
const feedbackStore: {
  submissions: Record<string, FeedbackSubmission & { id: string; timestamp: string }>;
  stats: {
    total: number;
    byType: Record<FeedbackType, number>;
    avgRating: number;
    totalRatings: number;
    sumRatings: number;
  };
} = {
  submissions: {},
  stats: {
    total: 0,
    byType: {
      answer: 0,
      ad: 0,
      system: 0,
      feature_request: 0,
      content_quality: 0,
      ad_relevance: 0
    },
    avgRating: 0,
    totalRatings: 0,
    sumRatings: 0
  }
};

/**
 * API route for handling user feedback
 * POST /api/feedback
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as FeedbackSubmission;
    
    // Validate required fields
    const missingField = validateRequiredFields(body, ['feedbackType', 'content', 'userId']);
    if (missingField) {
      return createApiResponse(undefined, {
        status: 400,
        message: missingField
      });
    }
    
    // Validate feedback type
    const validFeedbackTypes: FeedbackType[] = [
      'answer', 'ad', 'system', 'feature_request', 'content_quality', 'ad_relevance'
    ];
    
    if (!validFeedbackTypes.includes(body.feedbackType as FeedbackType)) {
      return createApiResponse(undefined, {
        status: 400,
        message: `Invalid feedback type: ${body.feedbackType}`
      });
    }
    
    // Validate rating if provided
    if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
      return createApiResponse(undefined, {
        status: 400,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Store the feedback
    const timestamp = new Date().toISOString();
    const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const feedbackData = {
      id: feedbackId,
      ...body,
      timestamp
    };
    
    // Store in our in-memory database (would be a real DB in production)
    feedbackStore.submissions[feedbackId] = feedbackData;
    feedbackStore.stats.total += 1;
    feedbackStore.stats.byType[body.feedbackType as FeedbackType] += 1;
    
    // Update rating statistics if rating provided
    if (body.rating !== undefined) {
      feedbackStore.stats.totalRatings += 1;
      feedbackStore.stats.sumRatings += body.rating;
      feedbackStore.stats.avgRating = feedbackStore.stats.sumRatings / feedbackStore.stats.totalRatings;
    }
    
    // Log the feedback for now
    console.log('Feedback received:', feedbackData);
    
    // Return success response
    return createApiResponse({
      feedbackId,
      received: true,
      timestamp
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
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const userId = url.searchParams.get('userId');
    
    // Filter submissions if parameters are provided
    let filteredSubmissions = Object.values(feedbackStore.submissions);
    
    if (type) {
      filteredSubmissions = filteredSubmissions.filter(
        submission => submission.feedbackType === type
      );
    }
    
    if (userId) {
      filteredSubmissions = filteredSubmissions.filter(
        submission => submission.userId === userId
      );
    }
    
    // Sort by timestamp descending (newest first) and limit results
    const submissions = filteredSubmissions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    return createApiResponse({
      stats: feedbackStore.stats,
      submissions,
      count: submissions.length,
      total: filteredSubmissions.length
    });
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