/**
 * Time estimation service for OpenAI API responses
 * Predicts response time based on question complexity and other factors
 */

import OpenAI from 'openai';
import { MedicalClassification } from './classification';
import { ContextualRelevanceResult } from './contextualRelevance';

/**
 * Expected progress event interface
 */
export interface ProgressEvent {
  progress: number; // 0-100
  estimatedTimeRemaining: number; // seconds
  stage: 'analyzing' | 'generating' | 'refining';
}

/**
 * Parameters used to calculate time estimation
 */
export interface TimeEstimationParams {
  questionLength: number;
  questionComplexity: number; // 0-100 based on topic and specificity 
  specialtyFactor: number; // 1-2 depending on specialty difficulty
  modelVersion: string; // e.g. 'gpt-3.5-turbo', 'gpt-4', etc.
}

/**
 * Estimation result returned by the service
 */
export interface TimeEstimationResult {
  initialEstimate: number; // seconds
  minEstimate: number; // seconds
  maxEstimate: number; // seconds
  confidenceLevel: number; // 0-1
  complexityScore: number; // 0-100
  detailedFactors: {
    questionLengthFactor: number;
    topicComplexityFactor: number;
    specialtyDifficultyFactor: number;
    modelPerformanceFactor: number;
  };
}

/**
 * Service for estimating OpenAI response generation time
 */
export class TimeEstimationService {
  private static readonly BASE_TIME = 2; // seconds, absolute minimum time
  private static readonly LENGTH_FACTOR = 0.02; // seconds per character
  private static readonly COMPLEXITY_MULTIPLIER = 0.05; // multiplier for complexity score
  private static readonly SPECIALTY_MULTIPLIER = 1.2; // multiplier for specialty difficulty
  
  // Model-specific factors (relative speed differences)
  private static readonly MODEL_FACTORS: Record<string, number> = {
    'gpt-3.5-turbo': 1.0,
    'gpt-4': 1.8,
    'gpt-4o': 1.3,
    'gpt-4-turbo': 1.5,
    'default': 1.4
  };

  // Progress tracking state
  private currentProgress: number = 0;
  private startTime: number = 0;
  private estimatedTotalTime: number = 0;
  private progressListeners: ((progress: ProgressEvent) => void)[] = [];
  private progressInterval: NodeJS.Timeout | null = null;

  /**
   * Estimate time based on question and classification
   * @param question The medical question
   * @param classification Medical classification if available
   * @param contextualRelevance Contextual relevance data if available
   * @returns Time estimation result
   */
  public estimateTime(
    question: string,
    classification?: MedicalClassification,
    contextualRelevance?: ContextualRelevanceResult
  ): TimeEstimationResult {
    // Use contextual relevance data if available (it already includes complexity estimates)
    if (contextualRelevance?.estimatedResponseTime) {
      return this.refineEstimateFromContextualData(question, contextualRelevance);
    }
    
    // Calculate question complexity based on available data
    const complexityScore = this.calculateComplexityScore(question, classification);
    
    // Calculate specialty difficulty factor
    const specialtyFactor = this.calculateSpecialtyFactor(classification);
    
    // Get model performance factor (defaulting to gpt-4)
    const modelFactor = TimeEstimationService.MODEL_FACTORS[process.env.OPENAI_MODEL || 'default'];
    
    // Calculate base time estimation
    const estimationParams: TimeEstimationParams = {
      questionLength: question.length,
      questionComplexity: complexityScore,
      specialtyFactor: specialtyFactor,
      modelVersion: process.env.OPENAI_MODEL || 'default'
    };
    
    return this.calculateEstimate(estimationParams);
  }

