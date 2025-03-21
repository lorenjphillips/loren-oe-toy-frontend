import { NextResponse } from 'next/server';
import { trackClick } from '../../../../services/analyticsService';

/**
 * API route to handle ad click tracking
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const { adId, userId, questionId, metadata } = await request.json();

    if (!adId) {
      return NextResponse.json(
        { error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    // Track the click event
    await trackClick(adId, userId, questionId, metadata);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking ad click:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * API route to handle OPTIONS requests (for CORS)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 