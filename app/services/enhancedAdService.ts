import { Ad, AdTargetingOptions, AdType } from '../types/ad';
import { getAdsByCategory } from './adService';
import { MedicalClassification } from './classification';
import { classifyMedicalQuestion } from './classification';
import { analyzeQuestionContext, ContextualRelevanceResult } from './contextualRelevance';
import { enhanceClassification, EnhancedClassificationResult } from './enhancedClassifier';
import { adaptAdContent, AdaptedContentResult, ContentAdaptationOptions } from './contentAdaptation';
import { PharmaMappingResult, mapQuestionToCompanies } from './adMapping';
import * as GraphGenerator from './graphGenerator';
import { KnowledgeGraph, KnowledgeGraphFilters } from '../models/knowledgeGraph';
import * as AnalyticsService from './analytics';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enhanced ad selection result
 */
export interface EnhancedAdSelectionResult {
  ads: AdaptedContentResult[];
  originalClassification: MedicalClassification;
  contextualRelevance: ContextualRelevanceResult;
  enhancedClassification: EnhancedClassificationResult;
  pharmaMappingResult?: PharmaMappingResult;
  totalMatches: number;
  processingTimeMs: number;
  confidenceScore: number; // 0-100
}

/**
 * Options for enhanced ad selection
 */
export interface EnhancedAdSelectionOptions {
  limit?: number;
  includePharmaMappingResult?: boolean;
  minConfidenceScore?: number;
  adTypes?: AdType[];
  contentAdaptationOptions?: ContentAdaptationOptions;
  includeRawData?: boolean;
  priorityMinimum?: number;
  boostAmount?: number; // How much to boost ads based on contextual relevance
}

/**
 * Default options for enhanced ad selection
 */
const DEFAULT_ENHANCED_OPTIONS: EnhancedAdSelectionOptions = {
  limit: 3,
  includePharmaMappingResult: true,
  minConfidenceScore: 60,
  contentAdaptationOptions: {},
  includeRawData: false,
  priorityMinimum: 5,
  boostAmount: 2 // Boost priority by up to 2 points
};

/**
 * Knowledge graph display options during ad wait times
 */
export interface KnowledgeGraphAdOptions {
  questionText: string;
  classification: MedicalClassification;
  advertisingCompanyId?: string;
  waitTimeMs: number;
  sessionId?: string;
  userId?: string;
}

/**
 * Track interaction with a knowledge graph
 */
export function trackKnowledgeGraphInteraction(
  graphId: string,
  interactionType: 'view' | 'expand' | 'explore' | 'click',
  nodeId?: string,
  relationshipId?: string,
  sessionId?: string,
  userId?: string
): string {
  const eventId = AnalyticsService.createEvent(
    AnalyticsService.AnalyticsEventType.CLICK,
    {
      target: `knowledge_graph_${interactionType}`,
      metadata: {
        graphId,
        nodeId,
        relationshipId,
        interactionType,
        userId
      },
      sessionId
    }
  ).id;
  
  AnalyticsService.dispatchAnalyticsEvent({
    id: eventId,
    type: AnalyticsService.AnalyticsEventType.CLICK,
    timestamp: Date.now(),
    sessionId: sessionId || 'unknown',
    target: `knowledge_graph_${interactionType}`,
    interactionType,
    metadata: {
      graphId,
      nodeId,
      relationshipId,
      interactionType,
      userId
    }
  });
  
  return eventId;
}

/**
 * Generate a knowledge graph suitable for display during ad wait times
 */