  /**
   * Calculate time estimate based on estimation parameters
   * @param params Estimation parameters
   * @returns Time estimation result
   */
  private calculateEstimate(params: TimeEstimationParams): TimeEstimationResult {
    // Base calculation
    const lengthComponent = params.questionLength * TimeEstimationService.LENGTH_FACTOR;
    const complexityComponent = params.questionComplexity * TimeEstimationService.COMPLEXITY_MULTIPLIER;
    const specialtyComponent = params.specialtyFactor * TimeEstimationService.SPECIALTY_MULTIPLIER;
    const modelFactor = TimeEstimationService.MODEL_FACTORS[params.modelVersion] || 
                       TimeEstimationService.MODEL_FACTORS.default;
    
    // Combined estimate
    const baseEstimate = TimeEstimationService.BASE_TIME + 
                        (lengthComponent + complexityComponent) * specialtyComponent * modelFactor;
    
    // Round to nearest integer and ensure minimum time
    const initialEstimate = Math.max(Math.round(baseEstimate), TimeEstimationService.BASE_TIME);
    
    // Create variance bounds
    const minEstimate = Math.max(Math.round(initialEstimate * 0.7), TimeEstimationService.BASE_TIME);
    const maxEstimate = Math.round(initialEstimate * 1.5);
    
    // Calculate confidence based on available data
    const confidenceLevel = this.calculateConfidenceLevel(params);
    
    return {
      initialEstimate,
      minEstimate,
      maxEstimate,
      confidenceLevel,
      complexityScore: params.questionComplexity,
      detailedFactors: {
        questionLengthFactor: lengthComponent,
        topicComplexityFactor: complexityComponent,
        specialtyDifficultyFactor: specialtyComponent,
        modelPerformanceFactor: modelFactor
      }
    };
  }

  /**
   * Calculate complexity score from question and classification
   * @param question The medical question
   * @param classification Medical classification if available
   * @returns Complexity score (0-100)
   */
  private calculateComplexityScore(
    question: string,
    classification?: MedicalClassification
  ): number {
    // Base complexity from length and structure
    let complexityScore = Math.min(question.length / 20, 40); // 0-40 based on length
    
    // Add complexity based on question structure
    if (question.includes('?')) {
      const questionCount = (question.match(/\?/g) || []).length;
      complexityScore += questionCount * 5; // 5 points per question
    }
    
    // Keywords that suggest complexity
    const complexityIndicators = [
      'why', 'how', 'explain', 'compare', 'contrast', 'difference',
      'mechanism', 'pathophysiology', 'etiology', 'evidence',
      'complicated', 'complex', 'rare', 'unusual'
    ];
    
    complexityIndicators.forEach(word => {
      if (question.toLowerCase().includes(word)) {
        complexityScore += 3;
      }
    });
    
    // If classification is available, use it to refine complexity
    if (classification) {
      // Add complexity based on primary category confidence
      // Lower confidence often means more ambiguous/complex questions
      complexityScore += (1 - classification.primaryCategory.confidence) * 20;
      
      // Medical specialties that typically involve more complex questions
      const complexSpecialties = [
        'oncology', 'neurology', 'immunology', 'endocrinology', 
        'rheumatology', 'genetics', 'hematology'
      ];
      
      if (complexSpecialties.includes(classification.primaryCategory.id)) {
        complexityScore += 15;
      }
    }
    
    // Cap at 100
    return Math.min(Math.round(complexityScore), 100);
  }

  /**
   * Calculate specialty factor based on medical classification
   * @param classification Medical classification if available
   * @returns Specialty difficulty factor (1-2)
   */
  private calculateSpecialtyFactor(classification?: MedicalClassification): number {
    if (!classification) {
      return 1.3; // Default factor when no classification is available
    }
    
    // Define specialty difficulty factors
    const specialtyFactors: Record<string, number> = {
      'cardiology': 1.4,
      'dermatology': 1.2,
      'endocrinology': 1.6,
      'gastroenterology': 1.3,
      'genetics': 1.7,
      'hematology': 1.5,
      'immunology': 1.6,
      'infectious_disease': 1.4,
      'nephrology': 1.5,
      'neurology': 1.7,
      'oncology': 1.8,
      'pediatrics': 1.3,
      'psychiatry': 1.4,
      'pulmonology': 1.4,
      'rheumatology': 1.6,
      'surgery': 1.5,
      'default': 1.3
    };
    
    return specialtyFactors[classification.primaryCategory.id] || specialtyFactors.default;
  }

