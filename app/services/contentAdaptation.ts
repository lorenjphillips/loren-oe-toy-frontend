import { ContentFormat, ContextualRelevanceResult, ComplexityLevel, QuestionIntent } from './contextualRelevance';
import { EnhancedClassificationResult } from './enhancedClassifier';
import { Ad } from '../types/ad';

/**
 * Content depth levels
 */
export enum ContentDepth {
  BASIC = 'basic',
  STANDARD = 'standard',
  DETAILED = 'detailed',
  COMPREHENSIVE = 'comprehensive',
  EXPERT = 'expert'
}

/**
 * Content length options
 */
export enum ContentLength {
  BRIEF = 'brief',
  MODERATE = 'moderate',
  DETAILED = 'detailed',
  COMPREHENSIVE = 'comprehensive'
}

/**
 * Interactive content complexity levels
 */
export enum InteractiveComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  ADVANCED = 'advanced'
}

/**
 * Interface for content adaptation parameters
 */
export interface ContentAdaptationParams {
  depth: ContentDepth;
  length: ContentLength;
  interactiveComplexity: InteractiveComplexity;
  prioritizedFormats: ContentFormat[];
  educationalLevel: ComplexityLevel;
  estimatedEngagementTime: number; // In seconds
  keyPoints: number; // Number of key points to emphasize
  includeEvidence: boolean;
  includeVisuals: boolean;
  includeClinicalCases: boolean;
  primaryIntent: QuestionIntent;
}

/**
 * Result of content adaptation
 */
export interface AdaptedContentResult {
  originalAd: Ad;
  adaptationParams: ContentAdaptationParams;
  relevanceScore: number; // 0-100
  confidenceScore: number; // 0-100
  priorityModifier: number; // -10 to +10
  customizations: {
    titleAdjustments?: string[];
    contentFocus?: string[];
    emphasizedElements?: string[];
    interactivityLevel?: InteractiveComplexity;
    recommendedLength?: ContentLength;
  };
  targetDemographics?: string[];
  targetSpecialties?: string[];
}

/**
 * Options for content adaptation
 */
export interface ContentAdaptationOptions {
  maxPrioritizedFormats?: number;
  enableDynamicLength?: boolean;
  enableComplexityAdjustment?: boolean;
  enableIntentBasedPrioritization?: boolean;
  confidenceThreshold?: number; // 0-100
}

/**
 * Default content adaptation options
 */
const DEFAULT_ADAPTATION_OPTIONS: ContentAdaptationOptions = {
  maxPrioritizedFormats: 3,
  enableDynamicLength: true,
  enableComplexityAdjustment: true,
  enableIntentBasedPrioritization: true,
  confidenceThreshold: 70
};

/**
 * Service for adapting content based on question context
 */
export class ContentAdaptationService {
  private options: ContentAdaptationOptions;
  
  /**
   * Creates a new ContentAdaptationService
   * 
   * @param options Service configuration options
   */
  constructor(options: ContentAdaptationOptions = {}) {
    this.options = { ...DEFAULT_ADAPTATION_OPTIONS, ...options };
  }
  
