import { NextRequest } from 'next/server';
import { initializeAdRepository } from '../../../data/adRepository';
import { classifyMedicalQuestion } from '../../services/classification';
import { mapQuestionToCompanies } from '../../services/adMapping';
import { enhanceMappingConfidence, shouldShowAd } from '../../services/confidenceScoring';
import { 
  getAdContentFromMapping, 
  getAdContentForTreatmentCategory,
  trackImpression 
} from '../../services/adContentService';
import { createApiResponse, handleApiError, validateRequiredFields } from '../../lib/api-utils';

// Initialize the ad repository on server start
let repositoryInitialized = false;

/**
 * API route to deliver a targeted ad based on a medical question
 * POST /api/ads
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize repository if not done already
    if (!repositoryInitialized) {
      await initializeAdRepository();
      repositoryInitialized = true;
    }

    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    const missingField = validateRequiredFields(body, ['question', 'userId']);
    if (missingField) {
      return createApiResponse(undefined, {
        status: 400,
        message: missingField
      });
    }

    const { question, classification, userId, questionId, history } = body;

    // If classification wasn't provided, classify the question
    const questionClassification = classification || await classifyMedicalQuestion(question);
    
    // Map the question to pharmaceutical companies
    const mappingResult = mapQuestionToCompanies(questionClassification);
    
    // Enhance mapping with confidence scoring
    const enhancedMapping = await enhanceMappingConfidence(mappingResult, question);
    
    // Determine if we should show an ad based on confidence
    const showAd = shouldShowAd(enhancedMapping);
    
    // Get relevant ad content if confidence is high enough
    let adResponse;
    let trackingId;
    
    if (showAd) {
      adResponse = await getAdContentFromMapping(enhancedMapping);
      
      // Track impression if ad content was found
      if (adResponse.content.length > 0) {
        const adContent = adResponse.content[0];
        trackingId = trackImpression(
          adContent.id,
          questionId || `q_${Date.now()}`,
          userId,
          enhancedMapping.overallConfidence
        );
      }
    } else {
      // Try to get fallback ad content for the treatment category
      const primaryCategory = questionClassification.primaryCategory.id;
      adResponse = await getAdContentForTreatmentCategory(primaryCategory);
      
      // Track impression with lower confidence
      if (adResponse.content.length > 0) {
        const adContent = adResponse.content[0];
        trackingId = trackImpression(
          adContent.id,
          questionId || `q_${Date.now()}`,
          userId,
          0.5 // Lower confidence for fallback ads
        );
      }
    }

    // Return the ad content, mapping details, and tracking info
    return createApiResponse({
      ads: adResponse.content,
      totalAdsFound: adResponse.totalFound,
      confidence: enhancedMapping.overallConfidence,
      showAd,
      mappingDetails: {
        primaryCategory: questionClassification.primaryCategory,
        subcategory: questionClassification.subcategory,
        keywords: questionClassification.keywords,
        matches: enhancedMapping.matches.map(match => ({
          companyId: match.company.id,
          companyName: match.company.name,
          confidence: match.confidenceScore,
          treatmentArea: match.treatmentArea
        }))
      },
      tracking: {
        impressionId: trackingId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * API route to handle OPTIONS requests (for CORS)
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