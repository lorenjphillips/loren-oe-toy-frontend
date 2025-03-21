/**
 * Types of clinical intent in physician questions
 */
export enum IntentType {
  EFFICACY_INFO = 'efficacy_information',      // Information about drug/treatment efficacy
  SAFETY_INFO = 'safety_information',          // Information about safety/adverse effects
  MECHANISM_INFO = 'mechanism_information',    // How a drug/treatment works
  ALTERNATIVES_INFO = 'alternatives_information', // Information about treatment alternatives  
  COST_INFO = 'cost_information',              // Cost or insurance coverage information
  GUIDELINE_INFO = 'guideline_information',    // Clinical guideline information
  GENERAL_INFO = 'general_information',        // General medical information
  CLARIFICATION = 'clarification',             // Seeking clarification on previous information
  PATIENT_SPECIFIC = 'patient_specific',       // Patient-specific application of information
  EDUCATION = 'education'                      // Educational material for patients
}

/**
 * Model for clinical intent analysis
 */
export interface ClinicalIntent {
  primaryType: IntentType;          // Primary intent of the question
  secondaryTypes: IntentType[];     // Secondary or additional intents
  confidence: number;               // Confidence score of intent classification (0-1)
  questionText: string;             // Original question text (anonymized if needed)
} 