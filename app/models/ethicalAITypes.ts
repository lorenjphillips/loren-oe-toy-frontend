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
 * Extended creative type for GuardrailedAdContent
 */
export interface EnhancedCreative {
  displaySettings?: Record<string, any>;
  headline: string;
  bodyText: string;
  imageUrl?: string;
  videoUrl?: string;
}

/**
 * Extended AdContent with guardrails
 */
export interface GuardrailedAdContent {
  // Base AdContent properties
  id: string;
  title: string;
  description: string;
  campaignId: string;
  adType: string;
  type: string;
  company: {
    id: string;
    name: string;
    primaryColor?: string;
    secondaryColor?: string;
    defaultDisplaySettings?: Record<string, any>;
  };
  treatmentCategory: {
    id: string;
    name: string;
  };
  targetConditions: string[];
  brandName?: string;
  tags?: string[];
  contentWarnings?: string[];
  metadata?: Record<string, any>;
  treatmentCategoryId: string;
  genericName?: string;
  manufacturer?: string;
  imageUrl?: string;
  templateId?: string;
  callToAction?: {
    text: string;
    url: string;
    trackingId: string;
  };
  keywords: string[];
  entityMappings: {
    entity: string;
    type: string;
    confidence: number;
  }[];
  interactiveContent?: any;
  videoUrl?: string;
  microsimulationConfig?: {
    modelId: string;
    parameters: Record<string, any>;
  };
  knowledgeGraphConfig?: {
    topics: string[];
    depth: number;
  };
  createdAt: number;
  updatedAt: number;
  activeTo: number;
  isActive: boolean;
  regulatoryApproved: boolean;
  disclaimers: string[];
  references: {
    title: string;
    url: string;
  }[];
  
  // Enhanced properties for guardrails
  guardrails?: AdContentGuardrails;
  creative: EnhancedCreative;
  citations?: string[];
  regulatoryText?: string;
  isDrugPromotion?: boolean;
  drugBrandName?: string;
  drugGenericName?: string;
}

/**
 * Extended AdContentResponse with guardrails
 */
export interface GuardrailedAdContentResponse {
  content: GuardrailedAdContent[];
  totalFound: number;
  confidenceScore?: number;
  impressionId?: string;
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