/**
 * Ad Integration Service
 * 
 * Handles the integration between promotional ad content and clinical decision support,
 * providing a seamless transition while maintaining clear separation.
 */

import { AdContent, AdType, AdContentResponse } from '../models/adTypes';
import { EnhancedDecisionSupportResponse } from '../models/clinical-support';
import { getDecisionSupport } from './clinical-support/decisionSupport';
import { classifyMedicalQuestion } from './classification';
import { getAdContentFromMapping, getAdContentWithFallback } from './adContentService';
import { mapQuestionToCompanies } from './adMapping';
import { enhanceMappingConfidence, shouldShowAd } from './confidenceScoring';

/**
 * User preference for clinical support visibility
 */
export interface ClinicalSupportPreference {
  isEnabled: boolean;
  updatedAt: Date;
  userChoiceRecorded: boolean;
}

/**
 * Combined response containing both ad content and optional clinical support
 */
export interface IntegratedContentResponse {
  adContent: AdContentResponse;
  clinicalSupport?: EnhancedDecisionSupportResponse;
  shouldShowClinicalSupport: boolean;
  userPreference: ClinicalSupportPreference;
}

// Default user preference (opted out by default)
const defaultPreference: ClinicalSupportPreference = {
  isEnabled: false,
  updatedAt: new Date(),
  userChoiceRecorded: false
};

// In-memory store of user preferences (in a real app, this would be in a database)
const userPreferences = new Map<string, ClinicalSupportPreference>();

/**
 * Get the integrated content including both ads and clinical support
 * based on user preferences and the clinical context
 * 
 * @param question Medical question or query
 * @param userId User identifier
 * @returns Integrated response with ads and optional clinical support
 */
export async function getIntegratedContent(
  question: string,
  userId?: string
): Promise<IntegratedContentResponse> {
  // Step 1: Get user preference for clinical support
  const userPreference = getUserPreference(userId);
  
  // Step 2: Get standard ad content
  const { adContent, adMappingResult } = await getRelevantAdContent(question);
  
  // Step 3: Determine if clinical support is appropriate for this query
  const shouldShowSupport = shouldShowClinicalSupport(question, adContent.content);
  
  // Step 4: If appropriate and user has opted in, get clinical support
  let clinicalSupport: EnhancedDecisionSupportResponse | undefined;
  
  if (shouldShowSupport && userPreference.isEnabled) {
    try {
      // Get medical category from classification or ad mapping
      const classification = await classifyMedicalQuestion(question);
      const medicalCategory = classification.primaryCategory?.name;
      
      // Get clinical decision support
      clinicalSupport = await getDecisionSupport(question, medicalCategory);
    } catch (error) {
      console.error('Error fetching clinical support:', error);
      // Continue without clinical support if there's an error
    }
  }
  
  return {
    adContent,
    clinicalSupport,
    shouldShowClinicalSupport: shouldShowSupport,
    userPreference
  };
}

/**
 * Get relevant ad content based on the question
 * 
 * @param question Medical question or query
 * @returns Ad content and mapping result
 */
async function getRelevantAdContent(question: string): Promise<{
  adContent: AdContentResponse;
  adMappingResult: any;
}> {
  // Step 1: Classify the question
  const classification = await classifyMedicalQuestion(question);
  
  // Step 2: Map to pharmaceutical companies
  const mappingResult = mapQuestionToCompanies(classification);
  
  // Step 3: Enhance mapping with confidence scoring
  const enhancedMapping = await enhanceMappingConfidence(mappingResult, question);
  
  // Step 4: Get ad content based on mapping
  let adContent: AdContentResponse;
  
  if (shouldShowAd(enhancedMapping)) {
    adContent = await getAdContentFromMapping(enhancedMapping);
  } else {
    // Use fallback options if confidence is too low
    const primaryOptions = {
      treatmentCategoryIds: [classification.primaryCategory?.id || ''],
      isActive: true
    };
    
    const fallbackOptions = {
      medicalCategoryIds: [classification.primaryCategory?.id || ''],
      isActive: true,
      limit: 2
    };
    
    adContent = await getAdContentWithFallback(primaryOptions, fallbackOptions);
  }
  
  return { adContent, adMappingResult: enhancedMapping };
}

/**
 * Determine if clinical support is appropriate for this question and ad content
 * 
 * @param question Medical question or query
 * @param adContent Available ad content
 * @returns Whether clinical support should be shown
 */
function shouldShowClinicalSupport(question: string, adContent: AdContent[]): boolean {
  // Check if there's any ad content
  if (!adContent || adContent.length === 0) {
    return false;
  }
  
  // Clinical patterns that indicate decision support would be valuable
  const clinicalPatterns = [
    /treatment|therapy|approach|option|regimen|protocol/i,
    /evidence|study|trial|research|data|outcome/i,
    /recommend|guideline|best practice|standard of care/i,
    /efficacy|effectiveness|compare|versus|vs/i,
    /diagnosis|prognosis|manage|care/i
  ];
  
  // Check if question matches clinical patterns
  const matchesClinicalPattern = clinicalPatterns.some(pattern => pattern.test(question));
  
  // Check if ad content is for specific types more suitable for clinical support
  const hasSuitableAdType = adContent.some(ad => 
    ad.adType === AdType.ENHANCED || 
    ad.adType === AdType.KNOWLEDGE_GRAPH || 
    ad.adType === AdType.MICROSIMULATION
  );
  
  return matchesClinicalPattern || hasSuitableAdType;
}

/**
 * Set user preference for clinical support
 * 
 * @param userId User identifier
 * @param isEnabled Whether clinical support is enabled
 * @returns Updated user preference
 */
export function setUserPreference(
  userId: string | undefined,
  isEnabled: boolean
): ClinicalSupportPreference {
  if (!userId) {
    return { ...defaultPreference, isEnabled };
  }
  
  const preference: ClinicalSupportPreference = {
    isEnabled,
    updatedAt: new Date(),
    userChoiceRecorded: true
  };
  
  userPreferences.set(userId, preference);
  return preference;
}

/**
 * Get user preference for clinical support
 * 
 * @param userId User identifier
 * @returns User preference
 */
export function getUserPreference(userId: string | undefined): ClinicalSupportPreference {
  if (!userId) {
    return defaultPreference;
  }
  
  return userPreferences.get(userId) || defaultPreference;
}

/**
 * Reset user preference to default
 * 
 * @param userId User identifier
 * @returns Default preference
 */
export function resetUserPreference(userId: string): ClinicalSupportPreference {
  if (userPreferences.has(userId)) {
    userPreferences.delete(userId);
  }
  
  return defaultPreference;
} 