  /**
   * Calculate confidence level for the estimation
   * @param params Estimation parameters
   * @returns Confidence level (0-1)
   */
  private calculateConfidenceLevel(params: TimeEstimationParams): number {
    // Base confidence
    let confidence = 0.7;
    
    // Adjust confidence based on question length
    // Very short or very long questions are harder to estimate
    const normalizedLength = Math.min(params.questionLength / 200, 1);
    if (normalizedLength < 0.2 || normalizedLength > 0.8) {
      confidence -= 0.1;
    }
    
    // Adjust confidence based on complexity
    // Very simple or very complex questions have less reliable estimates
    const normalizedComplexity = params.questionComplexity / 100;
    if (normalizedComplexity > 0.8) {
      confidence -= 0.15;
    }
    
    return Math.max(0.4, Math.min(confidence, 0.95));
  }

  /**
   * Refine estimation using contextual relevance data
   * @param question The medical question
   * @param contextualData Contextual relevance data
   * @returns Time estimation result
   */
  private refineEstimateFromContextualData(
    question: string,
    contextualData: ContextualRelevanceResult
  ): TimeEstimationResult {
    // Use the estimatedResponseTime from contextual data as the primary estimate
    const initialEstimate = contextualData.estimatedResponseTime;
    
    // Calculate min and max estimates
    const minEstimate = Math.max(Math.round(initialEstimate * 0.8), TimeEstimationService.BASE_TIME);
    const maxEstimate = Math.round(initialEstimate * 1.3);
    
    // Use specificity and complexity level to determine confidence
    let confidenceLevel = 0.8;
    
    if (contextualData.specificity > 85) {
      confidenceLevel += 0.1;
    } else if (contextualData.specificity < 50) {
      confidenceLevel -= 0.1;
    }
    
    const complexityMap: Record<string, number> = {
      'basic': 30,
      'intermediate': 50,
      'advanced': 80,
      'expert': 95
    };
    
    const complexityScore = complexityMap[contextualData.complexityLevel] || 60;
    
    return {
      initialEstimate,
      minEstimate,
      maxEstimate,
      confidenceLevel: Math.min(confidenceLevel, 0.95),
      complexityScore,
      detailedFactors: {
        questionLengthFactor: question.length * 0.02,
        topicComplexityFactor: complexityScore * 0.05,
        specialtyDifficultyFactor: contextualData.urgencyScore > 80 ? 1.5 : 1.3,
        modelPerformanceFactor: TimeEstimationService.MODEL_FACTORS[process.env.OPENAI_MODEL || 'default']
      }
    };
  }

  /**
   * Start tracking progress for a specific estimated time
   * @param estimatedTime Estimated total time in seconds
   */
  public startProgressTracking(estimatedTime: number): void {
    this.currentProgress = 0;
    this.startTime = Date.now();
    this.estimatedTotalTime = estimatedTime * 1000; // Convert to ms
    
    // Clear any existing interval
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    // Start progress simulation
    this.progressInterval = setInterval(() => {
      // Calculate elapsed time
      const elapsedTime = Date.now() - this.startTime;
      
      // Calculate progress with non-linear curve
      // Progress faster at the beginning, slower towards the end
      this.currentProgress = this.simulateProgress(elapsedTime / this.estimatedTotalTime);
      
      // Estimate remaining time based on current progress and elapsed time
      const estimatedTimeRemaining = this.calculateRemainingTime(
        this.currentProgress, 
        elapsedTime, 
        this.estimatedTotalTime
      );
      
      // Determine current stage
      const stage = this.determineCurrentStage(this.currentProgress);
      
      // Notify listeners
      this.notifyProgressListeners({
        progress: this.currentProgress,
        estimatedTimeRemaining: Math.round(estimatedTimeRemaining / 1000), // Convert to seconds
        stage
      });
      
      // If we're done, clear the interval
      if (this.currentProgress >= 100) {
        if (this.progressInterval) {
          clearInterval(this.progressInterval);
          this.progressInterval = null;
        }
      }
    }, 500); // Update every 500ms
  }

