/**
 * Question Context Metrics Model
 * 
 * Models for capturing the medical context of questions.
 * Enables analysis of ad performance by medical specialty,
 * treatment type, disease state, and contextual relevance.
 */

import { AnalyticsEvent, AnalyticsEventCategory } from './AnalyticsEvent';

/**
 * Medical specialty enumeration
 */
export enum MedicalSpecialty {
  CARDIOLOGY = 'cardiology',
  ONCOLOGY = 'oncology',
  NEUROLOGY = 'neurology',
  ENDOCRINOLOGY = 'endocrinology',
  GASTROENTEROLOGY = 'gastroenterology',
  IMMUNOLOGY = 'immunology',
  DERMATOLOGY = 'dermatology',
  PEDIATRICS = 'pediatrics',
  PSYCHIATRY = 'psychiatry',
  PULMONOLOGY = 'pulmonology',
  RHEUMATOLOGY = 'rheumatology',
  INFECTIOUS_DISEASE = 'infectious_disease',
  OTHER = 'other',
  UNKNOWN = 'unknown'
}

/**
 * Question intent categorization
 */
export enum QuestionIntent {
  TREATMENT_SELECTION = 'treatment_selection',
  DIAGNOSTIC = 'diagnostic',
  MECHANISM_OF_ACTION = 'mechanism_of_action',
  SIDE_EFFECT = 'side_effect',
  DRUG_INTERACTION = 'drug_interaction',
  DOSING = 'dosing',
  CONTRAINDICATION = 'contraindication',
  EFFICACY = 'efficacy',
  PATIENT_EDUCATION = 'patient_education',
  RESEARCH = 'research',
  GENERAL_INFORMATION = 'general_information',
  OTHER = 'other'
}

/**
 * Question complexity levels
 */
export enum QuestionComplexity {
  BASIC = 'basic',           // Straightforward, factual
  INTERMEDIATE = 'intermediate', // Some nuance required
  COMPLEX = 'complex',       // Multiple factors to consider
  ADVANCED = 'advanced'      // Cutting-edge, research-level
}

/**
 * Patient demographic context in question
 */
export interface PatientContext {
  ageRange?: string;         // Age range if specified (anonymized)
  pediatric?: boolean;       // Whether pediatric patient
  geriatric?: boolean;       // Whether geriatric patient
  gender?: string;           // Gender if specified (anonymized)
  comorbidities?: string[];  // Comorbid conditions if mentioned
  pregnancyRelevant?: boolean; // Whether pregnancy was mentioned
  renalImpairment?: boolean; // Whether renal function was mentioned
  hepaticImpairment?: boolean; // Whether liver function was mentioned
}

/**
 * Core question context data
 */
export interface QuestionContextData {
  questionId: string;                // Unique question identifier
  timestamp: number;                 // When question was asked
  specialty: MedicalSpecialty;       // Medical specialty
  intent: QuestionIntent;            // Question intent
  complexity: QuestionComplexity;    // Question complexity
  
  // Medical context (all anonymized/normalized)
  medicalCategories: string[];       // Medical categories mentioned
  diseaseStates: string[];           // Disease states mentioned
  treatmentTypes: string[];          // Treatment types mentioned 
  medications: string[];             // Medications mentioned
  
  // Question metadata
  wordCount: number;                 // Word count of question
  containsPatientContext: boolean;   // Whether patient context was included
  patientContext?: PatientContext;   // Patient context if included (anonymized)
  
  // Content relevance
  keywordDensity?: Record<string, number>; // Keyword analysis (anonymized)
  namedEntities?: {                  // Named medical entities (anonymized)
    type: string;
    normalizedValue: string;
    confidence: number;
  }[];
  
  // For research questions
  researchContext?: {
    isResearch: boolean;
    studyType?: string;
    evidenceLevel?: string;
  };
}

/**
 * Question context event interface
 */
export interface QuestionContextEvent extends AnalyticsEvent {
  eventType: 'question_context_analyzed';
  eventCategory: AnalyticsEventCategory.CONTEXT;
  metadata: QuestionContextData;
}

/**
 * Ad-to-question relevance metrics
 */
export interface AdQuestionRelevanceMetrics {
  adId: string;                // Ad content ID
  questionId: string;          // Question ID
  overallRelevanceScore: number; // 0-1 relevance score
  
  // Component relevance scores
  medicalCategoryRelevance: number;
  treatmentTypeRelevance: number;
  diseaseStateRelevance: number;
  specialtyRelevance: number;
  
  // Semantic relevance
  semanticSimilarity: number;  // Latent semantic analysis score
  contextualFit: number;       // How well ad fits question context
  
  // Content matching
  keywordMatchCount: number;   // Number of keywords matched
  entityMatchCount: number;    // Number of medical entities matched
  
  // Classifier confidence
  algorithmConfidence: number; // Confidence of matching algorithm
}

/**
 * Aggregate context metrics for reporting
 */
export interface AggregateContextMetrics {
  questionsAnalyzed: number;
  specialtyDistribution: Record<MedicalSpecialty, number>;
  intentDistribution: Record<QuestionIntent, number>;
  complexityDistribution: Record<QuestionComplexity, number>;
  
  topMedicalCategories: {
    category: string;
    count: number;
    percentage: number;
  }[];
  
  topDiseaseStates: {
    disease: string;
    count: number;
    percentage: number;
  }[];
  
  topTreatmentTypes: {
    treatment: string;
    count: number;
    percentage: number;
  }[];
  
  averageRelevanceScore: number;
  relevanceDistribution: {
    high: number;    // 0.8-1.0
    medium: number;  // 0.5-0.79
    low: number;     // 0.0-0.49
  };
} 