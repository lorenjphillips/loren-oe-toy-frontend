/**
 * Phase 4 - Innovation Layer Interfaces
 * 
 * This file contains interfaces for Clinical Decision Support,
 * Ethical AI Guardrails, and related feedback mechanisms.
 */

import { AdContent } from './adTypes';

/**
 * Clinical Decision Support
 */

export interface ClinicalEvidence {
  id: string;
  title: string;
  source: string;
  publicationDate: Date;
  evidenceLevel: EvidenceLevel;
  url: string;
  summary: string;
  fullText?: string;
  tags: string[];
}

export enum EvidenceLevel {
  META_ANALYSIS = 'META_ANALYSIS',
  SYSTEMATIC_REVIEW = 'SYSTEMATIC_REVIEW',
  RANDOMIZED_CONTROLLED_TRIAL = 'RANDOMIZED_CONTROLLED_TRIAL',
  COHORT_STUDY = 'COHORT_STUDY',
  CASE_CONTROL = 'CASE_CONTROL',
  CASE_SERIES = 'CASE_SERIES',
  EXPERT_OPINION = 'EXPERT_OPINION'
}

export interface ClinicalGuideline {
  id: string;
  title: string;
  organization: string;
  publicationDate: Date;
  lastUpdated: Date;
  url: string;
  summary: string;
  recommendations: ClinicalRecommendation[];
}

export interface ClinicalRecommendation {
  id: string;
  text: string;
  strengthOfRecommendation: RecommendationStrength;
  evidenceQuality: EvidenceQuality;
}

export enum RecommendationStrength {
  STRONG = 'STRONG',
  MODERATE = 'MODERATE',
  WEAK = 'WEAK',
  CONDITIONAL = 'CONDITIONAL'
}

export enum EvidenceQuality {
  HIGH = 'HIGH',
  MODERATE = 'MODERATE',
  LOW = 'LOW',
  VERY_LOW = 'VERY_LOW'
}

export interface DecisionSupportContext {
  question: string;
  medicalCategory: string;
  subcategory?: string;
  treatmentCategory?: string;
  patientFactors?: PatientFactor[];
}

export interface PatientFactor {
  factor: string;
  value: string | number | boolean;
}

export interface ClinicalDecisionSupportResponse {
  relevantEvidence: ClinicalEvidence[];
  applicableGuidelines: ClinicalGuideline[];
  suggestedContent: AdContent[];
  explanations: string[];
}

/**
 * Ethical AI Guardrails
 */

export interface EthicalGuardrailConfig {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  severity: GuardrailSeverity;
  guardrailType: GuardrailType;
  thresholds: GuardrailThresholds;
}

export enum GuardrailSeverity {
  BLOCK = 'BLOCK',       // Block the content
  WARNING = 'WARNING',   // Show warning but allow display
  MONITOR = 'MONITOR'    // Only log for analysis
}

export enum GuardrailType {
  BIAS_DETECTION = 'BIAS_DETECTION',
  CONTENT_BALANCE = 'CONTENT_BALANCE',
  EDUCATIONAL_VALUE = 'EDUCATIONAL_VALUE',
  EVIDENCE_QUALITY = 'EVIDENCE_QUALITY',
  TRANSPARENCY = 'TRANSPARENCY'
}

export interface GuardrailThresholds {
  minAcceptable: number;   // 0-1 threshold for acceptable content
  targetIdeal: number;     // 0-1 threshold for ideal content
  maxAllowable: number;    // 0-1 threshold for maximum allowable
}

export interface EthicalAssessment {
  id: string;
  timestamp: Date;
  contentId: string;
  guardrailId: string;
  score: number;
  decision: GuardrailDecision;
  explanation: string;
  suggestedAlternatives?: string[];
}

export enum GuardrailDecision {
  APPROVED = 'APPROVED',
  MODIFIED = 'MODIFIED',
  WARNING = 'WARNING',
  REJECTED = 'REJECTED'
}

/**
 * Feedback Mechanisms
 */

export interface UserFeedback {
  id: string;
  userId: string;
  contentId: string;
  timestamp: Date;
  feedbackType: FeedbackType;
  rating?: number;
  comment?: string;
  clinicalRelevance?: number;
  educationalValue?: number;
  tags: string[];
}

export enum FeedbackType {
  HELPFULNESS = 'HELPFULNESS',
  ACCURACY = 'ACCURACY',
  BIAS = 'BIAS',
  EDUCATIONAL_VALUE = 'EDUCATIONAL_VALUE',
  CLINICAL_RELEVANCE = 'CLINICAL_RELEVANCE',
  GENERAL = 'GENERAL'
}

export interface FeedbackAnalytics {
  contentId: string;
  totalFeedback: number;
  averageRating: number;
  categoryBreakdown: {[key in FeedbackType]?: number};
  commonTags: Array<{tag: string, count: number}>;
  recentComments: Array<{comment: string, timestamp: Date}>;
} 