  /**
   * Simulate non-linear progress curve
   * @param normalizedTime Time elapsed as fraction of total estimated time (0-1)
   * @returns Simulated progress (0-100)
   */
  private simulateProgress(normalizedTime: number): number {
    // Ensure time is between 0 and 1
    const clampedTime = Math.max(0, Math.min(normalizedTime, 1));
    
    // Use different curves for different stages of progress
    let progress;
    if (clampedTime < 0.2) {
      // Start quickly (analyzing phase)
      progress = clampedTime * 3 * 25; // Up to ~15%
    } else if (clampedTime < 0.8) {
      // Middle phase slower (generating phase)
      progress = 15 + ((clampedTime - 0.2) / 0.6) * 70; // 15% to 85%
    } else {
      // End phase even slower (refining/finalizing)
      progress = 85 + ((clampedTime - 0.8) / 0.2) * 15; // 85% to 100%
    }
    
    // If real time exceeds estimate by 20%, force progress to complete
    if (normalizedTime > 1.2) {
      progress = 100;
    }
    
    return Math.min(Math.round(progress), 100);
  }

  /**
   * Calculate estimated remaining time based on current progress
   * @param currentProgress Current progress (0-100)
   * @param elapsedTime Time elapsed in ms
   * @param estimatedTotalTime Total estimated time in ms
   * @returns Estimated remaining time in ms
   */
  private calculateRemainingTime(
    currentProgress: number, 
    elapsedTime: number, 
    estimatedTotalTime: number
  ): number {
    if (currentProgress >= 100) {
      return 0;
    }
    
    if (currentProgress <= 0) {
      return estimatedTotalTime;
    }
    
    // Adjust estimation based on actual elapsed time vs. expected
    const expectedElapsedTime = (currentProgress / 100) * estimatedTotalTime;
    const progressRatio = elapsedTime / expectedElapsedTime;
    
    // Calculate remaining time with adjustment
    const remainingProgress = 100 - currentProgress;
    const expectedRemainingTime = (remainingProgress / 100) * estimatedTotalTime;
    
    // Adjust based on how actual progress compares to expected
    return Math.max(500, expectedRemainingTime * progressRatio);
  }

  /**
   * Determine the current stage of generation
   * @param progress Current progress (0-100)
   * @returns Current generation stage
   */
  private determineCurrentStage(progress: number): 'analyzing' | 'generating' | 'refining' {
    if (progress < 15) {
      return 'analyzing';
    } else if (progress < 85) {
      return 'generating';
    } else {
      return 'refining';
    }
  }

  /**
   * Update progress manually (when receiving actual progress updates)
   * @param progress Current progress (0-100)
   */
  public updateProgress(progress: number): void {
    this.currentProgress = Math.min(Math.max(0, progress), 100);
    
    // Calculate elapsed time
    const elapsedTime = Date.now() - this.startTime;
    
    // Estimate remaining time
    const estimatedTimeRemaining = this.calculateRemainingTime(
      this.currentProgress,
      elapsedTime,
      this.estimatedTotalTime
    );
    
    // Determine current stage
    const stage = this.determineCurrentStage(this.currentProgress);
    
    // Notify listeners
    this.notifyProgressListeners({
      progress: this.currentProgress,
      estimatedTimeRemaining: Math.round(estimatedTimeRemaining / 1000),
      stage
    });
    
    // If we're done, clear the interval
    if (this.currentProgress >= 100 && this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Add a progress listener
   * @param listener Function to call with progress updates
   */
  public addProgressListener(listener: (progress: ProgressEvent) => void): void {
    this.progressListeners.push(listener);
  }

  /**
   * Remove a progress listener
   * @param listener Listener to remove
   */
  public removeProgressListener(listener: (progress: ProgressEvent) => void): void {
    this.progressListeners = this.progressListeners.filter(l => l !== listener);
  }

  /**
   * Notify all progress listeners
   * @param event Progress event
   */
  private notifyProgressListeners(event: ProgressEvent): void {
    this.progressListeners.forEach(listener => listener(event));
  }

  /**
   * Stop progress tracking
   */
  public stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Complete progress tracking (set to 100%)
   */
  public completeProgress(): void {
    this.currentProgress = 100;
    
    this.notifyProgressListeners({
      progress: 100,
      estimatedTimeRemaining: 0,
      stage: 'refining'
    });
    
    this.stopProgressTracking();
  }
}

// Export singleton instance
export const timeEstimator = new TimeEstimationService();

export default timeEstimator; 