  /**
   * Generate content adaptation parameters based on contextual relevance
   * 
   * @param contextualRelevance Result from contextual relevance analysis
   * @param enhancedClassification Optional enhanced classification for more precise adaptation
   * @returns Content adaptation parameters
   */
  generateAdaptationParams(
    contextualRelevance: ContextualRelevanceResult,
    enhancedClassification?: EnhancedClassificationResult
  ): ContentAdaptationParams {
    // Determine content depth based on question complexity and specificity
    const depth = this.determineContentDepth(
      contextualRelevance.complexityLevel,
      contextualRelevance.specificity
    );
    
    // Determine content length based on estimated response time
    const length = this.determineContentLength(
      contextualRelevance.estimatedResponseTime,
      contextualRelevance.questionIntent
    );
    
    // Determine interactive complexity based on question complexity
    const interactiveComplexity = this.determineInteractiveComplexity(
      contextualRelevance.complexityLevel,
      contextualRelevance.questionIntent
    );
    
    // Prioritize content formats based on relevance scores and question intent
    const prioritizedFormats = this.prioritizeContentFormats(
      contextualRelevance.contentRelevanceScores,
      contextualRelevance.questionIntent,
      this.options.maxPrioritizedFormats || 3
    );
    
    // Map complexity level to educational level
    const educationalLevel = contextualRelevance.complexityLevel;
    
    // Estimate engagement time based on content depth and complexity
    const estimatedEngagementTime = this.estimateEngagementTime(
      depth,
      interactiveComplexity,
      contextualRelevance.estimatedResponseTime
    );
    
    // Determine number of key points based on content depth and length
    const keyPoints = this.determineKeyPoints(depth, length);
    
    // Determine whether to include evidence, visuals, and clinical cases
    const includeEvidence = this.shouldIncludeEvidence(
      contextualRelevance.questionIntent,
      contextualRelevance.complexityLevel
    );
    
    const includeVisuals = this.shouldIncludeVisuals(
      contextualRelevance.questionIntent,
      prioritizedFormats
    );
    
    const includeClinicalCases = this.shouldIncludeClinicalCases(
      contextualRelevance.questionIntent,
      contextualRelevance.complexityLevel
    );
    
    return {
      depth,
      length,
      interactiveComplexity,
      prioritizedFormats,
      educationalLevel,
      estimatedEngagementTime,
      keyPoints,
      includeEvidence,
      includeVisuals,
      includeClinicalCases,
      primaryIntent: contextualRelevance.questionIntent
    };
  }
  
  /**
   * Adapt ad content based on contextual relevance and enhanced classification
   * 
   * @param ad The ad to adapt
   * @param contextualRelevance Result from contextual relevance analysis
   * @param enhancedClassification Optional enhanced classification result
   * @returns Adapted content result
   */
  adaptAdContent(
    ad: Ad,
    contextualRelevance: ContextualRelevanceResult,
    enhancedClassification?: EnhancedClassificationResult
  ): AdaptedContentResult {
    // Generate base adaptation parameters
    const adaptationParams = this.generateAdaptationParams(
      contextualRelevance,
      enhancedClassification
    );
    
    // Calculate relevance score based on ad categories and content format
    const adContentFormat = this.determineAdContentFormat(ad);
    const relevanceScore = this.calculateRelevanceScore(
      contextualRelevance,
      ad.categories,
      adContentFormat
    );
    
    // Determine confidence in this adaptation
    const confidenceScore = this.calculateConfidenceScore(
      contextualRelevance,
      enhancedClassification,
      relevanceScore
    );
    
    // Calculate priority modifier based on relevance and contextual factors
    const priorityModifier = this.calculatePriorityModifier(
      relevanceScore,
      contextualRelevance.urgencyScore,
      contextualRelevance.practicalityScore
    );
    
    // Generate customizations specific to this ad
    const customizations = this.generateCustomizations(
      ad,
      adaptationParams,
      contextualRelevance,
      enhancedClassification
    );
    
    // Determine target demographics and specialties
    const targetDemographics = enhancedClassification?.patientDemographics
      ? this.extractDemographicTargets(enhancedClassification.patientDemographics)
      : undefined;
    
    const targetSpecialties = contextualRelevance.targetSpecialties;
    
    return {
      originalAd: ad,
      adaptationParams,
      relevanceScore,
      confidenceScore,
      priorityModifier,
      customizations,
      targetDemographics,
      targetSpecialties
    };
  }
  
  /**
   * Determines content depth based on question complexity and specificity
   * 
   * @param complexityLevel Complexity level of the question
   * @param specificity Specificity score (0-100)
   * @returns Appropriate content depth
   */
  private determineContentDepth(
    complexityLevel: ComplexityLevel,
    specificity: number
  ): ContentDepth {
    if (complexityLevel === ComplexityLevel.EXPERT) {
      return ContentDepth.EXPERT;
    }
    
    if (complexityLevel === ComplexityLevel.ADVANCED) {
      return specificity > 80 ? ContentDepth.COMPREHENSIVE : ContentDepth.DETAILED;
    }
    
    if (complexityLevel === ComplexityLevel.INTERMEDIATE) {
      return specificity > 70 ? ContentDepth.DETAILED : ContentDepth.STANDARD;
    }
    
    // ComplexityLevel.BASIC
    return specificity > 80 ? ContentDepth.STANDARD : ContentDepth.BASIC;
  }
  
