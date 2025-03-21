import { classifyMedicalQuestion, MedicalClassification } from './classification';
import { contentTimingService } from './contentTiming';
import { getQuestionComplexity } from './contextualRelevance';
import { EnhancedMappingResult } from './confidenceScoring';
import { AdType } from '../types/ad';

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
 * Contextual data about the question and environment
 */
export interface ExperienceContext {
  question: string;
  classification?: MedicalClassification;
  estimatedWaitTimeMs?: number;
  mapping?: EnhancedMappingResult;
  userPreferences?: {
    preferInteractive?: boolean;
    preferVisual?: boolean;
  };
  deviceCapabilities?: {
    isHighPerformance: boolean;
    isMobile: boolean;
  };
}

/**
 * Configuration for an ad experience
 */
export interface ExperienceConfig {
  type: AdExperienceType;
  priority: number; // 0-10 where 10 is highest
  minWaitTimeMs?: number; // Minimum wait time required
  maxWaitTimeMs?: number; // Maximum wait time to show this experience
  settings?: Record<string, any>; // Experience-specific settings
}

/**
 * Result from the experience manager containing the selected experience and configuration
 */
export interface ExperienceSelection {
  selectedType: AdExperienceType;
  fallbackType?: AdExperienceType;
  config: ExperienceConfig;
  reasoning: string[];
}

/**
 * ExperienceManager service
 * 
 * This service is responsible for intelligently selecting the optimal ad
 * experience type based on the question context, estimated wait time,
 * and other factors.
 */
class ExperienceManager {
  /**
   * Evaluates question and context to determine the optimal experience type
   */
  async selectExperience(context: ExperienceContext): Promise<ExperienceSelection> {
    const { question } = context;
    
    // If classification not provided, get it
    const classification = context.classification || 
      await classifyMedicalQuestion(question);
      
    // If wait time not provided, estimate it
    const waitTimeMs = context.estimatedWaitTimeMs || 
      await contentTimingService.estimateWaitTime(question, classification);
    
    // Get question complexity
    const complexity = await getQuestionComplexity(question, classification);
    
    // Determine device capabilities if not provided
    const deviceCapabilities = context.deviceCapabilities || this.detectDeviceCapabilities();
    
    // Generate experience options based on classification and context
    const options = this.generateExperienceOptions({
      ...context,
      classification,
      estimatedWaitTimeMs: waitTimeMs,
      deviceCapabilities,
    });
    
    // Score and select the best experience
    const selection = this.scoreAndSelectExperience(options, {
      ...context,
      classification,
      estimatedWaitTimeMs: waitTimeMs,
      deviceCapabilities, 
    });
    
    return selection;
  }

  /**
   * Generate possible experience configurations based on context
   */
  private generateExperienceOptions(context: ExperienceContext): ExperienceConfig[] {
    const { classification, estimatedWaitTimeMs, deviceCapabilities } = context;
    const options: ExperienceConfig[] = [];
    
    // Microsimulation option - best for treatment questions with longer wait times
    if (classification?.categories.some(c => c.includes('treatment') || c.includes('medication'))) {
      options.push({
        type: AdExperienceType.MICROSIMULATION,
        priority: 8,
        minWaitTimeMs: 3000, // Only show for longer waits
        settings: {
          interactive: true,
          showDecisionTree: true,
        }
      });
    }
    
    // Knowledge graph option - best for mechanism/relationship questions
    if (classification?.categories.some(c => 
      c.includes('mechanism') || 
      c.includes('pathophysiology') || 
      c.includes('relationship'))) {
      options.push({
        type: AdExperienceType.KNOWLEDGE_GRAPH,
        priority: 9,
        minWaitTimeMs: 2000,
        settings: {
          interactive: deviceCapabilities?.isHighPerformance ?? true,
          focusOnRelationships: true,
        }
      });
    }
    
    // Evidence card option - best for diagnostic questions or short waits
    if (classification?.categories.some(c => 
      c.includes('diagnosis') || 
      c.includes('symptoms') || 
      c.includes('evidence'))) {
      options.push({
        type: AdExperienceType.EVIDENCE_CARD,
        priority: 7,
        maxWaitTimeMs: 5000, // Better for shorter wait times
        settings: {
          compact: estimatedWaitTimeMs ? estimatedWaitTimeMs < 3000 : false,
          focusOnEvidence: true,
        }
      });
    }
    
    // Standard ad option - fallback for everything
    options.push({
      type: AdExperienceType.STANDARD,
      priority: 5,
      settings: {
        adType: AdType.SPONSORED_CONTENT,
      }
    });
    
    return options;
  }

