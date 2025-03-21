/**
 * Content timing adaptation service
 * Dynamically adjusts content flow to match generation progress
 */

import { timeEstimator, ProgressEvent, TimeEstimationResult } from './timeEstimation';
import { MicrosimulationConfigService } from './microsimulationConfig';
import { MedicalClassification } from './classification';

// Content depth levels for different time ranges
export enum ContentDepthLevel {
  MINIMAL = 'minimal',     // < 5 seconds - one or two quick points
  BASIC = 'basic',         // 5-15 seconds - abbreviated content
  STANDARD = 'standard',   // 15-45 seconds - normal content flow
  ENHANCED = 'enhanced',   // 45-90 seconds - deeper exploration
  COMPREHENSIVE = 'comprehensive' // > 90 seconds - most detailed educational content
}

// Content timing configuration
export interface ContentTimingConfig {
  depthLevel: ContentDepthLevel;
  microsimulationDepth: number; // 1-5 scale
  recommendedComponents: string[];
  educationalPointsTarget: number;
  paceMultiplier: number; // Adjusts content presentation speed
  earlyCompletionThreshold: number; // % of educational points to show before allowing early completion
}

// Progress synchronization interface
export interface ContentProgressState {
  answerProgress: number; // 0-100
  contentProgress: number; // 0-100
  timeRemaining: number; // seconds
  educationalPointsCompleted: number;
  educationalPointsTotal: number;
  canShowAnswer: boolean;
  recommendedContentComponents: string[];
}

/**
 * Service for adapting content timing to match generation time
 */
export class ContentTimingService {
  private microsimulationService: MicrosimulationConfigService;
  private progressListeners: ((state: ContentProgressState) => void)[] = [];
  private currentState: ContentProgressState;
  private contentConfig: ContentTimingConfig;
  private estimationResult: TimeEstimationResult | null = null;
  
  constructor() {
    this.microsimulationService = new MicrosimulationConfigService();
    this.contentConfig = this.getDefaultContentConfig();
    this.currentState = {
      answerProgress: 0,
      contentProgress: 0,
      timeRemaining: 0,
      educationalPointsCompleted: 0,
      educationalPointsTotal: 5, // Default
      canShowAnswer: false,
      recommendedContentComponents: []
    };
    
    // Listen to time estimator progress
    timeEstimator.addProgressListener(this.handleProgressUpdate.bind(this));
  }
  
  /**
   * Initialize content timing based on question and classification
   * @param question The physician's question
   * @param classification Medical classification if available
   * @param estimationResult Time estimation result
   * @returns Content timing configuration
   */
  public initializeContentTiming(
    question: string,
    classification?: MedicalClassification,
    estimationResult?: TimeEstimationResult
  ): ContentTimingConfig {
    // Store estimation result for later use
    if (estimationResult) {
      this.estimationResult = estimationResult;
    } else {
      // Generate estimation if not provided
      this.estimationResult = timeEstimator.estimateTime(question, classification);
    }
    
    // Generate content timing configuration based on estimated time
    this.contentConfig = this.generateContentConfig(this.estimationResult);
    
    // Reset current state
    this.currentState = {
      answerProgress: 0,
      contentProgress: 0,
      timeRemaining: this.estimationResult.initialEstimate,
      educationalPointsCompleted: 0,
      educationalPointsTotal: this.contentConfig.educationalPointsTarget,
      canShowAnswer: false,
      recommendedContentComponents: this.contentConfig.recommendedComponents
    };
    
    // Start progress tracking
    timeEstimator.startProgressTracking(this.estimationResult.initialEstimate);
    
    return this.contentConfig;
  }
  