export async function generateWaitTimeKnowledgeGraph(
  options: KnowledgeGraphAdOptions
): Promise<{
  graph: KnowledgeGraph,
  recommendedWaitTimeMs: number,
  trackingId: string
}> {
  try {
    // Generate the knowledge graph
    const graph = await GraphGenerator.generateAdWaitKnowledgeGraph(
      options.questionText,
      options.classification,
      options.advertisingCompanyId
    );
    
    // Calculate recommended wait time based on graph complexity
    // More complex graphs warrant longer display times
    const nodeCount = graph.nodes.length;
    const relationshipCount = graph.relationships.length;
    const complexity = (nodeCount * 2) + relationshipCount;
    
    // Base wait time is 5-15 seconds, adjusted for complexity
    const baseWaitTimeMs = 5000;
    const complexityFactor = Math.min(1, complexity / 50); // Scale to max 1
    const recommendedWaitTimeMs = baseWaitTimeMs + (complexityFactor * 10000);
    
    // Track the impression
    const trackingId = AnalyticsService.createEvent(
      AnalyticsService.AnalyticsEventType.IMPRESSION_START,
      {
        sessionId: options.sessionId,
        metadata: {
          graphId: graph.id,
          nodeCount,
          relationshipCount,
          complexity,
          advertisingCompanyId: options.advertisingCompanyId,
          questionCategory: options.classification.primaryCategory.name,
          recommendedWaitTimeMs,
          userId: options.userId
        }
      }
    ).id;
    
    // Dispatch the analytics event
    AnalyticsService.dispatchAnalyticsEvent({
      id: trackingId,
      type: AnalyticsService.AnalyticsEventType.IMPRESSION_START,
      timestamp: Date.now(),
      sessionId: options.sessionId || 'unknown',
      metadata: {
        graphId: graph.id,
        nodeCount,
        relationshipCount,
        complexity,
        advertisingCompanyId: options.advertisingCompanyId,
        questionCategory: options.classification.primaryCategory.name,
        recommendedWaitTimeMs,
        userId: options.userId
      }
    });
    
    return {
      graph,
      recommendedWaitTimeMs,
      trackingId
    };
  } catch (error) {
    console.error('Error generating wait time knowledge graph:', error);
    throw error;
  }
}

/**
 * Check if a knowledge graph should be shown during wait time
 * Based on question complexity, loading time, and user preferences
 */
export function shouldShowKnowledgeGraph(
  classification: MedicalClassification,
  estimatedWaitTimeMs: number,
  userPreferences: any = {}
): boolean {
  // Don't show for very short wait times
  if (estimatedWaitTimeMs < 3000) {
    return false;
  }
  
  // Check user preferences
  if (userPreferences.disableKnowledgeGraphs) {
    return false;
  }
  
  // Check confidence in classification
  if (classification.primaryCategory.confidence < 0.6 || 
      classification.subcategory.confidence < 0.5) {
    return false;
  }
  
  // Higher likelihood for complex medical categories
  const complexCategories = [
    'oncology', 'cardiology', 'neurology', 'endocrinology'
  ];
  
  if (complexCategories.includes(classification.primaryCategory.id)) {
    return true;
  }
  
  // For medium wait times, show with 70% probability
  if (estimatedWaitTimeMs > 5000) {
    return Math.random() < 0.7;
  }
  
  // Default: show with 50% probability
  return Math.random() < 0.5;
}

/**
 * End knowledge graph session and track metrics
 */
export function endKnowledgeGraphSession(
  trackingId: string,
  graphId: string,
  durationMs: number,
  interactionCount: number,
  sessionId?: string
): void {
  AnalyticsService.trackImpressionEnd(
    trackingId,
    graphId,
    durationMs
  );
  
  // Track additional metrics
  AnalyticsService.dispatchAnalyticsEvent({
    id: uuidv4(),
    type: AnalyticsService.AnalyticsEventType.IMPRESSION_END,
    timestamp: Date.now(),
    sessionId: sessionId || 'unknown',
    metadata: {
      graphId,
      durationMs,
      interactionCount,
      averageTimePerInteraction: interactionCount > 0 ? durationMs / interactionCount : 0
    }
  });
}

/**
 * Service for enhanced contextual ad selection
 */
export class ContextualAdService {
  private options: EnhancedAdSelectionOptions;
  
  /**
   * Creates a new ContextualAdService
   * 
   * @param options Service configuration options
   */
  constructor(options: EnhancedAdSelectionOptions = {}) {
    this.options = { ...DEFAULT_ENHANCED_OPTIONS, ...options };
  }
  
