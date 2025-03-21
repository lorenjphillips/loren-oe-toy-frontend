/**
 * Ethical AI Guardrails
 * 
 * Service for ensuring clinical accuracy, transparency, separation of promotional 
 * content, and compliance with medical advertising standards.
 */

import { AdContent, AdContentResponse } from '../../models/adTypes';
import { getConfig } from './configuration';

/**
 * Validates the clinical accuracy of ad content
 * 
 * @param adContent The ad content to validate
 * @returns Validation result with issues if any
 */
export function validateClinicalAccuracy(adContent: AdContent) {
  const config = getConfig();
  const issues: string[] = [];
  
  // Check for required clinical citations
  if (config.requireClinicalCitations && 
      (!adContent.citations || adContent.citations.length === 0)) {
    issues.push('Missing clinical citations');
  }
  
  // Check for required disclaimers
  if (config.requireDisclaimers && 
      (!adContent.disclaimers || adContent.disclaimers.length === 0)) {
    issues.push('Missing required disclaimers');
  }
  
  // Check specific accuracy rules based on content type
  const contentType = adContent.type;
  const typeRules = config.validationRulesByType[contentType];
  
  if (typeRules?.keywords) {
    // Check for required medical keywords for this content type
    const hasRequiredKeywords = typeRules.keywords.some(
      keyword => adContent.creative.bodyText.includes(keyword)
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
  
  return {
    selectionCriteria: {
      company: adContent.company.name,
      relevanceFactor: confidenceScore || 'Not Available',
      matchedMedicalCategory: adContent.treatmentCategory.name,
      isSponsored: true
    },
    disclaimers: adContent.disclaimers || [],
    citations: adContent.citations || [],
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
  if (contentType === 'EDUCATIONAL') {
    return config.separationIndicators.educational;
  } else if (contentType === 'PROMOTIONAL') {
    return config.separationIndicators.promotional;
  } else if (contentType === 'SPONSORED') {
    return config.separationIndicators.sponsored;
  }
  
  // Default to sponsored if type is unknown
  return config.separationIndicators.sponsored;
}

/**
 * Validates compliance with medical advertising standards
 * 
 * @param adContent The ad content to validate
 * @returns Compliance validation result
 */
export function validateCompliance(adContent: AdContent) {
  const config = getConfig();
  const issues: string[] = [];
  
  // Check for required regulatory text
  if (config.requireRegulatoryText && 
      (!adContent.regulatoryText || adContent.regulatoryText.trim() === '')) {
    issues.push('Missing required regulatory text');
  }
  
  // Check for prohibited content
  const prohibitedTerms = config.prohibitedContent.terms;
  for (const term of prohibitedTerms) {
    if (adContent.creative.bodyText.toLowerCase().includes(term.toLowerCase())) {
      issues.push(`Contains prohibited term: ${term}`);
    }
  }
  
  // Check special rules for drug promotion (if applicable)
  if (adContent.isDrugPromotion) {
    // Requires fair balance of risks and benefits
    if (!adContent.creative.bodyText.toLowerCase().includes('side effect') && 
        !adContent.creative.bodyText.toLowerCase().includes('risk')) {
      issues.push('Drug promotion missing fair balance of risks and benefits');
    }
    
    // Requires generic name to be included
    if (adContent.drugBrandName && !adContent.drugGenericName) {
      issues.push('Drug promotion includes brand name but missing generic name');
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
) {
  const enhancedContent = adContentResponse.content.map(adContent => {
    const clinicalAccuracy = validateClinicalAccuracy(adContent);
    const compliance = validateCompliance(adContent);
    const transparencyInfo = getTransparencyInfo(
      adContent, 
      adContentResponse.confidenceScore, 
      questionContext
    );
    const separationIndicator = getSeparationIndicatorType(adContent);
    
    return {
      ...adContent,
      guardrails: {
        clinicalAccuracy,
        compliance,
        transparencyInfo,
        separationIndicator,
        passedAllChecks: clinicalAccuracy.isValid && compliance.isCompliant
      }
    };
  });
  
  return {
    ...adContentResponse,
    content: enhancedContent,
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