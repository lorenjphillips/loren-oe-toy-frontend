/**
 * Stages in clinical patient management workflow
 */
export enum WorkflowStage {
  PREVENTION = 'prevention',           // Preventive care and screening
  DIAGNOSIS = 'diagnosis',             // Diagnostic work-up
  TREATMENT = 'treatment',             // Treatment planning and initiation
  MONITORING = 'monitoring',           // Monitoring response to treatment
  MODIFICATION = 'modification',       // Treatment modification or adjustment
  RELAPSE = 'relapse',                 // Managing relapse or recurrence
  PALLIATIVE = 'palliative',           // Palliative care
  EDUCATION = 'education',             // Patient education
  FOLLOWUP = 'followup',               // Follow-up care
  UNSPECIFIED = 'unspecified'          // Unspecified workflow stage
}

/**
 * Model for mapping questions to clinical workflow
 */
export interface ClinicalWorkflow {
  primaryStage: WorkflowStage;         // Primary workflow stage
  secondaryStages: WorkflowStage[];    // Secondary or related workflow stages
  confidence: number;                  // Confidence score of workflow classification (0-1)
  patientContext: string;              // Relevant patient context (age group, demographics)
} 