import { AdContent } from '../models/adTypes';
import { MedicalClassification } from './classification';
import { EnhancedMappingResult } from './confidenceScoring';

/**
 * Template type enum - represents available ad template types
 */
export enum AdTemplateType {
  PFIZER = 'pfizer',
  GENENTECH = 'genentech',
  GSK = 'gsk',
  ELI_LILLY = 'eli_lilly',
  DEFAULT = 'default'
}

/**
 * Template selection result
 */
export interface TemplateSelectionResult {
  templateType: AdTemplateType;
  companyId: string;
  treatmentCategoryId: string;
  confidence: number;
  specialized: boolean;
  categorySpecific: boolean;
  questionContext?: MedicalClassification;
}

/**
 * Template selector options
 */
export interface TemplateSelectorOptions {
  preferCategorySpecificTemplates?: boolean;
  defaultTemplate?: AdTemplateType;
  confidenceThreshold?: number;
}

/**
 * Default template selector options
 */
const DEFAULT_SELECTOR_OPTIONS: TemplateSelectorOptions = {
  preferCategorySpecificTemplates: true,
  defaultTemplate: AdTemplateType.DEFAULT,
  confidenceThreshold: 30
};

/**
 * Selects the appropriate ad template based on ad content and context
 * 
 * @param adContent The ad content to display
 * @param mappingResult The enhanced mapping result from the ad mapping process
 * @param options Template selector options
 * @returns Template selection result
 */
export function selectAdTemplate(
  adContent: AdContent,
  mappingResult?: EnhancedMappingResult,
  options: TemplateSelectorOptions = {}
): TemplateSelectionResult {
  // Merge provided options with defaults
  const mergedOptions = { ...DEFAULT_SELECTOR_OPTIONS, ...options };
  
  // Get basic info
  const { company, treatmentCategory } = adContent;
  const companyId = company.id.toLowerCase();
  const treatmentCategoryId = treatmentCategory.id.toLowerCase();
  
  // Default response with lowest confidence
  let result: TemplateSelectionResult = {
    templateType: mergedOptions.defaultTemplate!,
    companyId,
    treatmentCategoryId,
    confidence: 0,
    specialized: false,
    categorySpecific: false
  };
  
  // Map company ID to template type
  const getTemplateTypeForCompany = (id: string): AdTemplateType => {
    switch (id) {
      case 'pfizer':
        return AdTemplateType.PFIZER;
      case 'genentech':
        return AdTemplateType.GENENTECH;
      case 'gsk':
        return AdTemplateType.GSK;
      case 'lilly':
        return AdTemplateType.ELI_LILLY;
      default:
        return mergedOptions.defaultTemplate!;
    }
  };
  
  // First, check if we have a template for this company
  const companyTemplate = getTemplateTypeForCompany(companyId);
  if (companyTemplate !== mergedOptions.defaultTemplate) {
    result.templateType = companyTemplate;
    result.specialized = true;
    result.confidence = 90; // High confidence for company match
  }
  
  // Add mapping result context if available
  if (mappingResult) {
    result.questionContext = mappingResult.classificationInput;
    
    // Check if this ad is actually the best match for the question
    if (mappingResult.topMatch && mappingResult.topMatch.company.id === companyId) {
      result.confidence = Math.max(result.confidence, mappingResult.overallConfidence);
      
      // If the treatment category matches one in the mapping result, increase confidence
      // and mark as category-specific
      if (mappingResult.topMatch.treatmentArea.id === treatmentCategoryId) {
        result.confidence = Math.min(100, result.confidence + 10);
        result.categorySpecific = true;
      }
    }
  }
  
  return result;
}

/**
 * Determines if an ad template is appropriate for a given medical question
 * based on mapping results and confidence thresholds
 * 
 * @param adContent The ad content to evaluate
 * @param mappingResult The enhanced mapping result
 * @param options Template selector options
 * @returns Whether the template is appropriate
 */
export function isTemplateAppropriate(
  adContent: AdContent,
  mappingResult: EnhancedMappingResult,
  options: TemplateSelectorOptions = {}
): boolean {
  const mergedOptions = { ...DEFAULT_SELECTOR_OPTIONS, ...options };
  const selectionResult = selectAdTemplate(adContent, mappingResult, options);
  
  // Check if confidence exceeds threshold
  return selectionResult.confidence >= mergedOptions.confidenceThreshold!;
}

/**
 * Gets specialized template settings based on the treatment category
 * for more targeted display
 * 
 * @param templateType The selected template type
 * @param treatmentCategoryId The treatment category ID
 * @returns Specialized template settings
 */
export function getSpecializedTemplateSettings(
  templateType: AdTemplateType,
  treatmentCategoryId: string
): Record<string, any> {
  const settings: Record<string, any> = {};
  
  // Check for specialized settings based on template type and treatment category
  switch (templateType) {
    case AdTemplateType.PFIZER:
      // Show evidence box for specific categories
      settings.showEvidenceBox = true;
      
      if (treatmentCategoryId.includes('oncology')) {
        settings.evidenceText = 'Clinical trials demonstrated significant progression-free survival benefit in patients with advanced cancer compared to standard of care.';
      } else if (treatmentCategoryId.includes('immunology')) {
        settings.evidenceText = 'Studies showed significant improvement in joint pain and mobility measures for rheumatoid arthritis patients.';
      } else if (treatmentCategoryId.includes('vaccines')) {
        settings.evidenceText = 'Vaccination demonstrated robust immune response with antibody titers significantly above the protective threshold.';
      }
      break;
      
    case AdTemplateType.GENENTECH:
      // Show statistics for specific categories
      settings.showStats = true;
      
      // Custom stats could be added here for specific treatment categories
      break;
      
    case AdTemplateType.GSK:
      // Show evidence panel for specific categories
      settings.showEvidencePanel = true;
      
      if (treatmentCategoryId.includes('respiratory')) {
        settings.evidencePoints = [
          'Improved FEV1 by 27% from baseline after 12 weeks of treatment',
          'Reduced exacerbation rate by 67% compared to placebo',
          'Significant quality of life improvements across multiple measures'
        ];
      }
      break;
      
    case AdTemplateType.ELI_LILLY:
      // Show data metrics for specific categories
      settings.showDataMetrics = true;
      
      // Custom metrics could be added here for specific treatment categories
      break;
  }
  
  return settings;
}

/**
 * Helper function to get template type from company ID
 * 
 * @param companyId Company identifier
 * @returns The appropriate template type
 */
export function getTemplateTypeForCompany(companyId: string): AdTemplateType {
  const id = companyId.toLowerCase();
  
  switch (id) {
    case 'pfizer':
      return AdTemplateType.PFIZER;
    case 'genentech':
      return AdTemplateType.GENENTECH;
    case 'gsk':
      return AdTemplateType.GSK;
    case 'lilly':
      return AdTemplateType.ELI_LILLY;
    default:
      return AdTemplateType.DEFAULT;
  }
} 