  /**
   * Generate content configuration based on estimated time
   * @param estimationResult Time estimation result
   * @returns Content timing configuration
   */
  private generateContentConfig(estimationResult: TimeEstimationResult): ContentTimingConfig {
    const estimatedTime = estimationResult.initialEstimate;
    
    // Determine depth level based on estimated time
    let depthLevel = ContentDepthLevel.STANDARD;
    let microsimulationDepth = 3;
    let educationalPointsTarget = 5;
    let paceMultiplier = 1.0;
    
    if (estimatedTime < 5) {
      depthLevel = ContentDepthLevel.MINIMAL;
      microsimulationDepth = 1;
      educationalPointsTarget = 2;
      paceMultiplier = 1.5; // Faster pace for quick content
    } else if (estimatedTime < 15) {
      depthLevel = ContentDepthLevel.BASIC;
      microsimulationDepth = 2;
      educationalPointsTarget = 3;
      paceMultiplier = 1.2;
    } else if (estimatedTime < 45) {
      depthLevel = ContentDepthLevel.STANDARD;
      microsimulationDepth = 3;
      educationalPointsTarget = 5;
      paceMultiplier = 1.0;
    } else if (estimatedTime < 90) {
      depthLevel = ContentDepthLevel.ENHANCED;
      microsimulationDepth = 4;
      educationalPointsTarget = 7;
      paceMultiplier = 0.9; // Slightly slower pace for deeper content
    } else {
      depthLevel = ContentDepthLevel.COMPREHENSIVE;
      microsimulationDepth = 5;
      educationalPointsTarget = 10;
      paceMultiplier = 0.8; // Slowest pace for comprehensive content
    }
    
    // Determine which content components to recommend based on depth level
    const recommendedComponents = this.getRecommendedComponents(
      depthLevel, 
      estimationResult.complexityScore
    );
    
    // Calculate early completion threshold based on depth level
    // For minimal content, we can show answer after just 50% of educational points
    // For comprehensive content, we want to show at least 80% of points
    let earlyCompletionThreshold = 0.7; // Default: 70% of points
    
    switch (depthLevel) {
      case ContentDepthLevel.MINIMAL:
        earlyCompletionThreshold = 0.5;
        break;
      case ContentDepthLevel.BASIC:
        earlyCompletionThreshold = 0.6;
        break;
      case ContentDepthLevel.STANDARD:
        earlyCompletionThreshold = 0.7;
        break;
      case ContentDepthLevel.ENHANCED:
        earlyCompletionThreshold = 0.75;
        break;
      case ContentDepthLevel.COMPREHENSIVE:
        earlyCompletionThreshold = 0.8;
        break;
    }
    
    return {
      depthLevel,
      microsimulationDepth,
      recommendedComponents,
      educationalPointsTarget,
      paceMultiplier,
      earlyCompletionThreshold
    };
  }
  
  /**
   * Get recommended content components based on depth level and complexity
   * @param depthLevel Content depth level
   * @param complexityScore Complexity score (0-100)
   * @returns Array of recommended component types
   */
  private getRecommendedComponents(
    depthLevel: ContentDepthLevel,
    complexityScore: number
  ): string[] {
    const allComponents = [
      'educational_text',
      'key_points',
      'interactive_diagram',
      'microsimulation',
      'decision_tree',
      'clinical_pearls',
      'evidence_summary',
      'comparison_table',
      'animated_mechanism',
      'case_study',
      'quiz'
    ];
    
    // Select components based on depth level
    switch (depthLevel) {
      case ContentDepthLevel.MINIMAL:
        return ['key_points', 'educational_text'];
        
      case ContentDepthLevel.BASIC:
        return ['educational_text', 'key_points', 'clinical_pearls'];
        
      case ContentDepthLevel.STANDARD:
        return complexityScore > 60
          ? ['educational_text', 'key_points', 'microsimulation', 'clinical_pearls']
          : ['educational_text', 'key_points', 'interactive_diagram', 'clinical_pearls'];
        
      case ContentDepthLevel.ENHANCED:
        return complexityScore > 70
          ? ['educational_text', 'key_points', 'microsimulation', 'decision_tree', 'evidence_summary', 'clinical_pearls']
          : ['educational_text', 'key_points', 'interactive_diagram', 'comparison_table', 'clinical_pearls', 'evidence_summary'];
        
      case ContentDepthLevel.COMPREHENSIVE:
        return complexityScore > 80
          ? ['educational_text', 'key_points', 'microsimulation', 'decision_tree', 'animated_mechanism', 'evidence_summary', 'case_study', 'clinical_pearls', 'comparison_table']
          : ['educational_text', 'key_points', 'interactive_diagram', 'microsimulation', 'comparison_table', 'evidence_summary', 'clinical_pearls', 'quiz'];
        
      default:
        // Default to standard components
        return ['educational_text', 'key_points', 'microsimulation', 'clinical_pearls'];
    }
  }
  
