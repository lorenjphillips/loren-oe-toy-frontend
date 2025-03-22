/**
 * Ad Content Service
 * 
 * Service for retrieving appropriate ad content based on company and category,
 * handling fallbacks, and logging impressions.
 */

import { v4 as uuidv4 } from 'uuid';
import { EnhancedMappingResult } from './confidenceScoring';
import { 
  AdContent, 
  AdContentFilterOptions, 
  AdContentImpression, 
  AdContentResponse,
  TreatmentCategory,
  AdType
} from '../models/adTypes';
import { 
  AD_CONTENT, 
  getAllActiveAdContent,
  getAdContentById, 
  getTreatmentCategoriesByMedicalCategory 
} from '../data/adContent';

// In-memory storage for impressions (would be a database in production)
const impressions: AdContentImpression[] = [];

/**
 * Get ad content based on filtering options
 * 
 * @param options Filtering options for ad content
 * @returns Response containing matched ad content
 */
export async function getAdContent(
  options: AdContentFilterOptions = {}
): Promise<AdContentResponse> {
  // Start with all active ad content
  let content = getAllActiveAdContent();
  
  // Apply filters
  if (options.companyIds && options.companyIds.length > 0) {
    content = content.filter(ad => options.companyIds!.includes(ad.company.id));
  }
  
  if (options.excludeCompanyIds && options.excludeCompanyIds.length > 0) {
    content = content.filter(ad => !options.excludeCompanyIds!.includes(ad.company.id));
  }
  
  if (options.treatmentCategoryIds && options.treatmentCategoryIds.length > 0) {
    content = content.filter(ad => options.treatmentCategoryIds!.includes(ad.treatmentCategory.id));
  }
  
  if (options.excludeCategoryIds && options.excludeCategoryIds.length > 0) {
    content = content.filter(ad => !options.excludeCategoryIds!.includes(ad.treatmentCategory.id));
  }
  
  if (options.medicalCategoryIds && options.medicalCategoryIds.length > 0) {
    content = content.filter(ad => {
      return options.medicalCategoryIds!.includes((ad.treatmentCategory as TreatmentCategory).medicalCategory);
    });
  }
  
  if (options.adTypes && options.adTypes.length > 0) {
    content = content.filter(ad => {
      return options.adTypes!.includes(ad.type as AdType);
    });
  }
  
  if (options.priorityMin !== undefined) {
    content = content.filter(ad => {
      return ad.metadata?.priority >= options.priorityMin! || false;
    });
  }
  
  if (options.isActive !== undefined) {
    content = content.filter(ad => ad.isActive === options.isActive);
  }
  
  // Sort by priority (descending)
  content = content.sort((a, b) => {
    const priorityA = a.metadata?.priority ?? 0;
    const priorityB = b.metadata?.priority ?? 0;
    return priorityB - priorityA;
  });
  
  // Limit results if specified
  if (options.limit !== undefined && options.limit > 0) {
    content = content.slice(0, options.limit);
  }
  
  return {
    content,
    totalFound: content.length
  };
}

/**
 * Get ad content based on mapping result
 * 
 * @param mappingResult Result from confidence scoring
 * @param limit Maximum number of ads to return
 * @returns Response containing matched ad content
 */
export async function getAdContentFromMapping(
  mappingResult: EnhancedMappingResult,
  limit: number = 2
): Promise<AdContentResponse> {
  // Get list of companies with sufficient confidence
  const highConfidenceCompanies = mappingResult.matches
    .filter(match => match.shouldShowAd)
    .map(match => match.company.id);
  
  // If no companies have sufficient confidence, return empty result
  if (highConfidenceCompanies.length === 0) {
    return {
      content: [],
      totalFound: 0,
      confidenceScore: mappingResult.overallConfidence
    };
  }
  
  // Get medical category and subcategory
  const medicalCategory = mappingResult.primaryCategory;
  const subcategory = mappingResult.subcategory;
  
  // Find treatment categories that might match
  const treatmentCategories = getTreatmentCategoriesByMedicalCategory(medicalCategory);
  const treatmentCategoryIds = treatmentCategories.map(tc => tc.id);
  
  // Filter options for ad content
  const options: AdContentFilterOptions = {
    companyIds: highConfidenceCompanies,
    treatmentCategoryIds: treatmentCategoryIds,
    isActive: true,
    limit
  };
  
  // Get matching ad content
  const result = await getAdContent(options);
  
  return {
    ...result,
    confidenceScore: mappingResult.overallConfidence
  };
}

/**
 * Track an impression for ad content
 * 
 * @param adContentId ID of the ad content
 * @param questionText Original question text
 * @param userId Optional user ID
 * @param confidenceScore Optional confidence score
 * @returns The impression ID
 */