  /**
   * Selects and adapts ads based on deep contextual analysis of a medical question
   * 
   * @param question Medical question to analyze
   * @returns Enhanced ad selection result
   */
  async selectAdsForQuestion(question: string): Promise<EnhancedAdSelectionResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Classify the question with the basic classifier
      const classification = await classifyMedicalQuestion(question);
      
      // Step 2: Analyze contextual relevance
      const contextualRelevance = await analyzeQuestionContext(question, classification);
      
      // Step 3: Perform enhanced classification
      const enhancedClassification = await enhanceClassification(question, classification);
      
      // Step 4: Map question to pharmaceutical companies (optional)
      let pharmaMappingResult: PharmaMappingResult | undefined;
      if (this.options.includePharmaMappingResult) {
        pharmaMappingResult = mapQuestionToCompanies(classification);
      }
      
      // Step 5: Get base ads using existing pipeline
      const targetCategories = this.buildTargetCategories(
        classification,
        enhancedClassification,
        contextualRelevance
      );
      
      const targetingOptions: AdTargetingOptions = {
        categories: targetCategories,
        priorityMin: this.options.priorityMinimum,
        limit: this.options.limit ? this.options.limit * 2 : 6 // Get more ads than needed for contextual filtering
      };
      
      if (this.options.adTypes) {
        targetingOptions.types = this.options.adTypes;
      }
      
      // If we have pharma mapping results, include company targeting
      if (pharmaMappingResult && pharmaMappingResult.matches.length > 0) {
        targetingOptions.advertisers = pharmaMappingResult.matches
          .slice(0, 3)
          .map(match => match.company.name);
      }
      
      const baseAds = getAdsByCategory(targetingOptions);
      
      // Step 6: Apply contextual adaptation to each ad
      const adaptedAds = await this.adaptAdsWithContext(
        baseAds,
        contextualRelevance,
        enhancedClassification
      );
      
      // Step 7: Sort and filter the adapted ads
      const sortedAds = this.sortAdsByContextualRelevance(
        adaptedAds,
        this.options.minConfidenceScore || 60
      );
      
      // Step 8: Prepare the final result
      const processingTimeMs = Date.now() - startTime;
      const finalAds = sortedAds.slice(0, this.options.limit || 3);
      
      // Calculate overall confidence score
      const confidenceScore = this.calculateOverallConfidence(
        finalAds,
        contextualRelevance,
        enhancedClassification
      );
      
