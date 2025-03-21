/**
 * Clinical Support Models
 * 
 * Extended models and interfaces for the Clinical Decision Support feature
 */

import { 
  ClinicalEvidence, 
  ClinicalGuideline, 
  DecisionSupportContext, 
  ClinicalDecisionSupportResponse 
} from './phase4';
import { AdContent } from './adTypes';

/**
 * Clinical evidence search options
 */
export interface EvidenceSearchOptions {
  query: string;
  medicalCategory?: string;
  treatmentIds?: string[];
  evidenceLevels?: string[];
  maxResults?: number;
  sortBy?: 'relevance' | 'date' | 'evidence_level';
  includeFullText?: boolean;
}

/**
 * Evidence matching result with relevance scoring
 */
export interface EvidenceMatchResult {
  evidence: ClinicalEvidence;
  relevanceScore: number;
  matchedKeywords: string[];
}

/**
 * Clinical guideline search options
 */
export interface GuidelineSearchOptions {
  query: string;
  organization?: string;
  category?: string;
  minRecommendationStrength?: string;
  minEvidenceQuality?: string;
  maxResults?: number;
}

/**
 * Enhanced decision support response with explanation
 */
export interface EnhancedDecisionSupportResponse extends ClinicalDecisionSupportResponse {
  confidenceScore: number;
  contextualFactors: Array<{factor: string, impact: string}>;
  differentialOptions: AdContent[];
  nextSteps?: string[];
}

/**
 * Clinical context derived from user interaction
 */
export interface UserClinicalContext {
  userId: string;
  specialties: string[];
  recentSearches: string[];
  clinicalInterests: string[];
  savedEvidence: string[];
  frequentCategories: Array<{category: string, count: number}>;
}

/**
 * Provider for clinical evidence
 */
export interface EvidenceProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  categories: string[];
  format: 'JSON' | 'XML' | 'CSV';
  maxRequestsPerDay: number;
  requestsUsedToday: number;
}

/**
 * Evidence refresh schedule
 */
export interface EvidenceRefreshSchedule {
  providerId: string;
  categories: string[];
  frequencyInDays: number;
  lastRefreshDate: Date;
  nextScheduledRefresh: Date;
  isEnabled: boolean;
}

/**
 * Content-evidence associations
 */
export interface ContentEvidenceAssociation {
  contentId: string;
  evidenceIds: string[];
  relevanceScores: {[key: string]: number};
  associationType: 'SUPPORTS' | 'CONTRADICTS' | 'CLARIFIES';
  curatedBy?: string;
  curationDate?: Date;
}

/**
 * Clinical alert for important updates
 */
export interface ClinicalAlert {
  id: string;
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  publicationDate: Date;
  expirationDate?: Date;
  affectedCategories: string[];
  affectedTreatments: string[];
  actionRequired: boolean;
  acknowledgementRequired: boolean;
} 