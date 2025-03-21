/**
 * Ethical AI Models
 * 
 * Extended models and interfaces for the Ethical AI Guardrails feature
 */

import { 
  EthicalGuardrailConfig,
  GuardrailType, 
  EthicalAssessment,
  UserFeedback
} from './phase4';

/**
 * Content bias analysis result
 */
export interface BiasAnalysisResult {
  contentId: string;
  biasScore: number;  // 0-1 where 0 is unbiased
  biasTypes: BiasType[];
  flaggedPhrases: Array<{
    phrase: string,
    biasType: BiasType,
    severity: number,
    suggestions: string[]
  }>;
  overallAssessment: string;
}

/**
 * Types of content bias
 */
export enum BiasType {
  GENDER = 'GENDER',
  RACIAL = 'RACIAL',
  AGE = 'AGE',
  SOCIOECONOMIC = 'SOCIOECONOMIC',
  TREATMENT_PREFERENCE = 'TREATMENT_PREFERENCE',
  COMPANY_PREFERENCE = 'COMPANY_PREFERENCE',
  SPECIALTY_PREFERENCE = 'SPECIALTY_PREFERENCE',
  EVIDENCE_SELECTIVE = 'EVIDENCE_SELECTIVE'
}

/**
 * Educational value assessment
 */
export interface EducationalValueAssessment {
  contentId: string;
  educationalScore: number;  // 0-1 where 1 is high educational value
  informationDensity: number;
  noveltyScore: number;
  clinicalRelevance: number;
  accuracyScore: number;
  depthOfExplanation: number;
  suggestions: string[];
}

/**
 * Content transparency analysis
 */
export interface TransparencyAnalysis {
  contentId: string;
  transparencyScore: number;  // 0-1 where 1 is completely transparent
  disclosureCompleteness: number;
  sourceAttributes: {
    sourcesDisclosed: boolean,
    sourcesVerifiable: boolean,
    sourceQuality: number
  };
  fundingDisclosure: {
    fundingClear: boolean,
    conflictsDisclosed: boolean
  };
  limitationsDisclosed: boolean;
  uncertaintyAcknowledged: boolean;
  improvementSuggestions: string[];
}

/**
 * Content balance assessment for an entire session/feed
 */
export interface ContentBalanceAssessment {
  userId: string;
  sessionId?: string;
  timeframe: 'SESSION' | 'DAY' | 'WEEK' | 'MONTH';
  companyDistribution: Array<{company: string, percentage: number}>;
  treatmentDistribution: Array<{treatment: string, percentage: number}>;
  contentTypeDistribution: Array<{type: string, percentage: number}>;
  balanceScore: number;  // 0-1 where 1 is perfectly balanced
  recommendations: string[];
}

/**
 * Guardrail exemption reason
 */
export interface GuardrailExemption {
  contentId: string;
  guardrailId: string;
  reason: string;
  approvedBy: string;
  approvalDate: Date;
  expirationDate?: Date;
  notes?: string;
}

/**
 * Guardrail activity log entry
 */
export interface GuardrailActivityLog {
  id: string;
  timestamp: Date;
  guardrailId: string;
  contentId: string;
  action: 'ASSESSED' | 'APPROVED' | 'WARNED' | 'REJECTED' | 'MODIFIED';
  originalScore: number;
  userFeedback?: UserFeedback;
  systemVersion: string;
}

/**
 * Ethical AI performance metrics
 */
export interface EthicalAIMetrics {
  timeframe: 'DAY' | 'WEEK' | 'MONTH';
  contentAssessed: number;
  contentBlocked: number;
  contentWarned: number;
  contentModified: number;
  falsePositives: number;
  falseNegatives: number;
  userSatisfactionScore: number;
  processingTimeAverage: number;
  improvementTrend: number;  // Positive is improving
}

/**
 * User ethical preferences
 */
export interface UserEthicalPreferences {
  userId: string;
  contentPreferences: {
    allowedCompanies?: string[];
    blockedCompanies?: string[];
    preferredContentTypes?: string[];
    sensitiveCategories?: string[];
  };
  transparencyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  educationalFocus: boolean;
  biasProtectionEnabled: boolean;
  lastUpdated: Date;
} 