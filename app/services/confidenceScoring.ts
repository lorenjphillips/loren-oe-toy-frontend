import OpenAI from 'openai';
import { MedicalClassification } from './classification';
import { PharmaMappingResult, CompanyMatch } from './adMapping';
import { env } from '../lib/env';

/**
 * Confidence factors that influence the final ad confidence score
 */
export interface ConfidenceFactors {
  categoryMatchScore: number;       // How well the category matches (0-1)
  semanticSimilarityScore: number;  // Semantic similarity score (0-1)
  questionSpecificityScore: number; // How specific the question is (0-1)
  clinicalContextScore: number;     // Relevance to clinical context (0-1)
  keywordRelevanceScore: number;    // Relevance of matched keywords (0-1)
  medicationMatchScore: number;     // Strength of medication matches (0-1)
}

/**
 * Enhanced company match with confidence scoring
 */
export interface EnhancedCompanyMatch extends CompanyMatch {
  confidenceScore: number;           // Overall confidence score (0-1)
  confidenceFactors: ConfidenceFactors; // Breakdown of confidence factors
  shouldShowAd: boolean;             // Whether confidence is high enough to show ad
}

/**
 * Enhanced mapping result with confidence scores
 */
export interface EnhancedMappingResult extends Omit<PharmaMappingResult, 'matches' | 'topMatch'> {
  matches: EnhancedCompanyMatch[];   // Enhanced matches with confidence scores
  topMatch?: EnhancedCompanyMatch;   // Enhanced top match (if any)
  overallConfidence: number;         // Overall confidence in the mapping (0-1)
  adRecommended: boolean;            // Whether an ad is recommended based on confidence
  originalQuestionText: string;      // The original question text
  questionEmbedding?: number[];      // Vector embedding of the question (if available)
}

/**
 * Configuration options for confidence scoring
 */
export interface ConfidenceScoringOptions {
  confidenceThreshold?: number;   // Threshold for showAd flag (0-1)
  semanticAnalysis?: boolean;     // Whether to use semantic similarity analysis
  model?: string;                 // OpenAI model to use for embeddings
  debug?: boolean;                // Whether to include debug information
}

/**
 * Default confidence scoring options
 */
const DEFAULT_CONFIDENCE_OPTIONS: ConfidenceScoringOptions = {
  confidenceThreshold: env.get('CONFIDENCE_THRESHOLD'),
  semanticAnalysis: env.get('ENABLE_SEMANTIC_ANALYSIS'),
  model: env.get('OPENAI_EMBEDDING_MODEL'),
  debug: env.get('ENABLE_DEBUG_LOGGING')
};

/**
 * Class for confidence scoring of pharmaceutical ad relevance
 */
export class ConfidenceScorer {
  private openai: OpenAI;
  private defaultOptions: ConfidenceScoringOptions;

  /**
   * Creates a new ConfidenceScorer
   */
  constructor() {
    try {
      const apiKey = env.get('OPENAI_API_KEY');
      
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      
      this.defaultOptions = { ...DEFAULT_CONFIDENCE_OPTIONS };
    } catch (error) {
      console.error('Error initializing ConfidenceScorer:', error);
      throw new Error(`Failed to initialize ConfidenceScorer: ${(error as Error).message}`);
    }
  }

