/**
 * Types of information gaps encountered by physicians
 */
export enum GapType {
  CONCEPTUAL = 'conceptual',            // Gaps in understanding clinical concepts
  TEMPORAL = 'temporal',                // Gaps related to outdated information
  CONFLICTING = 'conflicting',          // Conflicting or inconsistent information
  RARE_CASE = 'rare_case',              // Information on rare or unusual cases
  EVIDENCE_BASED = 'evidence_based',    // Gaps in evidence or study data
  SPECIALIZED = 'specialized',          // Need for highly specialized information
  PRACTICAL = 'practical',              // Practical application challenges
  PATIENT_SPECIFIC = 'patient_specific', // Translating general info to specific patients
  GENERAL = 'general'                   // General information gaps
}

/**
 * Model for information gap analysis
 */
export interface InformationGap {
  primaryType: GapType;                      // Primary gap type
  secondaryTypes: GapType[];                 // Secondary or related gap types
  confidence: number;                        // Confidence score of gap classification (0-1)
  topicArea: string;                         // Medical topic area of the gap
  severity: 'critical' | 'moderate' | 'minor'; // Severity of the information gap
} 