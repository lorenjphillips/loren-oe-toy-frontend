/**
 * Ethical AI Type Definitions
 * 
 * Type definitions for ethical AI guardrails that extend the base ad content types.
 */

import { AdContent, AdContentResponse } from './adTypes';

/**
 * Clinical accuracy validation result
 */
export interface ClinicalAccuracyValidation {
  isValid: boolean;
  issues: string[];
  adContent: AdContent;
}

/**
 * Compliance validation result
 */
export interface ComplianceValidation {
  isCompliant: boolean;
  issues: string[];
  adContent: AdContent;
}

/**
 * Selection criteria transparency information
 */
export interface SelectionCriteria {
  company: string;
  relevanceFactor: number | string;
  matchedMedicalCategory: string;
  isSponsored: boolean;
}

/**
 * Transparency information
 */
export interface TransparencyInfo {
  selectionCriteria: SelectionCriteria;
  disclaimers: string[];
  citations: string[];
  dataUsage: string;
  aboutAds: string;
}

/**
 * Guardrails applied to ad content
 */
export interface AdContentGuardrails {
  clinicalAccuracy: ClinicalAccuracyValidation;
  compliance: ComplianceValidation;
  transparencyInfo: TransparencyInfo;
  separationIndicator: string;
  passedAllChecks: boolean;
}

/**
 * Extended AdContent with guardrails
 */
export interface GuardrailedAdContent extends AdContent {
  guardrails?: AdContentGuardrails;
  // Additional properties required for guardrails
  citations?: string[];
  disclaimers?: string[];
  regulatoryText?: string;
  isDrugPromotion?: boolean;
  drugBrandName?: string;
  drugGenericName?: string;
  type: string;
  company: {
    id: string;
    name: string;
  };
  creative: {
    headline: string;
    bodyText: string;
    imageUrl?: string;
    videoUrl?: string;
  };
  metadata: {
    priority: number;
    frequencyCap?: number;
    maxImpressionsByUser?: number;
  };
}

/**
 * Extended AdContentResponse with guardrails
 */
export interface GuardrailedAdContentResponse extends AdContentResponse {
  content: GuardrailedAdContent[];
  guardrailsApplied?: boolean;
}

/**
 * Feedback processing result
 */
export interface FeedbackResult {
  success: boolean;
  feedbackId: string;
  message: string;
} 