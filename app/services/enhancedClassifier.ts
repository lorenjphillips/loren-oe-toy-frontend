import OpenAI from 'openai';
import { MedicalClassification } from './classification';
import { ContentFormat } from './contextualRelevance';

/**
 * Clinical entity types
 */
export enum ClinicalEntityType {
  CONDITION = 'condition',
  MEDICATION = 'medication',
  PROCEDURE = 'procedure',
  SYMPTOM = 'symptom',
  LAB_TEST = 'lab_test',
  IMAGING = 'imaging',
  ANATOMICAL_SITE = 'anatomical_site',
  DEVICE = 'device',
  BIOMARKER = 'biomarker'
}

/**
 * Clinical setting types
 */
export enum ClinicalSetting {
  EMERGENCY = 'emergency',
  INPATIENT = 'inpatient',
  OUTPATIENT = 'outpatient',
  PRIMARY_CARE = 'primary_care',
  SPECIALTY_CARE = 'specialty_care',
  ICU = 'icu',
  LONG_TERM_CARE = 'long_term_care',
  HOME_CARE = 'home_care',
  TELEHEALTH = 'telehealth'
}

/**
 * Treatment phase types
 */
export enum TreatmentPhase {
  PREVENTION = 'prevention',
  SCREENING = 'screening',
  DIAGNOSIS = 'diagnosis',
  INITIAL_TREATMENT = 'initial_treatment',
  MAINTENANCE = 'maintenance',
  RECURRENCE = 'recurrence',
  PALLIATIVE = 'palliative'
}

/**
 * Interface for a clinical entity extracted from text
 */