  /**
   * Score each experience option and select the best one
   */
  private scoreAndSelectExperience(
    options: ExperienceConfig[], 
    context: ExperienceContext
  ): ExperienceSelection {
    const { estimatedWaitTimeMs, deviceCapabilities } = context;
    let highestScore = -1;
    let bestOption: ExperienceConfig | null = null;
    let fallbackOption: ExperienceConfig | null = null;
    const reasoning: string[] = [];
    
    // Score each option
    for (const option of options) {
      let score = option.priority;
      
      // Adjust score based on wait time constraints
      if (estimatedWaitTimeMs !== undefined) {
        if (option.minWaitTimeMs && estimatedWaitTimeMs < option.minWaitTimeMs) {
          score -= 3;
          reasoning.push(`${option.type} downgraded: wait time ${estimatedWaitTimeMs}ms below minimum ${option.minWaitTimeMs}ms`);
        }
        
        if (option.maxWaitTimeMs && estimatedWaitTimeMs > option.maxWaitTimeMs) {
          score -= 2;
          reasoning.push(`${option.type} downgraded: wait time ${estimatedWaitTimeMs}ms above maximum ${option.maxWaitTimeMs}ms`);
        }
      }
      
      // Adjust score based on device capabilities
      if (deviceCapabilities) {
        if (!deviceCapabilities.isHighPerformance) {
          if (option.type === AdExperienceType.MICROSIMULATION || 
              option.type === AdExperienceType.KNOWLEDGE_GRAPH) {
            score -= 2;
            reasoning.push(`${option.type} downgraded: device performance not optimal`);
          }
        }
        
        if (deviceCapabilities.isMobile && option.type === AdExperienceType.KNOWLEDGE_GRAPH) {
          score -= 1;
          reasoning.push(`${option.type} slightly downgraded: mobile device has smaller screen`);
        }
      }
      
      // Keep track of best and fallback options
      if (score > highestScore) {
        if (bestOption) {
          fallbackOption = bestOption;
        }
        highestScore = score;
        bestOption = option;
        reasoning.push(`${option.type} selected as best option with score ${score}`);
      } else if (!fallbackOption || score > fallbackOption.priority) {
        fallbackOption = option;
        reasoning.push(`${option.type} selected as fallback option with score ${score}`);
      }
    }
    
    // Default to standard if nothing else works
    if (!bestOption) {
      bestOption = {
        type: AdExperienceType.STANDARD,
        priority: 5,
        settings: {
          adType: AdType.SPONSORED_CONTENT,
        }
      };
      reasoning.push('Defaulted to standard ad experience as no options were viable');
    }
    
    return {
      selectedType: bestOption.type,
      fallbackType: fallbackOption?.type,
      config: bestOption,
      reasoning,
    };
  }
  
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
   * Handle transitions between different experience types if needed
   */
  async transitionToExperience(
    currentType: AdExperienceType, 
    newType: AdExperienceType,
    context: ExperienceContext
  ): Promise<ExperienceConfig> {
    // If types are the same, no transition needed
    if (currentType === newType) {
      const options = this.generateExperienceOptions(context);
      const matchingOption = options.find(opt => opt.type === newType);
      return matchingOption || options[options.length - 1]; // Fallback to last option
    }
    
    // Get default config for the new type
    const options = this.generateExperienceOptions(context);
    const newConfig = options.find(opt => opt.type === newType);
    
    if (!newConfig) {
      // Default configuration if specific type not found
      return {
        type: newType,
        priority: 5,
        settings: {}
      };
    }
    
    // Add transition settings
    return {
      ...newConfig,
      settings: {
        ...newConfig.settings,
        isTransitioning: true,
        previousType: currentType,
      }
    };
  }
}

// Export singleton instance
const experienceManager = new ExperienceManager();
export default experienceManager; 