  /**
   * Determines content length based on estimated response time and question intent
   * 
   * @param estimatedResponseTime Estimated time needed to answer the question (seconds)
   * @param questionIntent Type of question being asked
   * @returns Appropriate content length
   */
  private determineContentLength(
    estimatedResponseTime: number,
    questionIntent: QuestionIntent
  ): ContentLength {
    // Base length on response time
    if (estimatedResponseTime < 60) {
      return ContentLength.BRIEF;
    } else if (estimatedResponseTime < 180) {
      return ContentLength.MODERATE;
    } else if (estimatedResponseTime < 300) {
      return ContentLength.DETAILED;
    } else {
      return ContentLength.COMPREHENSIVE;
    }
    
    // Adjust based on question intent if dynamic length is enabled
    if (this.options.enableDynamicLength) {
      if (questionIntent === QuestionIntent.DIAGNOSIS || 
          questionIntent === QuestionIntent.DIFFERENTIAL) {
        // Diagnostic questions often benefit from more comprehensive content
        if (estimatedResponseTime > 120) {
          return ContentLength.COMPREHENSIVE;
        }
      }
      
      if (questionIntent === QuestionIntent.MECHANISM) {
        // Mechanistic explanations often need to be detailed
        return estimatedResponseTime < 90 ? ContentLength.MODERATE : ContentLength.DETAILED;
      }
      
      if (questionIntent === QuestionIntent.TREATMENT) {
        // Treatment questions vary widely in needed length
        return estimatedResponseTime < 120 ? ContentLength.MODERATE : ContentLength.DETAILED;
      }
    }
  }
  
  /**
   * Determines interactive content complexity based on question complexity and intent
   * 
   * @param complexityLevel Complexity level of the question
   * @param questionIntent Type of question being asked
   * @returns Appropriate interactive complexity level
   */
  private determineInteractiveComplexity(
    complexityLevel: ComplexityLevel,
    questionIntent: QuestionIntent
  ): InteractiveComplexity {
    if (!this.options.enableComplexityAdjustment) {
      // Default mapping if adjustment is disabled
      switch (complexityLevel) {
        case ComplexityLevel.EXPERT: return InteractiveComplexity.ADVANCED;
        case ComplexityLevel.ADVANCED: return InteractiveComplexity.COMPLEX;
        case ComplexityLevel.INTERMEDIATE: return InteractiveComplexity.MODERATE;
        default: return InteractiveComplexity.SIMPLE;
      }
    }
    
    // Adjust based on both complexity and intent
    if (complexityLevel === ComplexityLevel.EXPERT) {
      return InteractiveComplexity.ADVANCED;
    }
    
    if (complexityLevel === ComplexityLevel.ADVANCED) {
      // Certain intents benefit from more complex interactive content
      if (questionIntent === QuestionIntent.DIFFERENTIAL ||
          questionIntent === QuestionIntent.DIAGNOSIS ||
          questionIntent === QuestionIntent.MECHANISM) {
        return InteractiveComplexity.ADVANCED;
      }
      return InteractiveComplexity.COMPLEX;
    }
    
    if (complexityLevel === ComplexityLevel.INTERMEDIATE) {
      if (questionIntent === QuestionIntent.TREATMENT ||
          questionIntent === QuestionIntent.MANAGEMENT) {
        return InteractiveComplexity.COMPLEX;
      }
      return InteractiveComplexity.MODERATE;
    }
    
    // Basic complexity
    if (questionIntent === QuestionIntent.DIFFERENTIAL ||
        questionIntent === QuestionIntent.DIAGNOSIS) {
      return InteractiveComplexity.MODERATE;
    }
    return InteractiveComplexity.SIMPLE;
  }
  