  /**
   * Generate embedding vector for a text string
   * @param text Text to embed
   * @param model Embedding model to use
   * @returns Vector embedding
   */
  async generateEmbedding(text: string, model: string = this.defaultOptions.model!): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model,
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error(`Failed to generate embedding: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param vecA First vector
   * @param vecB Second vector
   * @returns Similarity score between 0-1
   */
  calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same dimensions');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0; // Avoid division by zero
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Analyze question specificity and clinical context
   * @param questionText Original question text
   * @param classification Medical classification
   * @returns Object containing specificity and clinical context scores
   */
  analyzeQuestionContext(questionText: string, classification: MedicalClassification): {
    specificityScore: number;
    clinicalContextScore: number;
  } {
    // Words that indicate specificity
    const specificityIndicators = [
      'specific', 'exact', 'precise', 'particular', 'detailed',
      'dosage', 'protocol', 'regimen', 'guideline', 'procedure'
    ];
    
    // Words that indicate general questions
    const generalityIndicators = [
      'general', 'overview', 'broad', 'basics', 'introduction',
      'summary', 'primer', 'background', 'fundamentals'
    ];
    
    // Words indicating clinical context
    const clinicalContextIndicators = [
      'treatment', 'therapy', 'medication', 'drug', 'dose',
      'diagnosis', 'prognosis', 'management', 'care', 'patient',
      'clinical', 'trial', 'evidence', 'study', 'guideline',
      'contraindication', 'side effect', 'adverse', 'efficacy',
      'effectiveness', 'prescription', 'administer', 'therapeutic'
    ];
    
    // Calculate specificity score
    let specificityScore = 0.5; // Start at neutral
    const lowerQuestion = questionText.toLowerCase();
    
    // Check for specificity indicators
    for (const indicator of specificityIndicators) {
      if (lowerQuestion.includes(indicator)) {
        specificityScore += 0.1; // Increase score for each specificity indicator
      }
    }
    
    // Check for generality indicators
    for (const indicator of generalityIndicators) {
      if (lowerQuestion.includes(indicator)) {
        specificityScore -= 0.1; // Decrease score for each generality indicator
      }
    }
    
    // Count question length as a factor (longer questions tend to be more specific)
    const wordCount = questionText.split(/\s+/).length;
    if (wordCount > 20) {
      specificityScore += 0.1;
    } else if (wordCount < 5) {
      specificityScore -= 0.1;
    }
    
    // Adjust based on confidence in classification
    specificityScore += (classification.primaryCategory.confidence - 0.5) * 0.2;
    specificityScore += (classification.subcategory.confidence - 0.5) * 0.2;
    
    // Ensure score is between 0 and 1
    specificityScore = Math.max(0, Math.min(1, specificityScore));
    
    // Calculate clinical context score
    let clinicalContextScore = 0;
    
    // Check for clinical context indicators
    for (const indicator of clinicalContextIndicators) {
      if (lowerQuestion.includes(indicator)) {
        clinicalContextScore += 0.1; // Increase score for each clinical indicator
      }
    }
    
    // Presence of medications is a strong clinical indicator
    if (classification.relevantMedications && classification.relevantMedications.length > 0) {
      clinicalContextScore += 0.3;
    }
    
    // Ensure score is between 0 and 1
    clinicalContextScore = Math.max(0, Math.min(1, clinicalContextScore));
    
    return {
      specificityScore,
      clinicalContextScore
    };
  }

  /**
   * Calculate confidence factors for a company match
   * @param match Original company match
   * @param questionText Original question text
   * @param classification Medical classification
   * @param questionEmbedding Embedding vector of the question
   * @param treatmentAreaEmbeddings Map of treatment area embeddings
   * @returns Confidence factors
   */
  async calculateConfidenceFactors(
    match: CompanyMatch,
    questionText: string,
    classification: MedicalClassification,
    questionEmbedding?: number[],
    treatmentAreaEmbeddings?: Map<string, number[]>
  ): Promise<ConfidenceFactors> {
    // Calculate category match score based on category and subcategory match
    const categoryMatchScore = match.categoryMatch
      ? match.subcategoryMatch
        ? 0.8 + (0.2 * classification.subcategory.confidence)
        : 0.5 + (0.3 * classification.primaryCategory.confidence)
      : 0.3;
    
    // Calculate semantic similarity if embeddings are available
    let semanticSimilarityScore = 0.5; // Default neutral score
    if (questionEmbedding && treatmentAreaEmbeddings && treatmentAreaEmbeddings.has(match.treatmentArea.id)) {
      const treatmentAreaEmbedding = treatmentAreaEmbeddings.get(match.treatmentArea.id)!;
      semanticSimilarityScore = this.calculateCosineSimilarity(questionEmbedding, treatmentAreaEmbedding);
    }
    
    // Analyze question context
    const { specificityScore, clinicalContextScore } = this.analyzeQuestionContext(
      questionText,
      classification
    );
    
    // Calculate keyword relevance score
    const keywordRelevanceScore = match.keywordMatches.length > 0
      ? Math.min(1, (match.keywordMatches.length / classification.keywords.length) * 1.5)
      : 0.2;
    
    // Calculate medication match score
    const relevantMedications = classification.relevantMedications || [];
    const medicationMatchScore = match.medicationMatches.length > 0
      ? Math.min(1, (match.medicationMatches.length / (relevantMedications.length || 1)) * 1.5)
      : relevantMedications.length > 0 ? 0.1 : 0.5; // Penalize more if medications were mentioned but none matched
    
    return {
      categoryMatchScore,
      semanticSimilarityScore,
      questionSpecificityScore: specificityScore,
      clinicalContextScore,
      keywordRelevanceScore,
      medicationMatchScore
    };
  }

  /**
   * Calculate overall confidence score from individual confidence factors
   * @param factors Confidence factors
   * @returns Overall confidence score (0-1)
   */
  calculateOverallConfidence(factors: ConfidenceFactors): number {
    // Weight factors by importance
    const weights = {
      categoryMatchScore: 0.25,
      semanticSimilarityScore: 0.20,
      questionSpecificityScore: 0.15,
      clinicalContextScore: 0.20,
      keywordRelevanceScore: 0.10,
      medicationMatchScore: 0.10
    };
    
    // Calculate weighted sum
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const [factor, value] of Object.entries(factors) as [keyof ConfidenceFactors, number][]) {
      const weight = weights[factor];
      weightedSum += value * weight;
      totalWeight += weight;
    }
    
    // Normalize to 0-1 range
    return weightedSum / totalWeight;
  }

  /**
   * Enhance mapping results with confidence scoring
   * @param mappingResult Original mapping result
   * @param questionText Original question text
   * @param options Confidence scoring options
   * @returns Enhanced mapping result with confidence scores
   */
  async enhanceWithConfidence(
    mappingResult: PharmaMappingResult,
    questionText: string,
    options: ConfidenceScoringOptions = {}
  ): Promise<EnhancedMappingResult> {
    // Merge options with defaults
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // Generate question embedding if semantic analysis is enabled
    let questionEmbedding: number[] | undefined;
    const treatmentAreaEmbeddings = new Map<string, number[]>();
    
    if (mergedOptions.semanticAnalysis) {
      try {
        // Generate embedding for the question
        questionEmbedding = await this.generateEmbedding(questionText);
        
        // Generate embeddings for each unique treatment area
        const treatmentAreaSet = new Set<string>();
        mappingResult.matches.forEach(match => treatmentAreaSet.add(match.treatmentArea.id));
        
        // Fix the Set iteration using Array.from
        for (const treatmentAreaId of Array.from(treatmentAreaSet)) {
          const treatmentArea = mappingResult.matches.find(m => m.treatmentArea.id === treatmentAreaId)?.treatmentArea;
          if (treatmentArea) {
            const treatmentAreaText = `${treatmentArea.category} ${treatmentArea.subcategories.join(' ')} ${treatmentArea.keywords.join(' ')} ${treatmentArea.flagship_medications.join(' ')}`;
            const embedding = await this.generateEmbedding(treatmentAreaText);
            treatmentAreaEmbeddings.set(treatmentAreaId, embedding);
          }
        }
      } catch (error) {
        console.warn('Error generating embeddings for semantic analysis:', error);
        // Continue without semantic analysis if there's an error
      }
    }
    
    // Enhance each match with confidence scoring
    const enhancedMatches: EnhancedCompanyMatch[] = await Promise.all(
      mappingResult.matches.map(async match => {
        const confidenceFactors = await this.calculateConfidenceFactors(
          match,
          questionText,
          mappingResult.classificationInput,
          questionEmbedding,
          treatmentAreaEmbeddings
        );
        
        const confidenceScore = this.calculateOverallConfidence(confidenceFactors);
        const shouldShowAd = confidenceScore >= mergedOptions.confidenceThreshold!;
        
        return {
          ...match,
          confidenceScore,
          confidenceFactors,
          shouldShowAd
        };
      })
    );
    
    // Sort enhanced matches by confidence score
    enhancedMatches.sort((a, b) => b.confidenceScore - a.confidenceScore);
    
    // Calculate overall confidence for the mapping
    const overallConfidence = enhancedMatches.length > 0
      ? enhancedMatches[0].confidenceScore // Top match confidence
      : 0;
    
    // Determine if an ad is recommended
    const adRecommended = enhancedMatches.some(match => match.shouldShowAd);
    
    // Create enhanced mapping result
    const enhancedResult: EnhancedMappingResult = {
      ...mappingResult,
      matches: enhancedMatches,
      topMatch: enhancedMatches.length > 0 ? enhancedMatches[0] : undefined,
      overallConfidence,
      adRecommended,
      originalQuestionText: questionText,
      questionEmbedding: mergedOptions.debug ? questionEmbedding : undefined
    };
    
    return enhancedResult;
  }
}

// Export a singleton instance for convenience
export const confidenceScorer = new ConfidenceScorer();

/**
 * Factory function to enhance mapping with confidence scores
 */
export async function enhanceMappingConfidence(
  mappingResult: PharmaMappingResult,
  questionText: string,
  options: ConfidenceScoringOptions = {}
): Promise<EnhancedMappingResult> {
  try {
    const scorer = new ConfidenceScorer();
    return await scorer.enhanceWithConfidence(mappingResult, questionText, options);
  } catch (error) {
    console.error('Error enhancing mapping confidence:', error);
    throw new Error(`Failed to enhance mapping confidence: ${(error as Error).message}`);
  }
}

/**
 * Utility function to determine if an ad should be shown based on confidence
 * 
 * @param enhancedResult Enhanced mapping result
 * @param threshold Optional custom threshold (overrides the one in the result)
 * @returns Boolean indicating if an ad should be shown
 */
export function shouldShowAd(
  enhancedResult: EnhancedMappingResult,
  threshold?: number
): boolean {
  const effectiveThreshold = threshold ?? DEFAULT_CONFIDENCE_OPTIONS.confidenceThreshold!;
  
  return enhancedResult.overallConfidence >= effectiveThreshold && enhancedResult.adRecommended;
} 