  /**
   * Get default content configuration
   * @returns Default content timing configuration
   */
  private getDefaultContentConfig(): ContentTimingConfig {
    return {
      depthLevel: ContentDepthLevel.STANDARD,
      microsimulationDepth: 3,
      recommendedComponents: [
        'educational_text',
        'key_points',
        'microsimulation',
        'clinical_pearls'
      ],
      educationalPointsTarget: 5,
      paceMultiplier: 1.0,
      earlyCompletionThreshold: 0.7
    };
  }
  
  /**
   * Handle progress updates from the time estimator
   * @param progress Progress event from time estimator
   */
  private handleProgressUpdate(progress: ProgressEvent): void {
    if (!this.estimationResult) return;
    
    // Calculate educational points completed based on content progress
    const totalPoints = this.contentConfig.educationalPointsTarget;
    
    // Use slightly different curve for educational points vs. answer generation
    // Education should be ahead of answer to ensure completion before answer shows
    let contentProgress;
    
    if (progress.progress < 30) {
      // Start educational content quickly
      contentProgress = progress.progress * 1.5;
    } else if (progress.progress < 70) {
      // Middle range - education stays ahead of answer generation
      contentProgress = 45 + ((progress.progress - 30) / 40) * 40;
    } else {
      // End range - ensure education completes before answer
      contentProgress = 85 + ((progress.progress - 70) / 30) * 15;
    }
    
    contentProgress = Math.min(contentProgress, 100);
    
    // Calculate educational points completed
    const pointsCompleted = Math.min(
      Math.ceil((contentProgress / 100) * totalPoints),
      totalPoints
    );
    
    // Determine if we can show the answer yet
    // Answer can be shown when either:
    // 1. We've reached the early completion threshold of educational points
    // 2. Answer generation is complete (progress == 100)
    const earlyCompletionThreshold = this.contentConfig.earlyCompletionThreshold;
    const earlyCompletionPoints = Math.ceil(totalPoints * earlyCompletionThreshold);
    const canShowAnswer = progress.progress >= 100 || 
                         (pointsCompleted >= earlyCompletionPoints);
    
    // Update current state
    this.currentState = {
      answerProgress: progress.progress,
      contentProgress: contentProgress,
      timeRemaining: progress.estimatedTimeRemaining,
      educationalPointsCompleted: pointsCompleted,
      educationalPointsTotal: totalPoints,
      canShowAnswer: canShowAnswer,
      recommendedContentComponents: this.contentConfig.recommendedComponents
    };
    
    // Notify listeners
    this.notifyProgressListeners();
  }
  
  /**
   * Get microsimulation configuration adjusted for the current wait time
   * @param question The physician's question
   * @param company The pharmaceutical company if applicable
   * @param treatmentCategory The treatment category if applicable
   * @returns Microsimulation configuration
   */
  public getMicrosimulationConfig(
    question: string,
    company?: any,
    treatmentCategory?: any
  ): any {
    if (!this.estimationResult) {
      // If no estimation result, use default waiting time
      return this.microsimulationService.generateConfiguration(
        question,
        company,
        treatmentCategory,
        30 // Default waiting time
      );
    }
    
    // Use the estimated waiting time and add microsimulation depth
    const config = this.microsimulationService.generateConfiguration(
      question,
      company,
      treatmentCategory,
      this.estimationResult.initialEstimate
    );
    
    // Adjust complexity based on our depth setting
    return {
      ...config,
      complexity: this.contentConfig.microsimulationDepth,
      adaptiveTiming: true, // Enable adaptive timing
      educationalPointsTarget: this.contentConfig.educationalPointsTarget,
      earlyCompletionThreshold: this.contentConfig.earlyCompletionThreshold
    };
  }
  
