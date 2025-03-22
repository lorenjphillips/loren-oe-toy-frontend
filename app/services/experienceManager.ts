import { classifyMedicalQuestion, MedicalClassification } from './classification';
import { timeEstimator } from './timeEstimation';
import { ContextualRelevanceAnalyzer } from './contextualRelevance';
import { EnhancedMappingResult } from './confidenceScoring';
import { AdType } from '../types/adTypeUnified';

/**
 * Experience format types available in the system
 */
export enum AdExperienceType {
  MICROSIMULATION = 'microsimulation',
  KNOWLEDGE_GRAPH = 'knowledge_graph',
  EVIDENCE_CARD = 'evidence_card',
  STANDARD = 'standard', // Fallback to regular ad display
}

/**
 * Experience context interface
 */
export interface ExperienceContext {
  question: string;
  classification?: MedicalClassification;
  estimatedWaitTimeMs?: number;
  deviceCapabilities?: {
    isHighPerformance: boolean;
    isMobile: boolean;
  };
}

/**
 * Experience result interface
 */
export interface ExperienceResult {
  selectedType: AdExperienceType;
  fallbackType?: AdExperienceType;
  config: ExperienceConfig;
  reasoning: string[];
}

/**
 * Experience config interface
 */
export interface ExperienceConfig {
  type: AdExperienceType;
  priority: number;
  minWaitTimeMs?: number; // Minimum wait time required
  maxWaitTimeMs?: number; // Maximum wait time to show this experience
  settings: {
    adType?: AdType;
    [key: string]: any;
  };
}

// Helper function to check if classification has treatment categories
function hasTreatmentCategories(classification: MedicalClassification | undefined): boolean {
  if (!classification) return false;
  return Boolean(classification.categories?.some(category => category.includes('treatment') || category.includes('medication')));
}

/**
 * ExperienceManager service
 * 
 * This service is responsible for intelligently selecting the optimal ad
 * experience type based on the question context, estimated wait time,
 * and other factors.
 */
export class ExperienceManager {
  /**
   * Detect device capabilities
   */
  private detectDeviceCapabilities(): { isHighPerformance: boolean; isMobile: boolean } {
    // Client-side detection
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Simple heuristic based on device memory and cores
      const isHighPerformance = 
        (navigator as any).deviceMemory > 4 || 
        (navigator as any).hardwareConcurrency > 4;
        
      return { isHighPerformance, isMobile };
    }
    
    // Server-side default to conservative values
    return {
      isHighPerformance: false,
      isMobile: false
    };
  }

  /**
   * Evaluates question and context to determine the optimal experience type
   */
  async selectExperience(context: ExperienceContext): Promise<ExperienceResult> {
    const { question } = context;
    
    // Get classification if not provided
    const classification = context.classification ||
      await classifyMedicalQuestion(question);

    // Get question complexity
    const analyzer = new ContextualRelevanceAnalyzer();
    const complexityResult = await analyzer.analyzeContextualRelevance(question);

    // Get wait time estimation
    const waitTimeResult = await timeEstimator.estimateTime(question, classification);
    const waitTimeMs = waitTimeResult.initialEstimate * 1000; // Convert seconds to milliseconds

    // Determine device capabilities if not provided
    const deviceCapabilities = context.deviceCapabilities || 
      this.detectDeviceCapabilities();

    // Generate experience options
    const options = this.generateExperienceOptions({
      ...context,
      classification,
      estimatedWaitTimeMs: waitTimeMs,
      deviceCapabilities,
    });

    // Select best option based on scoring
    return this.selectBestOption(options, {
      ...context,
      classification,
      estimatedWaitTimeMs: waitTimeMs,
      deviceCapabilities,
    });
  }

  /**
   * Generate experience options based on context
   */
  private generateExperienceOptions(context: ExperienceContext): ExperienceConfig[] {
    const options: ExperienceConfig[] = [];
    const { classification, estimatedWaitTimeMs } = context;

    // Add options based on context
    if (hasTreatmentCategories(classification)) {
      options.push({
        type: AdExperienceType.MICROSIMULATION,
        priority: 8,
        minWaitTimeMs: 5000,
        settings: {
          adType: AdType.SPONSORED_CONTENT,
        }
      });
    }

    // Add more options...

    return options;
  }

  /**
   * Selects the best option from available experience options
   */
  private selectBestOption(options: ExperienceConfig[], context: ExperienceContext): ExperienceResult {
    let highestScore = -1;
    let bestOption: ExperienceConfig | undefined;
    let fallbackOption: ExperienceConfig | undefined;
    const reasoning: string[] = [];

    // Score and select options
    for (const option of options) {
      const score = this.scoreOption(option);
      
      if (score > highestScore) {
        highestScore = score;
        bestOption = option;
        reasoning.push(`${option.type} selected as best option with score ${score}`);
      } else if (!fallbackOption || score > fallbackOption.priority) {
        fallbackOption = option;
        reasoning.push(`${option.type} selected as fallback option with score ${score}`);
      }
    }

    // Return result with fallback to standard if needed
    return {
      selectedType: bestOption?.type || AdExperienceType.STANDARD,
      fallbackType: fallbackOption?.type,
      config: bestOption || {
        type: AdExperienceType.STANDARD,
        priority: 5,
        settings: {
          adType: AdType.SPONSORED_CONTENT,
        }
      },
      reasoning,
    };
  }

  /**
   * Score an individual option
   */
  private scoreOption(option: ExperienceConfig): number {
    // Simple scoring based on priority
    return option.priority;
  }

  async determineExperience(question: string, context: ExperienceContext = { question }): Promise<ExperienceResult> {
    // Get classification if not provided
    const classification = context.classification ||
      await classifyMedicalQuestion(question);

    // Get question complexity
    const analyzer = new ContextualRelevanceAnalyzer();
    const complexityResult = await analyzer.analyzeContextualRelevance(question);

    // Get wait time estimation
    const waitTimeResult = await timeEstimator.estimateTime(question, classification);
    const waitTimeMs = waitTimeResult.initialEstimate * 1000; // Convert seconds to milliseconds

    // Determine device capabilities if not provided
    const deviceCapabilities = context.deviceCapabilities || 
      this.detectDeviceCapabilities();

    // Generate experience options
    const options = this.generateExperienceOptions({
      ...context,
      classification,
      estimatedWaitTimeMs: waitTimeMs,
      deviceCapabilities,
    });

    // Select best option based on scoring
    const result = await this.selectExperience({
      ...context,
      classification,
      estimatedWaitTimeMs: waitTimeMs,
      deviceCapabilities,
    });

    return result;
  }
}