import { NextRequest } from 'next/server';
import { classifyMedicalQuestion } from '../../services/classification';
import { createApiResponse, handleApiError, validateRequiredFields } from '../../lib/api-utils';

/**
 * API route for classifying medical questions
 * POST /api/classify
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const missingField = validateRequiredFields(body, ['question']);
    if (missingField) {
      return createApiResponse(undefined, {
        status: 400,
        message: missingField
      });
    }
    
    const { question } = body;
    
    // Classify the medical question
    const classification = await classifyMedicalQuestion(question);
    
    // Return the classification results
    return createApiResponse({
      classification,
      question
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 