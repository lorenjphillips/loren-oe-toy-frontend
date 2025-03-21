/**
 * Clinical Decision Support Service
 * 
 * Provides contextual clinical information to enhance ad experiences
 * with relevant, factual medical information.
 */

import { MedicalClassification } from '../classification';
import { EnhancedMappingResult } from '../confidenceScoring';

interface ClinicalInfoSource {
  title: string;
  url: string;
  publisher: string;
  publishDate?: string;
  trustScore: number; // 0-100
}

export interface ClinicalSupportInfo {
  summary: string;
  keyPoints: string[];
  sources: ClinicalInfoSource[];
  relatedTerms: string[];
  evidenceLevel: 'high' | 'moderate' | 'low' | 'insufficient';
  lastUpdated: string;
}

/**
 * Retrieve clinical decision support information based on user question and ad context
 */
export async function getClinicalDecisionSupport(
  question: string,
  classification: MedicalClassification,
  mappingResult: EnhancedMappingResult
): Promise<ClinicalSupportInfo | null> {
  // In a real implementation, this would call an API or database
  // For this example, we'll create simulated data based on the inputs
  
  if (!mappingResult.topMatch) {
    return null;
  }
  
  // Extract key medical terms
  const medicalTerms = extractMedicalTerms(question, classification);
  
  // Generate clinical info based on the treatment area and medical terms
  const treatmentArea = mappingResult.topMatch.treatmentArea?.toString() || 'general health';
  const company = mappingResult.topMatch.company?.toString() || 'healthcare';
  
  return generateClinicalInfo(
    treatmentArea,
    company,
    medicalTerms
  );
}

/**
 * Extract medical terms from the question and classification
 */
function extractMedicalTerms(
  question: string,
  classification: MedicalClassification
): string[] {
  // In a real implementation, this would use NLP processing
  // For this example, we'll extract key terms based on simple rules
  
  const terms: string[] = [];
  
  // Extract terms from the question
  const words = question.toLowerCase().split(/\s+/);
  const medicalPrefixes = ['diag', 'treat', 'symptom', 'disease', 'condition', 'drug', 'med'];
  
  words.forEach(word => {
    if (word.length > 4 && medicalPrefixes.some(prefix => word.startsWith(prefix))) {
      terms.push(word);
    }
  });
  
  // Add terms from classification (safely handle possible missing properties)
  if (classification && (classification as any).primaryTopic) {
    terms.push((classification as any).primaryTopic);
  }
  
  // Deduplicate - using Array.from to avoid Set iteration issues
  return Array.from(new Set(terms));
}

/**
 * Generate clinical information based on treatment area and company
 */
function generateClinicalInfo(
  treatmentArea: string,
  company: string,
  medicalTerms: string[]
): ClinicalSupportInfo {
  // Current date for "last updated"
  const today = new Date().toISOString().split('T')[0];
  
  // Base clinical info structure
  const clinicalInfo: ClinicalSupportInfo = {
    summary: `Clinical information related to ${treatmentArea} treatments and therapies.`,
    keyPoints: [
      `${treatmentArea} affects approximately 10-15% of the population annually.`,
      `Regular screening and early intervention are recommended by clinical guidelines.`,
      `Treatment options should be discussed with healthcare providers.`
    ],
    sources: [
      {
        title: 'Clinical Practice Guidelines',
        url: 'https://guidelines.health.org/treatment-guidelines',
        publisher: 'National Health Organization',
        publishDate: today,
        trustScore: 95
      },
      {
        title: `Latest Research in ${treatmentArea}`,
        url: 'https://medical-journal.org/research',
        publisher: 'Medical Research Journal',
        publishDate: today,
        trustScore: 90
      }
    ],
    relatedTerms: [...medicalTerms, treatmentArea.toLowerCase()],
    evidenceLevel: 'moderate',
    lastUpdated: today
  };
  
  return clinicalInfo;
} 