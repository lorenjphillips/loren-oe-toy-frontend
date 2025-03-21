import { NextResponse } from 'next/server';
import { initializeAdRepository } from '../../../data/adRepository';
import { classifyQuestion } from '../../../services/classifierService';
import { deliverAd } from '../../../services/adService';
import { trackImpression } from '../../../services/analyticsService';

// Initialize the ad repository on server start
let repositoryInitialized = false;

/**
 * API route to deliver a targeted ad based on a medical question
 */
export async function POST(request: Request) {
  try {
    // Initialize repository if not done already
    if (!repositoryInitialized) {
      await initializeAdRepository();
      repositoryInitialized = true;
    }

    // Parse the request body
    const { question, history, userId, questionId } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Classify the question
    const classification = await classifyQuestion(question, history);

    // Get a relevant ad based on the classification
    const adResponse = await deliverAd(classification);

    // If we found an ad, track the impression
    if (adResponse.ad) {
      await trackImpression(
        adResponse.ad.id,
        userId,
        questionId,
        {
          matchConfidence: adResponse.matchConfidence,
          matchedCategories: adResponse.matchedCategories,
          keywords: classification.keywords
        }
      );
    }

    return NextResponse.json({
      ad: adResponse.ad,
      matchConfidence: adResponse.matchConfidence,
      matchedCategories: adResponse.matchedCategories,
      categories: classification.categories,
      keywords: classification.keywords
    });
  } catch (error: any) {
    console.error('Error in ad delivery API:', error);
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 