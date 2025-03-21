/**
 * Ethical AI Services
 * 
 * Export all ethical AI services for easy imports.
 */

// Export all services from guardrails
export {
  validateClinicalAccuracy,
  getTransparencyInfo,
  getSeparationIndicatorType,
  validateCompliance,
  applyGuardrails,
  processFeedback
} from './guardrails';

// Export all configuration functions
export {
  getConfig,
  setConfig,
  resetConfig,
  getConfidenceThreshold,
  meetsConfidenceThreshold
} from './configuration';

// Export all integration functions
export {
  getAdContentWithGuardrails,
  getAdContentFromMappingWithGuardrails,
  getAdContentForTreatmentCategoryWithGuardrails,
  getAdContentForCompanyWithGuardrails,
  getAdContentWithFallbackAndGuardrails,
  filterCompliantContent,
  meetsGuardrailConfidenceThreshold,
  getGuardrailConfidenceThreshold
} from './integration'; 