  /**
   * Record educational point completion
   * @param pointsCompleted Number of educational points completed
   */
  public updateEducationalPoints(pointsCompleted: number): void {
    this.currentState.educationalPointsCompleted = Math.min(
      pointsCompleted,
      this.currentState.educationalPointsTotal
    );
    
    // Recalculate if answer can be shown
    const earlyCompletionThreshold = this.contentConfig.earlyCompletionThreshold;
    const earlyCompletionPoints = Math.ceil(this.currentState.educationalPointsTotal * earlyCompletionThreshold);
    this.currentState.canShowAnswer = this.currentState.answerProgress >= 100 || 
                                    (this.currentState.educationalPointsCompleted >= earlyCompletionPoints);
    
    // Notify listeners
    this.notifyProgressListeners();
  }
  
  /**
   * Add a progress listener
   * @param listener Function to call with progress updates
   */
  public addProgressListener(listener: (state: ContentProgressState) => void): void {
    this.progressListeners.push(listener);
  }
  
  /**
   * Remove a progress listener
   * @param listener Listener to remove
   */
  public removeProgressListener(listener: (state: ContentProgressState) => void): void {
    this.progressListeners = this.progressListeners.filter(l => l !== listener);
  }
  
  /**
   * Notify all progress listeners
   */
  private notifyProgressListeners(): void {
    this.progressListeners.forEach(listener => listener(this.currentState));
  }
  
  /**
   * Handle early completion of answer generation
   * Forces content to adapt to the shorter waiting time
   */
  public handleEarlyCompletion(): void {
    // Calculate how much to accelerate content
    const currentAnswerProgress = this.currentState.answerProgress;
    
    if (currentAnswerProgress >= 100) {
      // Answer is already complete, no need to adapt
      return;
    }
    
    // Mark answer as complete
    this.currentState.answerProgress = 100;
    
    // Check if we've reached the minimal education threshold
    const earlyCompletionThreshold = this.contentConfig.earlyCompletionThreshold;
    const earlyCompletionPoints = Math.ceil(this.currentState.educationalPointsTotal * earlyCompletionThreshold);
    
    if (this.currentState.educationalPointsCompleted < earlyCompletionPoints) {
      // Need to accelerate educational content
      // Calculate remaining points needed
      const remainingPoints = earlyCompletionPoints - this.currentState.educationalPointsCompleted;
      
      // Set state to show we're right at the threshold but not complete
      this.currentState.educationalPointsCompleted = earlyCompletionPoints - 1;
      this.currentState.contentProgress = Math.min(
        (earlyCompletionPoints / this.currentState.educationalPointsTotal) * 100,
        99 // Keep it just under 100%
      );
      
      // We still can't show the answer until we reach the threshold
      this.currentState.canShowAnswer = false;
    } else {
      // We've reached the threshold, can show answer
      this.currentState.canShowAnswer = true;
    }
    
    // Notify listeners
    this.notifyProgressListeners();
  }
  
  /**
   * Reset the timing service state
   */
  public reset(): void {
    // Stop progress tracking
    timeEstimator.stopProgressTracking();
    
    // Reset state
    this.estimationResult = null;
    this.contentConfig = this.getDefaultContentConfig();
    this.currentState = {
      answerProgress: 0,
      contentProgress: 0,
      timeRemaining: 0,
      educationalPointsCompleted: 0,
      educationalPointsTotal: 5, // Default
      canShowAnswer: false,
      recommendedContentComponents: []
    };
    
    // Notify listeners
    this.notifyProgressListeners();
  }
}

// Export singleton instance
export const contentTimingService = new ContentTimingService();
export default contentTimingService; 