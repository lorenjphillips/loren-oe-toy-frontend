/**
 * Ethical AI Configuration
 * 
 * Configuration service for ethical AI guardrails that defines validation rules,
 * transparency requirements, confidence thresholds, and feedback parameters.
 */

import { AdType } from '../../types/ad';

/**
 * Configuration interface for ethical AI guardrails
 */
export interface EthicalAIConfig {
  // Clinical accuracy requirements
  requireClinicalCitations: boolean;
  requireDisclaimers: boolean;
  
  // Content validation rules by type
  validationRulesByType: {
    [key: string]: {
      keywords?: string[];
      requiredElements?: string[];
      prohibitedElements?: string[];
    }
  };
  
  // Transparency settings
  transparencyDisclosures: {
    dataUsage: string;
    aboutAds: string;
    confidenceThreshold: number;
  };
  
  // Content separation indicators
  separationIndicators: {
    sponsored: string;
    promotional: string;
    educational: string;
  };
  
  // Compliance requirements
  requireRegulatoryText: boolean;
  prohibitedContent: {
    terms: string[];
    claims: string[];
  };
  
  // Feedback collection
  feedbackOptions: {
    types: string[];
    requireReason: boolean;
    notifyOnFeedback: boolean;
  };
}

// Default configuration
const defaultConfig: EthicalAIConfig = {
  // Clinical accuracy requirements
  requireClinicalCitations: true,
  requireDisclaimers: true,
  
  // Content validation rules by ad type
  validationRulesByType: {
    [AdType.TEXT]: {
      keywords: ['treatment', 'therapy', 'medication', 'drug', 'clinical']
    },
    [AdType.IMAGE]: {
      keywords: ['treatment', 'therapy', 'medication', 'drug', 'clinical'],
      requiredElements: ['logo', 'disclaimer']
    },
    [AdType.VIDEO]: {
      keywords: ['treatment', 'therapy', 'medication', 'drug', 'clinical'],
      requiredElements: ['logo', 'disclaimer', 'fair-balance']
    }
  },
  
  // Transparency settings
  transparencyDisclosures: {
    dataUsage: 'This content was selected based on the medical topic you searched for. No personal health data was used to select this content.',
    aboutAds: 'This is sponsored content provided by pharmaceutical companies that may be relevant to your question.',
    confidenceThreshold: 0.7
  },
  
  // Content separation indicators
  separationIndicators: {
    sponsored: 'SPONSORED',
    promotional: 'ADVERTISEMENT',
    educational: 'EDUCATIONAL CONTENT'
  },
  
  // Compliance requirements
  requireRegulatoryText: true,
  prohibitedContent: {
    terms: [
      'cure',
      'guaranteed',
      'miracle',
      'magic',
      'revolutionary',
      'perfect',
      'immediate'
    ],
    claims: [
      'cures all',
      'works for everyone',
      'no side effects',
      'better than any other'
    ]
  },
  
  // Feedback collection
  feedbackOptions: {
    types: [
      'inaccurate',
      'misleading',
      'inappropriate',
      'irrelevant',
      'other'
    ],
    requireReason: false,
    notifyOnFeedback: true
  }
};

// Active configuration (could be overridden at runtime)
let activeConfig: EthicalAIConfig = { ...defaultConfig };

/**
 * Get the current ethical AI configuration
 * 
 * @returns The current configuration
 */
export function getConfig(): EthicalAIConfig {
  return activeConfig;
}

/**
 * Set a new configuration (partial updates supported)
 * 
 * @param config Partial or complete new configuration
 * @returns The updated configuration
 */
export function setConfig(config: Partial<EthicalAIConfig>): EthicalAIConfig {
  activeConfig = {
    ...activeConfig,
    ...config
  };
  
  return activeConfig;
}

/**
 * Reset configuration to defaults
 * 
 * @returns The default configuration
 */
export function resetConfig(): EthicalAIConfig {
  activeConfig = { ...defaultConfig };
  return activeConfig;
}

/**
 * Get confidence threshold for ad display
 * 
 * @returns The current confidence threshold
 */
export function getConfidenceThreshold(): number {
  return activeConfig.transparencyDisclosures.confidenceThreshold;
}

/**
 * Validate if an ad meets the minimum confidence threshold
 * 
 * @param confidenceScore The confidence score to check
 * @returns True if the score meets or exceeds the threshold
 */
export function meetsConfidenceThreshold(confidenceScore: number): boolean {
  return confidenceScore >= getConfidenceThreshold();
} 