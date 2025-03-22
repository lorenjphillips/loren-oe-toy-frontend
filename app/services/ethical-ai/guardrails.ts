/**
 * Ethical AI Guardrails
 * 
 * Service for ensuring clinical accuracy, transparency, separation of promotional 
 * content, and compliance with medical advertising standards.
 */

import { AdContent, AdContentResponse, AdType } from '../../models/adTypes';
import { GuardrailedAdContent, GuardrailedAdContentResponse } from '../../models/ethicalAITypes';
import { getConfig } from './configuration';

/**
 * Extended interfaces with additional properties needed for this module
 */
interface ExtendedAdContent extends AdContent {
  citations?: Array<{
    title: string;
    url: string;
  }>;
  regulatoryText?: string;
  isDrugPromotion?: boolean;
}

/**
 * Validates the clinical accuracy of ad content
 * 
 * @param adContent The ad content to validate
 * @returns Validation result with issues if any
 */
export function validateClinicalAccuracy(adContent: AdContent) {
  const config = getConfig();
  const issues: string[] = [];
  
  // Cast to extended type
  const extendedAdContent = adContent as ExtendedAdContent;
  
  // Check for required clinical citations
  if (config.requireClinicalCitations && 
      (!extendedAdContent.citations || extendedAdContent.citations.length === 0)) {
    issues.push('Missing clinical citations');
  }
  
  // Check for required disclaimers
  if (config.requireDisclaimers && 
      (!adContent.disclaimers || adContent.disclaimers.length === 0)) {
    issues.push('Missing required disclaimers');
  }
  
  // Check specific accuracy rules based on content type
  const contentType = adContent.type;
  const typeRules = contentType ? config.validationRulesByType[contentType] : undefined;
  
  if (typeRules?.keywords) {
    // Check for required medical keywords for this content type
    const bodyText = adContent.creative?.bodyText || '';
    
    const hasRequiredKeywords = typeRules.keywords.some(
      (keyword: string) => bodyText.includes(keyword)
    );
    
    if (!hasRequiredKeywords) {
      issues.push(`Missing required medical terminology for ${contentType}`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    adContent
  };
}

/**
 * Provides transparency information about why an ad was selected
 * 
 * @param adContent The ad content to provide transparency for
 * @param confidenceScore The confidence score used for selection
 * @param questionContext The original question context if available
 * @returns Transparency information
 */
export function getTransparencyInfo(
  adContent: AdContent, 
  confidenceScore?: number, 
  questionContext?: string
) {
  const config = getConfig();
  const extendedAdContent = adContent as ExtendedAdContent;
  
  // Convert citation objects to string array if needed
  const citationStrings = (extendedAdContent.citations || []).map(
    citation => citation.title || citation.url || ''
  ).filter(text => text.length > 0);
  
  return {
    selectionCriteria: {
      company: adContent.company.name,
      relevanceFactor: confidenceScore || 'Not Available',
      matchedMedicalCategory: adContent.treatmentCategory.name,
      isSponsored: true
    },
    disclaimers: adContent.disclaimers || [],
    citations: citationStrings,
    dataUsage: config.transparencyDisclosures.dataUsage,
    aboutAds: config.transparencyDisclosures.aboutAds
  };
}

/**
 * Determines the separation indicator type based on content
 * 
 * @param adContent The ad content to check
 * @returns The type of separation indicator to show
 */
export function getSeparationIndicatorType(adContent: AdContent) {
  const config = getConfig();
  const contentType = adContent.type;
  
  // Return appropriate indicator type based on content
  if (contentType === AdType.STANDARD) {
    return config.separationIndicators.educational;
  } else if (contentType === AdType.ENHANCED) {
    return config.separationIndicators.promotional;
  } else if (contentType === AdType.INTERACTIVE) {
    return config.separationIndicators.sponsored;
  }
  
  // Default to sponsored if type is unknown
  return config.separationIndicators.sponsored;
}

/**
 * Validates compliance with medical advertising standards
 * 
 * @param adContent The ad content to validate
 * @returns Validation result with issues if any
 */
export function validateCompliance(adContent: AdContent) {
  const config = getConfig();
  const issues: string[] = [];
  const extendedAdContent = adContent as ExtendedAdContent;
  const bodyText = adContent.creative?.bodyText || '';
  
  // Check for regulatory text where required
  if (config.requireRegulatoryText && 
      (!extendedAdContent.regulatoryText || extendedAdContent.regulatoryText.trim() === '')) {
    issues.push('Missing required regulatory text');
  }
  
  // Check for prohibited terms
  const prohibitedTerms = config.prohibitedContent.terms;
  for (const term of prohibitedTerms) {
    if (bodyText.toLowerCase().includes(term.toLowerCase())) {
      issues.push(`Contains prohibited term: ${term}`);
    }
  }
  
  // Additional checks for drug promotion
  if (extendedAdContent.isDrugPromotion) {
    // Check for side effect disclosure
    if (!bodyText.toLowerCase().includes('side effect') &&
        !bodyText.toLowerCase().includes('risk')) {
      issues.push('Drug promotion requires side effect/risk disclosure');
    }
    
    // Check for generic name alongside brand name
    if (adContent.brandName && !adContent.genericName) {
      issues.push('Drug promotion requires generic name alongside brand name');
    }
  }
  
  return {
    isCompliant: issues.length === 0,
    issues,
    adContent
  };
}

/**
 * Apply all guardrails to ad content
 * 
 * @param adContentResponse The ad content response to validate
 * @param questionContext Optional original question for context
 * @returns Enhanced ad content with validation results
 */
export function applyGuardrails(
  adContentResponse: AdContentResponse,
  questionContext?: string
): GuardrailedAdContentResponse {
  const enhancedContent = adContentResponse.content.map(adContent => {
    const clinicalAccuracy = validateClinicalAccuracy(adContent);
    const compliance = validateCompliance(adContent);
    const transparencyInfo = getTransparencyInfo(
      adContent, 
      adContentResponse.confidenceScore, 
      questionContext
    );
    const separationIndicator = getSeparationIndicatorType(adContent);
    
    // Ensure all required properties for GuardrailedAdContent exist
    const creative = {
      headline: adContent.creative?.headline || '',
      bodyText: adContent.creative?.bodyText || '',
      imageUrl: adContent.creative?.imageUrl,
      videoUrl: adContent.creative?.videoUrl,
      displaySettings: adContent.creative?.displaySettings
    };
    
    return {
      ...adContent,
      // Ensure required properties are not undefined
      id: adContent.id || '',
      name: adContent.name || '',
      title: adContent.title || '',
      description: adContent.description || '',
      campaignId: adContent.campaignId || '',
      adType: adContent.adType || '',
      type: adContent.type || '',
      treatmentCategoryId: adContent.treatmentCategoryId || '',
      keywords: adContent.keywords || [],
      createdAt: adContent.createdAt || 0,
      updatedAt: adContent.updatedAt || 0,
      activeTo: adContent.activeTo || 0,
      isActive: typeof adContent.isActive === 'boolean' ? adContent.isActive : false,
      regulatoryApproved: typeof adContent.regulatoryApproved === 'boolean' ? adContent.regulatoryApproved : false,
      disclaimers: adContent.disclaimers || [],
      creative: creative,
      guardrails: {
        clinicalAccuracy,
        compliance,
        transparencyInfo,
        separationIndicator,
        passedAllChecks: clinicalAccuracy.isValid && compliance.isCompliant
      }
    } as GuardrailedAdContent;
  });
  
  return {
    content: enhancedContent,
    totalFound: adContentResponse.totalFound || enhancedContent.length,
    confidenceScore: adContentResponse.confidenceScore,
    impressionId: adContentResponse.impressionId,
    guardrailsApplied: true
  };
}

/**
 * Process feedback on ad content
 * 
 * @param adContentId ID of the ad content
 * @param feedbackType Type of feedback (inappropriate, inaccurate, etc.)
 * @param feedbackText Optional detailed feedback
 * @param userId Optional user ID
 * @returns Feedback processing result
 */
export function processFeedback(
  adContentId: string,
  feedbackType: string,
  feedbackText?: string,
  userId?: string
) {
  // In a real implementation, this would store feedback in a database
  console.log(`Feedback received for ad ${adContentId}: ${feedbackType}`);
  
  // For demo purposes, just return confirmation
  return {
    success: true,
    feedbackId: `fb-${Date.now()}`,
    message: 'Thank you for your feedback. Our team will review it.'
  };
} 