      return {
        ads: finalAds,
        originalClassification: classification,
        contextualRelevance: contextualRelevance,
        enhancedClassification: enhancedClassification,
        pharmaMappingResult: this.options.includePharmaMappingResult ? pharmaMappingResult : undefined,
        totalMatches: baseAds.length,
        processingTimeMs,
        confidenceScore
      };
    } catch (error) {
      console.error('[ContextualAdService] Error selecting ads:', error);
      throw error;
    }
  }
  
  /**
   * Builds an expanded list of target categories from all available data
   * 
   * @param classification Basic classification
   * @param enhancedClassification Enhanced classification
   * @param contextualRelevance Contextual relevance
   * @returns Array of target categories
   */
  private buildTargetCategories(
    classification: MedicalClassification,
    enhancedClassification: EnhancedClassificationResult,
    contextualRelevance: ContextualRelevanceResult
  ): string[] {
    const categories = new Set<string>();
    
    // Add basic categories from classification
    categories.add(classification.primaryCategory.id);
    categories.add(classification.subcategory.id);
    
    // Add therapeutic indications from enhanced classification
    enhancedClassification.therapeuticIndications.forEach(indication => {
      categories.add(indication.condition.toLowerCase().replace(/\s+/g, '_'));
      categories.add(indication.treatmentType.toLowerCase().replace(/\s+/g, '_'));
    });
    
    // Add target specialties from contextual relevance
    contextualRelevance.targetSpecialties.forEach(specialty => {
      categories.add(specialty.toLowerCase().replace(/\s+/g, '_'));
    });
    
    // Add entities from enhanced classification
    enhancedClassification.entities
      .filter(entity => entity.confidence > 0.7) // Only high-confidence entities
      .forEach(entity => {
        if (entity.type === 'condition' || entity.type === 'procedure') {
          categories.add(entity.term.toLowerCase().replace(/\s+/g, '_'));
        }
      });
    
    // Add semantic tags
    enhancedClassification.semanticTags.forEach(tag => {
      categories.add(tag.toLowerCase().replace(/\s+/g, '_'));
    });
    
    return Array.from(categories);
  }
  
  /**
   * Adapts ads with contextual information
   * 
   * @param ads Base ads to adapt
   * @param contextualRelevance Contextual relevance
   * @param enhancedClassification Enhanced classification
   * @returns Adapted ads
   */
  private async adaptAdsWithContext(
    ads: Ad[],
    contextualRelevance: ContextualRelevanceResult,
    enhancedClassification: EnhancedClassificationResult
  ): Promise<AdaptedContentResult[]> {
    return ads.map(ad => 
      adaptAdContent(
        ad, 
        contextualRelevance, 
        enhancedClassification, 
        this.options.contentAdaptationOptions
      )
    );
  }
  
  /**
   * Sorts and filters adapted ads by relevance
   * 
   * @param adaptedAds Ads with adaptation data
   * @param minConfidenceScore Minimum confidence score (0-100)
   * @returns Sorted and filtered ads
   */
  private sortAdsByContextualRelevance(
    adaptedAds: AdaptedContentResult[],
    minConfidenceScore: number
  ): AdaptedContentResult[] {
    // First, filter by confidence score
    const filteredAds = adaptedAds.filter(ad => 
      ad.confidenceScore >= minConfidenceScore
    );
    
    // Apply priority modifier to original ad priority
    const adsWithAdjustedPriority = filteredAds.map(ad => ({
      ...ad,
      adjustedPriority: Math.min(10, Math.max(0, 
        ad.originalAd.priority + (ad.priorityModifier * (this.options.boostAmount || 2) / 10)
      ))
    }));
    
    // Sort by adjusted priority then by relevance score
    return adsWithAdjustedPriority
      .sort((a, b) => {
        // First sort by adjusted priority
        if (b.adjustedPriority !== a.adjustedPriority) {
          return b.adjustedPriority - a.adjustedPriority;
        }
        // Then by relevance score
        return b.relevanceScore - a.relevanceScore;
      })
      .map(({ adjustedPriority, ...rest }) => rest); // Remove the adjustedPriority field
  }
  
  /**
   * Calculates overall confidence in the ad selection
   * 
   * @param finalAds Final adapted ads
   * @param contextualRelevance Contextual relevance
   * @param enhancedClassification Enhanced classification
   * @returns Overall confidence score (0-100)
   */
  private calculateOverallConfidence(
    finalAds: AdaptedContentResult[],
    contextualRelevance: ContextualRelevanceResult,
    enhancedClassification: EnhancedClassificationResult
  ): number {
    if (finalAds.length === 0) {
      return 0;
    }
    
    // Average confidence across all ads
    const avgAdConfidence = finalAds.reduce(
      (sum, ad) => sum + ad.confidenceScore, 
      0
    ) / finalAds.length;
    
    // Get classification confidence
    const classificationConfidence = enhancedClassification.confidenceScore * 100;
    
    // Get contextual relevance confidence (based on specificity)
    const contextConfidence = contextualRelevance.specificity;
    
    // Weighted average: 50% ad confidence, 30% classification, 20% contextual
    return Math.round(
      (avgAdConfidence * 0.5) + 
      (classificationConfidence * 0.3) + 
      (contextConfidence * 0.2)
    );
  }
}

/**
 * Convenience function for enhanced ad selection
 * 
 * @param question Medical question to analyze
 * @param options Selection options
 * @returns Enhanced ad selection result
 */
export async function selectEnhancedAdsForQuestion(
  question: string,
  options: EnhancedAdSelectionOptions = {}
): Promise<EnhancedAdSelectionResult> {
  const service = new ContextualAdService(options);
  return service.selectAdsForQuestion(question);
} 