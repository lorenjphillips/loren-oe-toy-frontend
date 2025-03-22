import { MedicalClassification } from './classification';
import { 
  PHARMA_COMPANIES, 
  PharmaCompany, 
  MedicalCategory, 
  MEDICAL_CATEGORY_MAP 
} from '../data/pharmaCategories';

// Define PharmaTreatmentArea interface since it's missing
export interface PharmaTreatmentArea {
  id: string;
  category: string;
  priority: number;
  subcategories: string[];
  flagship_medications: string[];
  keywords: string[]; // Add missing keywords property
}

/**
 * Interface for a matched company result
 */
export interface CompanyMatch {
  company: PharmaCompany;
  treatmentArea: PharmaTreatmentArea;
  score: number;          // Match score (higher = better match)
  categoryMatch: boolean; // Whether the primary category matched
  subcategoryMatch: boolean; // Whether a specific subcategory matched
  keywordMatches: string[]; // Which keywords matched
  medicationMatches: string[]; // Which medications matched
}

/**
 * Result of pharma mapping operation
 */
export interface PharmaMappingResult {
  matches: CompanyMatch[];    // All matches, sorted by score
  topMatch?: CompanyMatch;    // Best match (if any)
  classificationInput: MedicalClassification; // Original classification input
  totalMatches: number;
  primaryCategory: string;
  subcategory: string;
  keywordsUsed: string[];
  medicationsUsed: string[];
  timestamp: Date;
}

/**
 * Configuration options for ad mapping
 */
export interface AdMappingOptions {
  minScore?: number;          // Minimum score to consider a valid match (0-100)
  maxResults?: number;        // Maximum number of results to return
  requireSubcategoryMatch?: boolean; // Require specific subcategory match
  includeAllCompanies?: boolean; // Include all companies with at least some relevance
}

/**
 * Default mapping options
 */
const DEFAULT_MAPPING_OPTIONS: AdMappingOptions = {
  minScore: 30,
  maxResults: 5,
  requireSubcategoryMatch: false,
  includeAllCompanies: false
};

/**
 * Class to map medical classifications to pharmaceutical companies
 */
export class PharmaAdMapper {
  /**
   * Map a medical classification to relevant pharmaceutical companies
   * 
   * @param classification Medical classification from the classifier
   * @param options Mapping options
   * @returns Prioritized list of matching companies with relevance scores
   */
  public mapToCompanies(
    classification: MedicalClassification, 
    options: AdMappingOptions = {}
  ): PharmaMappingResult {
    // Merge options with defaults
    const mergedOptions = { ...DEFAULT_MAPPING_OPTIONS, ...options };
    
    // Extract key fields from classification
    const { 
      primaryCategory, 
      subcategory, 
      keywords = [],
      relevantMedications = []
    } = classification;
    
    const matches: CompanyMatch[] = [];
    
    // Step 1: Find all potential matches across all companies
    for (const company of PHARMA_COMPANIES) {
      // Check each treatment area for this company
      for (const treatmentArea of company.treatment_areas) {
        let score = 0;
        let categoryMatch = false;
        let subcategoryMatch = false;
        const keywordMatches: string[] = [];
        const medicationMatches: string[] = [];
        
        // Check for category match
        if (treatmentArea.category === primaryCategory.id) {
          score += 50; // Base score for category match
          categoryMatch = true;
          
          // Check for subcategory match
          if (treatmentArea.subcategories.includes(subcategory.id)) {
            score += 30; // Additional score for subcategory match
            subcategoryMatch = true;
          }
        } else {
          // No direct category match, check if there's any overlap in the taxonomy
          // This handles cases like "immunology" vs "rheumatology" which can overlap
          const categorySubcategories = MEDICAL_CATEGORY_MAP[treatmentArea.category] || [];
          if (categorySubcategories.includes(subcategory.id)) {
            score += 20; // Partial match through subcategory
            categoryMatch = true;
          }
        }
        
        // If we require subcategory match and didn't find one, skip this treatment area
        if (mergedOptions.requireSubcategoryMatch && !subcategoryMatch) {
          continue;
        }
        
        // Check keyword matches
        for (const keyword of keywords) {
          // Check if keyword matches treatment area keywords
          const lowercaseKeyword = keyword.toLowerCase();
          if (treatmentArea.keywords.some(k => k.toLowerCase().includes(lowercaseKeyword) || 
                                           lowercaseKeyword.includes(k.toLowerCase()))) {
            score += 5; // Add points per keyword match
            keywordMatches.push(keyword);
          }
          
          // Check company keywords too
          if (company.keywords.some(k => k.toLowerCase().includes(lowercaseKeyword) ||
                                       lowercaseKeyword.includes(k.toLowerCase()))) {
            score += 2; // Company keyword matches are worth less than treatment area matches
            keywordMatches.push(keyword);
          }
        }
        
        // Check medication matches
        for (const medication of relevantMedications) {
          const lowercaseMed = medication.toLowerCase();
          
          // Check if medication is in the company's flagship medications
          if (treatmentArea.flagship_medications.some(m => m.toLowerCase() === lowercaseMed || 
                                                      lowercaseMed.includes(m.toLowerCase()))) {
            score += 15; // Significant bonus for medication match
            medicationMatches.push(medication);
          }
        }
        
        // Apply treatment area priority as a score multiplier
        // Areas with higher priority for the company get a boost
        const priorityMultiplier = 1 + (treatmentArea.priority / 20); // e.g. priority 10 gives 1.5x multiplier
        score = Math.round(score * priorityMultiplier);
        
        // Only add matches that meet the minimum score requirement
        if (score >= mergedOptions.minScore!) {
          matches.push({
            company,
            treatmentArea,
            score,
            categoryMatch,
            subcategoryMatch,
            keywordMatches: Array.from(new Set(keywordMatches)), // Deduplicate
            medicationMatches: Array.from(new Set(medicationMatches)) // Deduplicate
          });
        }
      }
    }
    
    // Sort matches by score (highest first)
    matches.sort((a, b) => b.score - a.score);
    
    // Limit number of results if specified
    const limitedMatches = mergedOptions.maxResults 
      ? matches.slice(0, mergedOptions.maxResults) 
      : matches;
    
    // Create the result object
    const result: PharmaMappingResult = {
      matches: limitedMatches,
      topMatch: limitedMatches.length > 0 ? limitedMatches[0] : undefined,
      classificationInput: classification,
      totalMatches: matches.length,
      primaryCategory: primaryCategory.id,
      subcategory: subcategory.id,
      keywordsUsed: keywords,
      medicationsUsed: relevantMedications,
      timestamp: new Date()
    };
    
    return result;
  }
  
