/**
 * Types of clinical decisions made by physicians
 */
export enum DecisionType {
  TREATMENT_SELECTION = 'treatment_selection',   // Selecting appropriate treatment
  DOSING = 'dosing',                             // Determining appropriate dose or regimen
  DIAGNOSTIC = 'diagnostic',                     // Diagnostic approach or test selection
  MONITORING = 'monitoring',                     // Monitoring treatment response
  REFERRAL = 'referral',                         // Determining when to refer to a specialist
  RISK_ASSESSMENT = 'risk_assessment',           // Assessing risks and benefits
  PREVENTIVE = 'preventive',                     // Preventive care decisions
  DISCONTINUATION = 'discontinuation',           // Stopping or changing treatment
  OTHER = 'other'                                // Other decision types
}

/**
 * Model for clinical decision point analysis
 */
export interface DecisionPoint {
  primaryType: DecisionType;          // Primary decision type
  secondaryTypes: DecisionType[];     // Secondary or related decision types
  confidence: number;                 // Confidence score of decision classification (0-1)
  context: string;                    // Relevant clinical context
  urgency: 'high' | 'medium' | 'low'; // Decision urgency level
} 