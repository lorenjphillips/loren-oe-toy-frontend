/**
 * Ethical AI Integration
 * 
 * Service for integrating ethical AI guardrails with the existing ad system.
 * Provides utility functions and wrapper methods for applying guardrails.
 */

import { 
  getAdContent, 
  getAdContentFromMapping, 
  getAdContentForTreatmentCategory,
  getAdContentForCompany,
  getAdContentWithFallback
} from '../adContentService';
import { applyGuardrails } from './guardrails';
import { getConfidenceThreshold, meetsConfidenceThreshold } from './configuration';
import { AdContentFilterOptions, AdContentResponse } from '../../models/adTypes';
import { GuardrailedAdContentResponse } from '../../models/ethicalAITypes';
import { EnhancedMappingResult } from '../confidenceScoring';

/**
 * Get ad content with guardrails applied
 * 
 * @param options Filtering options for ad content
 * @param questionContext Optional original question for context
 * @returns Response containing guardrailed ad content
 */
export async function getAdContentWithGuardrails(
  options: AdContentFilterOptions = {},
  questionContext?: string
): Promise<GuardrailedAdContentResponse> {
  // Get the regular ad content
  const adContentResponse = await getAdContent(options);
  
  // Apply the guardrails
  return applyGuardrails(adContentResponse, questionContext);
}

/**
 * Get ad content from mapping with guardrails applied
 * 
 * @param mappingResult Result from confidence scoring
 * @param limit Maximum number of ads to return
 * @returns Response containing guardrailed ad content
 */
export async function getAdContentFromMappingWithGuardrails(
  mappingResult: EnhancedMappingResult,
  limit: number = 2
): Promise<GuardrailedAdContentResponse> {
  // Get the regular ad content
  const adContentResponse = await getAdContentFromMapping(mappingResult, limit);
  
  // Apply the guardrails
  return applyGuardrails(
    adContentResponse, 
    mappingResult.originalQuestion
  );
}

/**
 * Get ad content for a treatment category with guardrails applied
 * 
 * @param treatmentCategoryId ID of the treatment category
 * @param limit Maximum number of ads to return
 * @returns Response containing guardrailed ad content
 */
export async function getAdContentForTreatmentCategoryWithGuardrails(
  treatmentCategoryId: string,
  limit: number = 2
): Promise<GuardrailedAdContentResponse> {
  // Get the regular ad content
  const adContentResponse = await getAdContentForTreatmentCategory(treatmentCategoryId, limit);
  
  // Apply the guardrails
  return applyGuardrails(adContentResponse);
}

/**
 * Get ad content for a company with guardrails applied
 * 
 * @param companyId ID of the company
 * @param limit Maximum number of ads to return
 * @returns Response containing guardrailed ad content
 */
export async function getAdContentForCompanyWithGuardrails(
  companyId: string,
  limit: number = 2
): Promise<GuardrailedAdContentResponse> {
  // Get the regular ad content
  const adContentResponse = await getAdContentForCompany(companyId, limit);
  
  // Apply the guardrails
  return applyGuardrails(adContentResponse);
}

/**
 * Get ad content with fallback and guardrails applied
 * 
 * @param primaryOptions Primary filter options
 * @param fallbackOptions Fallback filter options if primary returns no results
 * @param questionContext Optional original question for context
 * @returns Response containing guardrailed ad content
 */
export async function getAdContentWithFallbackAndGuardrails(
  primaryOptions: AdContentFilterOptions,
  fallbackOptions: AdContentFilterOptions,
  questionContext?: string
): Promise<GuardrailedAdContentResponse> {
  // Get the regular ad content with fallback
  const adContentResponse = await getAdContentWithFallback(primaryOptions, fallbackOptions);
  
  // Apply the guardrails
  return applyGuardrails(adContentResponse, questionContext);
}

/**
 * Filter out ad content that doesn't pass all guardrail checks
 * 
 * @param adContentResponse Response with guardrails applied
 * @returns Filtered response containing only compliant content
 */
export function filterCompliantContent(
  adContentResponse: GuardrailedAdContentResponse
): GuardrailedAdContentResponse {
  // Filter out content that doesn't pass all checks
  const compliantContent = adContentResponse.content.filter(
    content => content.guardrails?.passedAllChecks === true
  );
  
  return {
    ...adContentResponse,
    content: compliantContent,
    totalFound: compliantContent.length
  };
}

/**
 * Check if result meets confidence thresholds for display
 * 
 * @param mappingResult Mapping result with confidence score
 * @returns True if the result meets confidence threshold
 */
export function meetsGuardrailConfidenceThreshold(
  mappingResult: EnhancedMappingResult
): boolean {
  return meetsConfidenceThreshold(mappingResult.overallConfidence);
}

/**
 * Get the current guardrail confidence threshold
 * 
 * @returns The current threshold value
 */
export function getGuardrailConfidenceThreshold(): number {
  return getConfidenceThreshold();
} 