  /**
   * Prioritizes content formats based on relevance scores and question intent
   * 
   * @param contentRelevanceScores Relevance scores for different content formats
   * @param questionIntent Type of question being asked
   * @param maxFormats Maximum number of formats to prioritize
   * @returns Prioritized list of content formats
   */
  private prioritizeContentFormats(
    contentRelevanceScores: Record<ContentFormat, number>,
    questionIntent: QuestionIntent,
    maxFormats: number
  ): ContentFormat[] {
    // Create a copy of the scores to modify
    const adjustedScores = { ...contentRelevanceScores };
    
    // Apply intent-based adjustments if enabled
    if (this.options.enableIntentBasedPrioritization) {
      switch (questionIntent) {
        case QuestionIntent.DIAGNOSIS:
        case QuestionIntent.DIFFERENTIAL:
          // Boost decision trees and case studies for diagnostic questions
          adjustedScores[ContentFormat.DECISION_TREE] *= 1.2;
          adjustedScores[ContentFormat.CASE_STUDY] *= 1.15;
          break;
          
        case QuestionIntent.TREATMENT:
        case QuestionIntent.MANAGEMENT:
          // Boost clinical trials and microsimulations for treatment questions
          adjustedScores[ContentFormat.CLINICAL_TRIAL] *= 1.25;
          adjustedScores[ContentFormat.MICROSIMULATION] *= 1.2;
          break;
          
        case QuestionIntent.MECHANISM:
          // Boost videos and infographics for mechanism questions
          adjustedScores[ContentFormat.VIDEO] *= 1.3;
          adjustedScores[ContentFormat.INFOGRAPHIC] *= 1.25;
          break;
          
        case QuestionIntent.RESEARCH:
          // Boost text and clinical trials for research questions
          adjustedScores[ContentFormat.TEXT] *= 1.15;
          adjustedScores[ContentFormat.CLINICAL_TRIAL] *= 1.3;
          break;
      }
    }
    
    // Sort formats by adjusted score and take the top N
    return Object.entries(adjustedScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, maxFormats)
      .map(([format]) => format as ContentFormat);
  }
  
  /**
   * Estimates engagement time based on content parameters
   * 
   * @param depth Content depth
   * @param interactiveComplexity Interactive complexity level
   * @param baseEstimatedTime Base estimated time from relevance analysis
   * @returns Estimated engagement time in seconds
   */
  private estimateEngagementTime(
    depth: ContentDepth,
    interactiveComplexity: InteractiveComplexity,
    baseEstimatedTime: number
  ): number {
    // Base multiplier based on content depth
    let multiplier = 1.0;
    
    switch (depth) {
      case ContentDepth.COMPREHENSIVE:
      case ContentDepth.EXPERT:
        multiplier = 2.0;
        break;
      case ContentDepth.DETAILED:
        multiplier = 1.5;
        break;
      case ContentDepth.STANDARD:
        multiplier = 1.2;
        break;
      default: // BASIC
        multiplier = 1.0;
    }
    
    // Additional time for interactive complexity
    let additionalTime = 0;
    
    switch (interactiveComplexity) {
      case InteractiveComplexity.ADVANCED:
        additionalTime = 180; // +3 minutes
        break;
      case InteractiveComplexity.COMPLEX:
        additionalTime = 120; // +2 minutes
        break;
      case InteractiveComplexity.MODERATE:
        additionalTime = 60; // +1 minute
        break;
      default: // SIMPLE
        additionalTime = 30; // +30 seconds
    }
    
    return Math.round((baseEstimatedTime * multiplier) + additionalTime);
  }
  
  /**
   * Determines number of key points based on content depth and length
   * 
   * @param depth Content depth
   * @param length Content length
   * @returns Number of key points to include
   */
  private determineKeyPoints(
    depth: ContentDepth,
    length: ContentLength
  ): number {
    const basePoints = {
      [ContentDepth.BASIC]: 3,
      [ContentDepth.STANDARD]: 5,
      [ContentDepth.DETAILED]: 7,
      [ContentDepth.COMPREHENSIVE]: 10,
      [ContentDepth.EXPERT]: 12
    };
    
    const lengthMultiplier = {
      [ContentLength.BRIEF]: 0.7,
      [ContentLength.MODERATE]: 1.0,
      [ContentLength.DETAILED]: 1.3,
      [ContentLength.COMPREHENSIVE]: 1.5
    };
    
    return Math.round(basePoints[depth] * lengthMultiplier[length]);
  }
  
  /**
   * Determines whether evidence should be included based on intent and complexity
   * 
   * @param intent Question intent
   * @param complexity Question complexity
   * @returns Whether to include evidence
   */
  private shouldIncludeEvidence(
    intent: QuestionIntent,
    complexity: ComplexityLevel
  ): boolean {
    // Always include evidence for advanced and expert questions
    if (complexity === ComplexityLevel.ADVANCED || 
        complexity === ComplexityLevel.EXPERT) {
      return true;
    }
    
    // Include evidence for certain question intents
    return intent === QuestionIntent.TREATMENT ||
           intent === QuestionIntent.RESEARCH ||
           intent === QuestionIntent.GUIDELINE;
  }
  
