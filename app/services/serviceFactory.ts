import { MedicalQuestionClassifier } from './classification';
import { ConfidenceScorer } from './confidenceScoring';
import { ContextualRelevanceAnalyzer } from './contextualRelevance';
import { timeEstimator } from './timeEstimation';
import { env } from '../lib/env';

/**
 * Interface for cached service instances
 */
interface ServiceCache {
  classifierService?: MedicalQuestionClassifier;
  confidenceScorer?: ConfidenceScorer;
  contextualRelevanceAnalyzer?: ContextualRelevanceAnalyzer;
  timeEstimator?: typeof timeEstimator;
}

/**
 * Global cache for services to prevent repeated initialization in serverless environment
 */
let serviceCache: ServiceCache = {};

/**
 * Options for the service factory
 */
export interface ServiceFactoryOptions {
  forceRefresh?: boolean;
  useCache?: boolean;
}

/**
 * Default options for the service factory
 */
const DEFAULT_OPTIONS: ServiceFactoryOptions = {
  forceRefresh: false,
  useCache: true,
};

/**
 * Factory class for centralized service access
 */
export class ServiceFactory {
  /**
   * Get the medical question classifier service
   */
  static getClassifierService(options: ServiceFactoryOptions = {}): MedicalQuestionClassifier {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    if (mergedOptions.useCache && serviceCache.classifierService && !mergedOptions.forceRefresh) {
      return serviceCache.classifierService;
    }

    const service = new MedicalQuestionClassifier();
    
    if (mergedOptions.useCache) {
      serviceCache.classifierService = service;
    }
    
    return service;
  }

  /**
   * Get the confidence scorer service
   */
  static getConfidenceScorer(options: ServiceFactoryOptions = {}): ConfidenceScorer {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    if (mergedOptions.useCache && serviceCache.confidenceScorer && !mergedOptions.forceRefresh) {
      return serviceCache.confidenceScorer;
    }

    const service = new ConfidenceScorer();
    
    if (mergedOptions.useCache) {
      serviceCache.confidenceScorer = service;
    }
    
    return service;
  }

  /**
   * Get the contextual relevance analyzer service
   */
  static getContextualRelevanceAnalyzer(options: ServiceFactoryOptions = {}): ContextualRelevanceAnalyzer {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    if (mergedOptions.useCache && serviceCache.contextualRelevanceAnalyzer && !mergedOptions.forceRefresh) {
      return serviceCache.contextualRelevanceAnalyzer;
    }

    const service = new ContextualRelevanceAnalyzer();
    
    if (mergedOptions.useCache) {
      serviceCache.contextualRelevanceAnalyzer = service;
    }
    
    return service;
  }

  /**
   * Get the time estimator service
   */
  static getTimeEstimator(options: ServiceFactoryOptions = {}): typeof timeEstimator {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    if (mergedOptions.useCache && serviceCache.timeEstimator && !mergedOptions.forceRefresh) {
      return serviceCache.timeEstimator;
    }

    if (mergedOptions.useCache) {
      serviceCache.timeEstimator = timeEstimator;
    }
    
    return timeEstimator;
  }

  /**
   * Clear all cached services
   */
  static clearCache(): void {
    serviceCache = {};
  }

  /**
   * Initialize all services
   * Useful for warm starts in serverless environments
   */
  static initializeAllServices(options: ServiceFactoryOptions = {}): void {
    this.getClassifierService(options);
    this.getConfidenceScorer(options);
    this.getContextualRelevanceAnalyzer(options);
    this.getTimeEstimator(options);
  }

  /**
   * Shutdown all services gracefully
   * Useful for cleanup when the server is shutting down
   */
  static shutdownAllServices(): void {
    // Add any cleanup needed for each service
    
    // Clear the cache
    this.clearCache();
  }
}

// Singleton instance for easier access without static methods
export const serviceFactory = new class {
  getClassifierService(options?: ServiceFactoryOptions) {
    return ServiceFactory.getClassifierService(options);
  }
  
  getConfidenceScorer(options?: ServiceFactoryOptions) {
    return ServiceFactory.getConfidenceScorer(options);
  }
  
  getContextualRelevanceAnalyzer(options?: ServiceFactoryOptions) {
    return ServiceFactory.getContextualRelevanceAnalyzer(options);
  }
  
  getTimeEstimator(options?: ServiceFactoryOptions) {
    return ServiceFactory.getTimeEstimator(options);
  }
  
  clearCache() {
    ServiceFactory.clearCache();
  }
  
  initializeAllServices(options?: ServiceFactoryOptions) {
    ServiceFactory.initializeAllServices(options);
  }
  
  shutdownAllServices() {
    ServiceFactory.shutdownAllServices();
  }
}();

export default serviceFactory; 