  /**
   * Get ad category IDs for targeting from a mapping result
   * This can be used to target ads in an ad server
   * 
   * @param mappingResult The result from mapToCompanies
   * @returns Array of targeting category IDs
   */
  public getTargetingCategories(mappingResult: PharmaMappingResult): string[] {
    if (!mappingResult.matches.length) {
      return []; // No matches
    }
    
    // Extract treatment area IDs from matches
    return mappingResult.matches.map(match => match.treatmentArea.id);
  }
  
  /**
   * Get company IDs for targeting from a mapping result
   * 
   * @param mappingResult The result from mapToCompanies
   * @returns Array of company IDs
   */
  public getTargetingCompanies(mappingResult: PharmaMappingResult): string[] {
    if (!mappingResult.matches.length) {
      return []; // No matches
    }
    
    // Extract unique company IDs from matches
    const companyIdSet = new Set<string>();
    mappingResult.matches.forEach(match => companyIdSet.add(match.company.id));
    return Array.from(companyIdSet);
  }
}

// Export a singleton instance for convenience
export const pharmaMapper = new PharmaAdMapper();

/**
 * Simple function to map a medical classification to pharma companies
 * 
 * @param classification Medical classification from the classifier
 * @param options Mapping options
 * @returns Mapping result with matched companies
 */
export function mapQuestionToCompanies(
  classification: MedicalClassification,
  options: AdMappingOptions = {}
): PharmaMappingResult {
  return pharmaMapper.mapToCompanies(classification, options);
}

/**
 * Simple example demonstrating the pharma mapping process
 */
export async function runMappingExample(): Promise<void> {
  // Create a simple test classification
  const testClassification: MedicalClassification = {
    primaryCategory: {
      id: "oncology",
      name: "Oncology",
      confidence: 0.95
    },
    subcategory: {
      id: "breast_cancer",
      name: "Breast Cancer",
      confidence: 0.92
    },
    keywords: ["breast cancer", "HER2+", "metastatic", "hormonal therapy"],
    relevantMedications: ["herceptin", "tamoxifen"]
  };
  
  console.log("Example Medical Classification:");
  console.log(`Primary Category: ${testClassification.primaryCategory.name}`);
  console.log(`Subcategory: ${testClassification.subcategory.name}`);
  console.log(`Keywords: ${testClassification.keywords.join(", ")}`);
  console.log(`Medications: ${testClassification.relevantMedications?.join(", ") || "None"}`);
  console.log("-----------------------------------");
  
  // Map to pharma companies
  const mappingResult = mapQuestionToCompanies(testClassification);
  
  const uniqueCompanies = new Set<string>();
  mappingResult.matches.forEach(m => uniqueCompanies.add(m.company.id));
  
  console.log(`Found ${mappingResult.totalMatches} matching treatment areas across ${uniqueCompanies.size} companies\n`);
  
  // Display matches
  mappingResult.matches.forEach((match, index) => {
    console.log(`Match #${index + 1}: ${match.company.name} - ${match.treatmentArea.id}`);
    console.log(`Score: ${match.score}`);
    console.log(`Category Match: ${match.categoryMatch ? "Yes" : "No"}`);
    console.log(`Subcategory Match: ${match.subcategoryMatch ? "Yes" : "No"}`);
    
    if (match.keywordMatches.length > 0) {
      console.log(`Keyword Matches: ${match.keywordMatches.join(", ")}`);
    }
    
    if (match.medicationMatches.length > 0) {
      console.log(`Medication Matches: ${match.medicationMatches.join(", ")}`);
    }
    
    console.log("-----------");
  });
  
  // Show targeting categories
  const targetingCategories = pharmaMapper.getTargetingCategories(mappingResult);
  console.log(`Ad Targeting Categories: ${targetingCategories.join(", ")}`);
  
  // Show targeting companies
  const targetingCompanies = pharmaMapper.getTargetingCompanies(mappingResult);
  console.log(`Ad Targeting Companies: ${targetingCompanies.join(", ")}`);
} 