  /**
   * Determines whether visuals should be included based on intent and formats
   * 
   * @param intent Question intent
   * @param prioritizedFormats Prioritized content formats
   * @returns Whether to include visuals
   */
  private shouldIncludeVisuals(
    intent: QuestionIntent,
    prioritizedFormats: ContentFormat[]
  ): boolean {
    // Include visuals for certain content formats
    if (prioritizedFormats.includes(ContentFormat.INFOGRAPHIC) ||
        prioritizedFormats.includes(ContentFormat.VIDEO)) {
      return true;
    }
    
    // Include visuals for mechanism explanations
    return intent === QuestionIntent.MECHANISM;
  }
  
  /**
   * Determines whether clinical cases should be included
   * 
   * @param intent Question intent
   * @param complexity Question complexity
   * @returns Whether to include clinical cases
   */
  private shouldIncludeClinicalCases(
    intent: QuestionIntent,
    complexity: ComplexityLevel
  ): boolean {
    // Include clinical cases for diagnosis and differential questions
    if (intent === QuestionIntent.DIAGNOSIS ||
        intent === QuestionIntent.DIFFERENTIAL) {
      return true;
    }
    
    // Include for advanced treatment questions
    if (intent === QuestionIntent.TREATMENT &&
        (complexity === ComplexityLevel.ADVANCED || 
         complexity === ComplexityLevel.EXPERT)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Determines the content format for an ad
   * 
   * @param ad The ad to analyze
   * @returns Determined content format
   */
  private determineAdContentFormat(ad: Ad): ContentFormat {
    // Map ad type to content format
    switch (ad.type) {
      case 'video':
        return ContentFormat.VIDEO;
      case 'sponsored_content':
        // Check metadata or ad body for hints about the content type
        if (ad.metadata?.contentType === 'microsimulation') {
          return ContentFormat.MICROSIMULATION;
        }
        if (ad.metadata?.contentType === 'decision_tree') {
          return ContentFormat.DECISION_TREE;
        }
        if (ad.metadata?.contentType === 'case_study') {
          return ContentFormat.CASE_STUDY;
        }
        if (ad.metadata?.contentType === 'clinical_trial') {
          return ContentFormat.CLINICAL_TRIAL;
        }
        if (ad.metadata?.contentType === 'interactive') {
          return ContentFormat.INTERACTIVE;
        }
        if (ad.metadata?.contentType === 'infographic') {
          return ContentFormat.INFOGRAPHIC;
        }
        // Default for sponsored content
        return ContentFormat.TEXT;
      case 'banner':
        return ContentFormat.INFOGRAPHIC;
      case 'text':
      default:
        return ContentFormat.TEXT;
    }
  }
  
  /**
   * Calculates relevance score based on contextual factors
   * 
   * @param contextualRelevance Contextual relevance result
   * @param adCategories Ad categories
   * @param contentFormat Content format
   * @returns Relevance score (0-100)
   */
  private calculateRelevanceScore(
    contextualRelevance: ContextualRelevanceResult,
    adCategories: string[],
    contentFormat: ContentFormat
  ): number {
    // Base score from content format relevance
    const baseScore = contextualRelevance.contentRelevanceScores[contentFormat] || 50;
    
    // Calculate category matching score
    const categoryMatchScore = this.calculateCategoryMatchScore(
      contextualRelevance,
      adCategories
    );
    
    // Weight the scores (60% format relevance, 40% category matching)
    const weightedScore = (baseScore * 0.6) + (categoryMatchScore * 0.4);
    
    // Additional bonus for high practicality or urgency
    let bonusPoints = 0;
    if (contextualRelevance.practicalityScore > 80) {
      bonusPoints += 5;
    }
    if (contextualRelevance.urgencyScore > 80) {
      bonusPoints += 5;
    }
    
    return Math.min(Math.round(weightedScore + bonusPoints), 100);
  }
  
  /**
   * Calculates category match score
   * 
   * @param contextualRelevance Contextual relevance result
   * @param adCategories Ad categories
   * @returns Category match score (0-100)
   */
  private calculateCategoryMatchScore(
    contextualRelevance: ContextualRelevanceResult,
    adCategories: string[]
  ): number {
    // This would involve comparing contextualRelevance.keyContextualFactors
    // and targetSpecialties with adCategories
    
    // Simplified implementation - in a real system, this would be more sophisticated
    const targetSpecialties = contextualRelevance.targetSpecialties;
    const keyFactors = contextualRelevance.keyContextualFactors;
    
    let matchCount = 0;
    let totalFactors = targetSpecialties.length + keyFactors.length;
    
    // Count matches in specialties
    for (const specialty of targetSpecialties) {
      if (adCategories.some(cat => 
          cat.toLowerCase().includes(specialty.toLowerCase()) || 
          specialty.toLowerCase().includes(cat.toLowerCase()))) {
        matchCount++;
      }
    }
    
    // Count matches in key factors
    for (const factor of keyFactors) {
      if (adCategories.some(cat => 
          cat.toLowerCase().includes(factor.toLowerCase()) || 
          factor.toLowerCase().includes(cat.toLowerCase()))) {
        matchCount++;
      }
    }
    
    // Calculate percentage match and scale to 0-100
    return totalFactors > 0 ? Math.round((matchCount / totalFactors) * 100) : 50;
  }
  
  /**
   * Calculates confidence score for the adaptation
   * 
   * @param contextualRelevance Contextual relevance result
   * @param enhancedClassification Optional enhanced classification result
   * @param relevanceScore Calculated relevance score
   * @returns Confidence score (0-100)
   */
  private calculateConfidenceScore(
    contextualRelevance: ContextualRelevanceResult,
    enhancedClassification?: EnhancedClassificationResult,
    relevanceScore?: number
  ): number {
    // Base confidence on relevance score
    const baseConfidence = relevanceScore || 70;
    
    // Adjust based on enhanced classification confidence if available
    if (enhancedClassification) {
      return Math.round((baseConfidence + (enhancedClassification.confidenceScore * 100)) / 2);
    }
    
    return baseConfidence;
  }
  
  /**
   * Calculates priority modifier for the ad
   * 
   * @param relevanceScore Relevance score
   * @param urgencyScore Urgency score
   * @param practicalityScore Practicality score
   * @returns Priority modifier (-10 to +10)
   */
  private calculatePriorityModifier(
    relevanceScore: number,
    urgencyScore: number,
    practicalityScore: number
  ): number {
    // Base modifier on relevance
    let modifier = 0;
    
    if (relevanceScore >= 90) {
      modifier += 5;
    } else if (relevanceScore >= 80) {
      modifier += 3;
    } else if (relevanceScore >= 70) {
      modifier += 1;
    } else if (relevanceScore <= 30) {
      modifier -= 5;
    } else if (relevanceScore <= 50) {
      modifier -= 3;
    }
    
    // Adjust based on urgency and practicality
    if (urgencyScore >= 80 && practicalityScore >= 80) {
      modifier += 3;
    } else if (urgencyScore >= 70 && practicalityScore >= 70) {
      modifier += 2;
    } else if (urgencyScore <= 30 && practicalityScore <= 30) {
      modifier -= 2;
    }
    
    // Cap at -10 to +10 range
    return Math.max(-10, Math.min(10, modifier));
  }
  
  /**
   * Generates customizations for the ad content
   * 
   * @param ad The ad to customize
   * @param adaptationParams Content adaptation parameters
   * @param contextualRelevance Contextual relevance result
   * @param enhancedClassification Optional enhanced classification result
   * @returns Customization recommendations
   */
  private generateCustomizations(
    ad: Ad,
    adaptationParams: ContentAdaptationParams,
    contextualRelevance: ContextualRelevanceResult,
    enhancedClassification?: EnhancedClassificationResult
  ): AdaptedContentResult['customizations'] {
    const customizations: AdaptedContentResult['customizations'] = {};
    
    // Title adjustments based on question intent and context
    customizations.titleAdjustments = this.generateTitleAdjustments(
      ad.title,
      contextualRelevance.questionIntent,
      enhancedClassification?.therapeuticIndications
    );
    
    // Content focus recommendations
    customizations.contentFocus = this.generateContentFocus(
      contextualRelevance,
      enhancedClassification
    );
    
    // Elements to emphasize
    customizations.emphasizedElements = this.generateEmphasizedElements(
      contextualRelevance.questionIntent,
      adaptationParams.depth,
      enhancedClassification?.entities
    );
    
    // Recommended interactivity level
    customizations.interactivityLevel = adaptationParams.interactiveComplexity;
    
    // Recommended content length
    customizations.recommendedLength = adaptationParams.length;
    
    return customizations;
  }
  
  /**
   * Generates title adjustment suggestions
   * 
   * @param originalTitle Original ad title
   * @param questionIntent Question intent
   * @param therapeuticIndications Optional therapeutic indications
   * @returns Title adjustment suggestions
   */
  private generateTitleAdjustments(
    originalTitle: string,
    questionIntent: QuestionIntent,
    therapeuticIndications?: any[]
  ): string[] {
    const adjustments: string[] = [];
    
    // Add intent-specific title suggestions
    switch (questionIntent) {
      case QuestionIntent.DIAGNOSIS:
        adjustments.push(`Diagnosing with ${originalTitle}`);
        adjustments.push(`${originalTitle}: Diagnostic Approach`);
        break;
      case QuestionIntent.TREATMENT:
        adjustments.push(`${originalTitle}: Treatment Options`);
        adjustments.push(`Managing Patients with ${originalTitle}`);
        break;
      case QuestionIntent.MECHANISM:
        adjustments.push(`Understanding ${originalTitle}: Mechanism of Action`);
        adjustments.push(`${originalTitle}: How It Works`);
        break;
      case QuestionIntent.RESEARCH:
        adjustments.push(`Latest Research on ${originalTitle}`);
        adjustments.push(`${originalTitle}: Evidence Update`);
        break;
      case QuestionIntent.GUIDELINE:
        adjustments.push(`${originalTitle}: Clinical Guidelines`);
        adjustments.push(`Practice Recommendations for ${originalTitle}`);
        break;
    }
    
    // Add indication-specific adjustments if available
    if (therapeuticIndications && therapeuticIndications.length > 0) {
      const indication = therapeuticIndications[0];
      if (indication.specificIndication) {
        adjustments.push(`${originalTitle} for ${indication.specificIndication}`);
      }
      if (indication.lineOfTherapy) {
        adjustments.push(`${originalTitle}: ${indication.lineOfTherapy} Therapy`);
      }
    }
    
    return adjustments;
  }
  
  /**
   * Generates content focus recommendations
   * 
   * @param contextualRelevance Contextual relevance result
   * @param enhancedClassification Optional enhanced classification result
   * @returns Content focus recommendations
   */
  private generateContentFocus(
    contextualRelevance: ContextualRelevanceResult,
    enhancedClassification?: EnhancedClassificationResult
  ): string[] {
    const focusAreas: string[] = [];
    
    // Add focus areas based on question intent
    switch (contextualRelevance.questionIntent) {
      case QuestionIntent.DIAGNOSIS:
        focusAreas.push('Diagnostic criteria');
        focusAreas.push('Differential diagnosis');
        focusAreas.push('Diagnostic algorithm');
        break;
      case QuestionIntent.TREATMENT:
        focusAreas.push('Treatment options');
        focusAreas.push('Efficacy data');
        focusAreas.push('Administration guidelines');
        break;
      case QuestionIntent.MECHANISM:
        focusAreas.push('Mechanism of action');
        focusAreas.push('Physiological pathways');
        focusAreas.push('Visual explanations');
        break;
      case QuestionIntent.RESEARCH:
        focusAreas.push('Recent clinical trials');
        focusAreas.push('Evidence quality');
        focusAreas.push('Research implications');
        break;
      case QuestionIntent.GUIDELINE:
        focusAreas.push('Practice recommendations');
        focusAreas.push('Guideline summary');
        focusAreas.push('Implementation steps');
        break;
    }
    
    // Add clinical context-specific focus if available
    if (enhancedClassification?.clinicalContext) {
      const context = enhancedClassification.clinicalContext;
      
      switch (context.setting) {
        case 'emergency':
          focusAreas.push('Urgent intervention steps');
          break;
        case 'outpatient':
          focusAreas.push('Outpatient management');
          break;
        case 'inpatient':
          focusAreas.push('Inpatient protocols');
          break;
      }
      
      switch (context.treatmentPhase) {
        case 'initial_treatment':
          focusAreas.push('First-line therapy options');
          break;
        case 'maintenance':
          focusAreas.push('Long-term management strategies');
          break;
        case 'recurrence':
          focusAreas.push('Treatment after failure/relapse');
          break;
      }
    }
    
    // Add patient demographic-specific focus if available
    if (enhancedClassification?.patientDemographics) {
      const demographics = enhancedClassification.patientDemographics;
      
      if (demographics.ageRange) {
        focusAreas.push(`Special considerations for ${demographics.ageRange} patients`);
      }
      
      if (demographics.comorbidities && demographics.comorbidities.length > 0) {
        focusAreas.push(`Management in patients with ${demographics.comorbidities[0]}`);
      }
    }
    
    return focusAreas;
  }
  
  /**
   * Generates recommended elements to emphasize
   * 
   * @param questionIntent Question intent
   * @param contentDepth Content depth
   * @param entities Optional clinical entities
   * @returns Elements to emphasize
   */
  private generateEmphasizedElements(
    questionIntent: QuestionIntent,
    contentDepth: ContentDepth,
    entities?: any[]
  ): string[] {
    const elements: string[] = [];
    
    // Add intent-specific elements
    switch (questionIntent) {
      case QuestionIntent.DIAGNOSIS:
        elements.push('Diagnostic algorithms');
        elements.push('Clinical presentations');
        elements.push('Differential diagnoses');
        break;
      case QuestionIntent.TREATMENT:
        elements.push('Efficacy data');
        elements.push('Safety profile');
        elements.push('Dosing information');
        break;
      case QuestionIntent.MECHANISM:
        elements.push('Mechanism visualizations');
        elements.push('Pathophysiology');
        elements.push('Pharmacodynamics');
        break;
      case QuestionIntent.RESEARCH:
        elements.push('Study design');
        elements.push('Statistical significance');
        elements.push('Clinical implications');
        break;
    }
    
    // Add depth-specific elements
    if (contentDepth === ContentDepth.EXPERT || contentDepth === ContentDepth.COMPREHENSIVE) {
      elements.push('Clinical trial data');
      elements.push('Expert opinions');
      elements.push('Case-based learning');
    }
    
    // Add entity-specific elements if available
    if (entities && entities.length > 0) {
      const conditionEntities = entities.filter(e => e.type === 'condition');
      const medicationEntities = entities.filter(e => e.type === 'medication');
      
      if (conditionEntities.length > 0) {
        elements.push(`${conditionEntities[0].term} specific information`);
      }
      
      if (medicationEntities.length > 0) {
        elements.push(`${medicationEntities[0].term} data`);
      }
    }
    
    return elements;
  }
  
  /**
   * Extracts demographic targeting information
   * 
   * @param demographics Patient demographics from enhanced classification
   * @returns Array of demographic targeting strings
   */
  private extractDemographicTargets(demographics: any): string[] {
    const targets: string[] = [];
    
    if (demographics.ageRange) {
      targets.push(`Age: ${demographics.ageRange}`);
    }
    
    if (demographics.gender) {
      targets.push(`Gender: ${demographics.gender}`);
    }
    
    if (demographics.riskFactors && demographics.riskFactors.length > 0) {
      demographics.riskFactors.forEach((factor: string) => {
        targets.push(`Risk factor: ${factor}`);
      });
    }
    
    if (demographics.comorbidities && demographics.comorbidities.length > 0) {
      demographics.comorbidities.forEach((condition: string) => {
        targets.push(`Comorbidity: ${condition}`);
      });
    }
    
    return targets;
  }
}

/**
 * Convenience function to adapt ad content based on contextual relevance
 * 
 * @param ad The ad to adapt
 * @param contextualRelevance Result from contextual relevance analysis
 * @param enhancedClassification Optional enhanced classification result
 * @param options Content adaptation options
 * @returns Adapted content result
 */
export function adaptAdContent(
  ad: Ad,
  contextualRelevance: ContextualRelevanceResult,
  enhancedClassification?: EnhancedClassificationResult,
  options: ContentAdaptationOptions = {}
): AdaptedContentResult {
  const service = new ContentAdaptationService(options);
  return service.adaptAdContent(ad, contextualRelevance, enhancedClassification);
} 