export function trackImpression(
  adContentId: string,
  questionText?: string,
  userId?: string,
  confidenceScore?: number
): string {
  const impression: AdContentImpression = {
    id: uuidv4(),
    adContentId,
    timestamp: new Date(),
    userId,
    questionText,
    confidenceScore,
    sourceInfo: {
      page: 'question_answer',
      placement: 'inline'
    }
  };
  
  // In production, this would write to a database
  impressions.push(impression);
  
  // Check if we should update frequency caps
  updateFrequencyCaps(adContentId, userId);
  
  return impression.id;
}

/**
 * Update frequency caps for a user after an impression
 * 
 * @param adContentId ID of the ad content
 * @param userId Optional user ID
 */
function updateFrequencyCaps(adContentId: string, userId?: string): void {
  // In a real implementation, this would update a database record
  // For this mock implementation, we're just tracking in memory
  const ad = getAdContentById(adContentId);
  
  if (!ad || !userId) {
    return;
  }
  
  const { frequencyCap = undefined, maxImpressionsByUser = undefined } = ad.metadata || {};
  
  if (frequencyCap || maxImpressionsByUser) {
    // In production, we would update user-specific frequency counters
    console.log(`Updated frequency cap for user ${userId} and ad ${adContentId}`);
  }
}

/**
 * Get ad content for a specific treatment category
 * 
 * @param treatmentCategoryId ID of the treatment category
 * @param limit Maximum number of ads to return
 * @returns Response containing matched ad content
 */
export async function getAdContentForTreatmentCategory(
  treatmentCategoryId: string,
  limit: number = 2
): Promise<AdContentResponse> {
  const options: AdContentFilterOptions = {
    treatmentCategoryIds: [treatmentCategoryId],
    isActive: true,
    limit
  };
  
  return getAdContent(options);
}

/**
 * Get ad content for a specific company
 * 
 * @param companyId ID of the company
 * @param limit Maximum number of ads to return
 * @returns Response containing matched ad content
 */
export async function getAdContentForCompany(
  companyId: string,
  limit: number = 2
): Promise<AdContentResponse> {
  const options: AdContentFilterOptions = {
    companyIds: [companyId],
    isActive: true,
    limit
  };
  
  return getAdContent(options);
}

/**
 * Get ad content with fallback options
 * 
 * @param primaryOptions Primary filter options
 * @param fallbackOptions Fallback filter options if primary returns no results
 * @returns Response containing matched ad content or fallback content
 */
export async function getAdContentWithFallback(
  primaryOptions: AdContentFilterOptions,
  fallbackOptions: AdContentFilterOptions
): Promise<AdContentResponse> {
  // Try primary options first
  const primaryResult = await getAdContent(primaryOptions);
  
  // If primary returned content, use it
  if (primaryResult.content.length > 0) {
    return primaryResult;
  }
  
  // Otherwise, try fallback options
  return getAdContent(fallbackOptions);
}

/**
 * Get ad content by ID and track impression
 * 
 * @param adContentId ID of the ad content
 * @param questionText Optional question text for tracking
 * @param userId Optional user ID for tracking
 * @returns The ad content or undefined if not found
 */
export async function getAndTrackAdContent(
  adContentId: string,
  questionText?: string,
  userId?: string
): Promise<AdContent | undefined> {
  const adContent = getAdContentById(adContentId);
  
  if (adContent) {
    // Track impression
    const impressionId = trackImpression(adContentId, questionText, userId);
    console.log(`Tracked impression ${impressionId} for ad ${adContentId}`);
  }
  
  return adContent;
}

/**
 * Get best ad type for a treatment category
 * 
 * @param treatmentCategory Treatment category
 * @returns The recommended ad type
 */
export function getBestAdTypeForTreatment(treatmentCategory: TreatmentCategory): AdType {
  const { medicalCategory } = treatmentCategory;
  
  switch (medicalCategory) {
    case 'pharmaceutical':
      return AdType.ENHANCED;
    case 'device':
      return AdType.INTERACTIVE;
    case 'research':
      return AdType.KNOWLEDGE_GRAPH;
    case 'clinical':
      return AdType.MICROSIMULATION;
    default:
      return AdType.STANDARD;
  }
}

/**
 * Get all impressions (for reporting/analytics)
 * 
 * @returns All tracked impressions
 */
export function getAllImpressions(): AdContentImpression[] {
  return [...impressions];
}

// Create an environment file for the OpenAI API key
// Note: In a real production environment, this should be securely stored
// in environment variables or a secure credential store
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
// Don't include the actual key in the code - it should be set in the environment 

function detectAdType(adContent: AdContent): AdType {
  const creative = adContent.creative as any;
  
  if (creative?.imageUrl && !creative?.bodyText) {
    return AdType.ENHANCED;
  } else if (creative?.videoUrl) {
    return AdType.VIDEO;
  } else {
    // Default to standard text ad
    return AdType.STANDARD;
  }
} 