export interface ClinicalEntity {
  type: ClinicalEntityType;
  term: string;
  normalizedTerm?: string; // Standardized term (e.g., RxNorm, SNOMED CT)
  confidence: number; // 0-1 scale
  position?: {
    start: number;
    end: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Interface for patient demographic information
 */
export interface PatientDemographics {
  ageRange?: string;
  gender?: string;
  ethnicity?: string[];
  riskFactors?: string[];
  comorbidities?: string[];
  medicationHistory?: string[];
  familyHistory?: boolean;
}

/**
 * Interface for clinical context information
 */
export interface ClinicalContextInfo {
  setting: ClinicalSetting;
  treatmentPhase: TreatmentPhase;
  timeframe: string; // e.g., "acute", "chronic", "ongoing for 3 months"
  severity: number; // 1-5 scale
  previousInterventions?: string[];
  complicatingFactors?: string[];
}

/**
 * Interface for therapeutic indication mapping
 */
export interface TherapeuticIndication {
  condition: string;
  specificIndication: string;
  treatmentType: string;
  regulatoryStatus?: string;
  lineOfTherapy?: string;
  patientProfile?: string;
  confidence: number; // 0-1 scale
}

/**
 * Result of enhanced classification analysis
 */
export interface EnhancedClassificationResult {
  originalClassification: MedicalClassification;
  entities: ClinicalEntity[];
  patientDemographics?: PatientDemographics;
  clinicalContext?: ClinicalContextInfo;
  therapeuticIndications: TherapeuticIndication[];
  semanticTags: string[];
  confidenceScore: number; // 0-1 scale
  contentRecommendations: {
    format: ContentFormat;
    score: number; // 0-100 scale
  }[];
}

/**
 * Options for enhanced classification
 */
export interface EnhancedClassifierOptions {
  model?: string;
  temperature?: number;
  extractEntities?: boolean;
  analyzeDemographics?: boolean;
  determineContext?: boolean;
  mapIndications?: boolean;
  includeRawResponse?: boolean;
}

/**
 * Service for enhanced medical content classification
 */
export class EnhancedClassifier {
  private openai: OpenAI;
  private defaultOptions: EnhancedClassifierOptions;

  /**
   * Creates a new EnhancedClassifier
   */
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    
    this.defaultOptions = {
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: 0.1,
      extractEntities: true,
      analyzeDemographics: true,
      determineContext: true,
      mapIndications: true,
      includeRawResponse: false
    };
  }

  /**
   * Performs enhanced classification of a medical question
   * 
   * @param question The medical question to analyze
   * @param baseClassification Base classification from standard classifier
   * @param options Analysis options
   * @returns Enhanced classification result
   */
  async enhanceClassification(
    question: string,
    baseClassification: MedicalClassification,
    options: EnhancedClassifierOptions = {}
  ): Promise<EnhancedClassificationResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Build a feature-specific prompt based on enabled options
      let featurePrompts = "";
      
      if (mergedOptions.extractEntities) {
        featurePrompts += `
- Extract clinical entities including conditions, medications, procedures, symptoms, lab tests, imaging studies, anatomical sites, devices, and biomarkers
- For each entity, determine its type, normalized term (if possible), and confidence level`;
      }
      
      if (mergedOptions.analyzeDemographics) {
        featurePrompts += `
- Identify patient demographic information if present (age range, gender, ethnicity, risk factors, comorbidities)
- Note if family history is relevant to the question`;
      }
      
      if (mergedOptions.determineContext) {
        featurePrompts += `
- Recognize the clinical setting context (emergency, inpatient, outpatient, primary care, specialty)
- Determine the treatment phase (prevention, screening, diagnosis, initial treatment, maintenance)
- Assess severity and timeframe of the clinical situation`;
      }
      
      if (mergedOptions.mapIndications) {
        featurePrompts += `
- Map entities to specific treatment indications beyond general categories
- Identify specific conditions, indications, treatment types, and lines of therapy
- Determine regulatory status if relevant`;
      }
      
      // Construct the prompt for OpenAI
      const prompt = `
As an enhanced medical content classifier for a physician education platform, analyze the following medical question with particular focus on detailed clinical context.

QUESTION: "${question}"

BASE CLASSIFICATION:
Primary Category: ${baseClassification.primaryCategory.name} (${baseClassification.primaryCategory.id})
Subcategory: ${baseClassification.subcategory.name} (${baseClassification.subcategory.id})
Keywords: ${baseClassification.keywords.join(', ')}
${baseClassification.relevantMedications ? `Relevant Medications: ${baseClassification.relevantMedications.join(', ')}` : ''}

Provide a comprehensive enhanced classification in JSON format with the following structure:
{
  "entities": [
    {
      "type": "condition", // One of: condition, medication, procedure, symptom, lab_test, imaging, anatomical_site, device, biomarker
      "term": "type 2 diabetes",
      "normalizedTerm": "diabetes mellitus type 2", // If available
      "confidence": 0.95 // 0-1 scale
    }
  ],
  "patientDemographics": { // Optional, only if present in the question
    "ageRange": "65+",
    "gender": "female",
    "riskFactors": ["smoking history", "hypertension"],
    "comorbidities": ["osteoarthritis"],
    "medicationHistory": ["metformin", "insulin"]
  },
  "clinicalContext": { // Optional, only if context can be determined
    "setting": "outpatient", // One of: emergency, inpatient, outpatient, primary_care, specialty_care, icu, long_term_care, home_care, telehealth
    "treatmentPhase": "maintenance", // One of: prevention, screening, diagnosis, initial_treatment, maintenance, recurrence, palliative
    "timeframe": "chronic", 
    "severity": 3, // 1-5 scale
    "previousInterventions": ["diet modification", "oral medication"]
  },
  "therapeuticIndications": [
    {
      "condition": "type 2 diabetes",
      "specificIndication": "inadequate glycemic control on metformin monotherapy",
      "treatmentType": "GLP-1 receptor agonist",
      "regulatoryStatus": "FDA approved",
      "lineOfTherapy": "second-line",
      "patientProfile": "adult with obesity and cardiovascular risk factors",
      "confidence": 0.85
    }
  ],
  "semanticTags": ["glycemic control", "oral antidiabetic agents", "treatment intensification"],
  "confidenceScore": 0.92,
  "contentRecommendations": [
    {
      "format": "decision_tree", 
      "score": 85
    },
    {
      "format": "microsimulation",
      "score": 75
    }
  ]
}

Instructions:
${featurePrompts}
- Assign semantic tags that go beyond simple keywords to capture the conceptual focus
- Calculate an overall confidence score for this enhanced classification
- Recommend the most appropriate content formats with relevance scores

Your response must be valid JSON with all required fields based on the structure above.
`;

      // Call OpenAI API
      const chatCompletion = await this.openai.chat.completions.create({
        model: mergedOptions.model!,
        temperature: mergedOptions.temperature!,
        messages: [
          { role: 'system', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      // Extract the content from the response
      const content = chatCompletion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Parse the JSON response
      const responseData = JSON.parse(content);
      
      // Return the result with original classification included
      return {
        originalClassification: baseClassification,
        entities: responseData.entities || [],
        patientDemographics: responseData.patientDemographics,
        clinicalContext: responseData.clinicalContext,
        therapeuticIndications: responseData.therapeuticIndications || [],
        semanticTags: responseData.semanticTags || [],
        confidenceScore: responseData.confidenceScore || 0,
        contentRecommendations: responseData.contentRecommendations || []
      };
    } catch (error) {
      console.error('[EnhancedClassifier] Error analyzing question:', error);
      throw error;
    }
  }

  /**
   * Extract clinical entities from text
   * 
   * @param text Medical text to analyze
   * @returns Array of extracted clinical entities
   */
  async extractClinicalEntities(text: string): Promise<ClinicalEntity[]> {
    try {
      const prompt = `
Extract all clinical entities from the following medical text. Focus on conditions, medications, procedures, symptoms, lab tests, imaging studies, anatomical sites, devices, and biomarkers.

TEXT: "${text}"

For each entity, provide:
1. The entity type (condition, medication, procedure, etc.)
2. The term as it appears in the text
3. A normalized term if possible (standard medical terminology)
4. Confidence score (0-1)

Return results as a JSON array of entities.
`;

      const chatCompletion = await this.openai.chat.completions.create({
        model: this.defaultOptions.model!,
        temperature: 0.1,
        messages: [
          { role: 'system', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const content = chatCompletion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      const responseData = JSON.parse(content);
      return responseData.entities || [];
    } catch (error) {
      console.error('[EnhancedClassifier] Error extracting clinical entities:', error);
      return [];
    }
  }

  /**
   * Map conditions to specific therapeutic indications
   * 
   * @param conditions Array of condition entities
   * @param medications Optional array of medications mentioned
   * @returns Therapeutic indications with high specificity
   */
  async mapToTherapeuticIndications(
    conditions: ClinicalEntity[],
    medications?: ClinicalEntity[]
  ): Promise<TherapeuticIndication[]> {
    if (conditions.length === 0) {
      return [];
    }

    try {
      // Format conditions and medications for the prompt
      const conditionsList = conditions
        .map(c => c.normalizedTerm || c.term)
        .join(', ');
      
      const medicationsList = medications && medications.length > 0
        ? medications.map(m => m.normalizedTerm || m.term).join(', ')
        : '';

      const prompt = `
Map the following medical conditions to specific therapeutic indications. Each indication should be highly specific and clinically precise.

CONDITIONS: ${conditionsList}
${medicationsList ? `MEDICATIONS: ${medicationsList}` : ''}

For each condition, determine:
1. The most specific indication based on standard treatment guidelines
2. The appropriate treatment type or class
3. Line of therapy (first-line, second-line, etc.)
4. Patient profile for which this would be indicated
5. Confidence in this mapping (0-1)

Return results as a JSON array of therapeutic indications.
`;

      const chatCompletion = await this.openai.chat.completions.create({
        model: this.defaultOptions.model!,
        temperature: 0.1,
        messages: [
          { role: 'system', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      const content = chatCompletion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      const responseData = JSON.parse(content);
      return responseData.indications || [];
    } catch (error) {
      console.error('[EnhancedClassifier] Error mapping to therapeutic indications:', error);
      return [];
    }
  }
}

/**
 * Convenience function to perform enhanced classification
 * 
 * @param question The medical question to classify
 * @param baseClassification Base classification from standard classifier
 * @param options Classification options
 * @returns Enhanced classification result
 */
export async function enhanceClassification(
  question: string,
  baseClassification: MedicalClassification,
  options: EnhancedClassifierOptions = {}
): Promise<EnhancedClassificationResult> {
  const classifier = new EnhancedClassifier();
  return classifier.enhanceClassification(question, baseClassification, options);
} 