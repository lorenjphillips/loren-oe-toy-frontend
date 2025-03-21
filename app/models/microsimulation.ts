/**
 * TypeScript interfaces for interactive clinical microsimulations
 */

import { TreatmentCategory, AdCompany } from './adTypes';

/**
 * Structure for a clinical scenario in a microsimulation
 */
export interface ClinicalScenario {
  id: string;                     // Unique identifier
  title: string;                  // Title of the scenario
  description: string;            // Initial scenario description
  patientInfo: PatientInfo;       // Patient information
  initialState: ScenarioState;    // Initial state of the scenario
  decisionPoints: DecisionPoint[]; // Available decision points in the scenario
  outcomes: ScenarioOutcome[];    // Possible outcomes of the scenario
  educationalContent: EducationalContent[]; // Educational content to display during/after simulation
  category: string;               // Medical category (e.g., "cardiology")
  treatmentFocus?: string;        // Treatment area focus (e.g., "hypertension")
  difficulty: 'basic' | 'intermediate' | 'advanced'; // Difficulty level
  estimatedDuration: number;      // Estimated duration in seconds
  createdBy?: string;             // Creator of the scenario
  createdAt: Date;                // Creation date
  updatedAt: Date;                // Last update date
  companyId?: string;             // Associated pharma company ID if sponsored
}

/**
 * Patient information for a clinical scenario
 */
export interface PatientInfo {
  age: number;                    // Patient age
  gender: 'male' | 'female' | 'other'; // Patient gender
  height?: number;                // Height in cm
  weight?: number;                // Weight in kg
  vitalSigns?: {                  // Vital signs
    bloodPressure?: string;       // Blood pressure reading
    heartRate?: number;           // Heart rate
    respiratoryRate?: number;     // Respiratory rate
    temperature?: number;         // Temperature
    oxygenSaturation?: number;    // O2 saturation
  };
  medicalHistory?: string[];      // Relevant medical history
  medications?: string[];         // Current medications
  allergies?: string[];           // Known allergies
  labResults?: LabResult[];       // Relevant lab results
  imagingResults?: ImagingResult[]; // Relevant imaging results
  chiefComplaint: string;         // Chief complaint
  historyOfPresentIllness?: string; // History of present illness
}

/**
 * Lab result structure
 */
export interface LabResult {
  name: string;                   // Test name
  value: string | number;         // Test value
  unit?: string;                  // Unit of measurement
  referenceRange?: string;        // Normal reference range
  isAbnormal?: boolean;           // Whether the result is abnormal
  interpretation?: string;        // Interpretation notes
  collectedAt?: Date;             // Collection date
}

/**
 * Imaging result structure
 */
export interface ImagingResult {
  type: string;                   // Type of imaging (e.g., "X-ray", "CT", "MRI")
  region: string;                 // Body region
  finding: string;                // Finding description
  impression?: string;            // Radiologist's impression
  imageUrl?: string;              // URL to the image if available
  performedAt?: Date;             // Date performed
}

/**
 * Current state of a scenario
 */
export interface ScenarioState {
  currentPhase: string;           // Current phase of the scenario
  timeElapsed: number;            // Time elapsed in seconds
  patientStatus: 'stable' | 'unstable' | 'critical' | 'improving' | 'deteriorating'; // Patient status
  completedActions: string[];     // IDs of completed actions
  availableActions: string[];     // IDs of currently available actions
  displayedInformation: string[]; // IDs of information already displayed
  vitalSigns?: PatientInfo['vitalSigns']; // Current vital signs that may change during simulation
  currentLabResults?: LabResult[]; // Current lab results that may change during simulation
  flags?: Record<string, boolean>; // Custom flags for scenario-specific logic
  metrics?: Record<string, number>; // Custom metrics for scenario-specific measurements
}

/**
 * Decision point in a clinical scenario
 */
export interface DecisionPoint {
  id: string;                     // Unique identifier
  title: string;                  // Title of the decision point
  description: string;            // Description of the decision
  type: 'diagnosis' | 'treatment' | 'investigation' | 'management'; // Type of decision
  options: DecisionOption[];      // Available options
  timeLimit?: number;             // Time limit in seconds, if applicable
  requiredPriorActions?: string[]; // IDs of actions that must be completed before this decision
  triggerCondition?: {            // Condition that triggers this decision point
    type: 'time' | 'action' | 'patientStatus' | 'labResult';
    value: string | number;       // Value to compare against
  };
}

/**
 * Option for a decision point
 */
export interface DecisionOption {
  id: string;                     // Unique identifier
  text: string;                   // Text of the option
  isCorrect: boolean;             // Whether this is the correct option
  reasoning: string;              // Explanation of why this option is correct/incorrect
  nextState?: Partial<ScenarioState>; // Changes to the scenario state if this option is selected
  consequence?: string;           // Description of the consequence of this choice
  feedback?: string;              // Immediate feedback to provide if chosen
  educationalContentIds?: string[]; // IDs of educational content to display if chosen
  triggerOutcomeId?: string;      // ID of outcome to trigger if this option is chosen
  recommendedTreatmentId?: string; // ID of recommended treatment if applicable
  sponsoredTreatmentId?: string;  // ID of sponsored treatment if applicable
}

/**
 * Educational content that can be displayed during or after the simulation
 */
export interface EducationalContent {
  id: string;                     // Unique identifier
  title: string;                  // Title of the content
  type: 'text' | 'image' | 'video' | 'link' | 'pdf'; // Type of content
  content: string;                // The content itself or a URL to it
  source?: string;                // Source of the content
  relevance: string;              // Why this content is relevant to the scenario
  displayTiming: 'pre' | 'during' | 'post' | 'feedback'; // When to display this content
  associatedDecisionIds?: string[]; // Decision points this content is associated with
  associatedTreatmentIds?: string[]; // Treatments this content is associated with
  companyId?: string;             // Associated pharma company ID if sponsored
}

/**
 * Possible outcome of a scenario
 */
export interface ScenarioOutcome {
  id: string;                     // Unique identifier
  title: string;                  // Title of the outcome
  description: string;            // Description of the outcome
  type: 'positive' | 'negative' | 'neutral'; // Type of outcome
  patientStatus: PatientInfo['vitalSigns'] & { 
    condition: string;            // Final patient condition
  };
  triggerConditions: {            // Conditions that trigger this outcome
    requiredActions?: string[];   // Actions that must have been taken
    forbiddenActions?: string[];  // Actions that must NOT have been taken
    requiredDecisions?: string[]; // Specific decisions that must have been made
    timeThreshold?: number;       // Time threshold in seconds
  };
  feedback: string;               // Feedback to provide with this outcome
  educationalContentIds: string[]; // Educational content to display with this outcome
  treatmentRecommendations?: string[]; // Recommended treatments for this outcome
  sponsoredTreatmentId?: string;  // ID of sponsored treatment relevant to this outcome
}

/**
 * Analytics data for tracking physician interactions
 */
export interface MicrosimulationAnalytics {
  sessionId: string;              // Unique session identifier
  scenarioId: string;             // ID of the scenario
  userId?: string;                // User ID if available
  startTime: Date;                // Start time of the simulation
  endTime?: Date;                 // End time of the simulation
  totalDuration?: number;         // Total duration in seconds
  completionStatus: 'completed' | 'abandoned' | 'timed_out'; // Completion status
  decisions: {                    // Decisions made during the simulation
    decisionId: string;           // ID of the decision point
    optionId: string;             // ID of the option chosen
    timestamp: Date;              // When the decision was made
    timeToDecide: number;         // Time taken to make the decision in seconds
    wasCorrect: boolean;          // Whether the choice was correct
  }[];
  outcomeId?: string;             // ID of the final outcome
  educationalContentViewed: {     // Educational content viewed
    contentId: string;            // ID of the content
    viewDuration: number;         // View duration in seconds
    completed: boolean;           // Whether viewing was completed
  }[];
  feedbackProvided?: {            // Feedback provided by the physician
    rating: number;               // Numerical rating (e.g., 1-5)
    comments?: string;            // Text comments
  };
  sponsoredTreatmentInteractions?: {  // Interactions with sponsored treatments
    treatmentId: string;          // ID of the treatment
    interactionType: 'view' | 'select' | 'info_request' | 'external_link'; // Type of interaction
    timestamp: Date;              // When the interaction occurred
    duration?: number;            // Duration of interaction in seconds
  }[];
}

/**
 * Configuration for a microsimulation
 */
export interface MicrosimulationConfig {
  scenarioId: string;             // ID of the scenario to use
  customPatientInfo?: Partial<PatientInfo>; // Custom patient info to override default
  initialDecisionPointId?: string; // Initial decision point to start from
  timeScale?: number;             // Time scale factor (1.0 = real-time)
  availableDecisionPoints?: string[]; // IDs of decision points to include (subset)
  sponsoredTreatments?: {         // Sponsored treatments to highlight
    treatmentId: string;          // ID of the treatment
    company: AdCompany;           // Company information
    priority: number;             // Priority level (higher = more prominence)
  }[];
  educationalPriorities?: string[]; // IDs of educational content to prioritize
  feedbackRequired?: boolean;     // Whether to require feedback at the end
  analyticsEnabled?: boolean;     // Whether to collect analytics
  maxDuration?: number;           // Maximum duration in seconds
  displaySettings?: {             // Display settings
    theme?: 'light' | 'dark' | 'professional';
    showTimer?: boolean;          // Whether to show a timer
    showFeedback?: boolean;       // Whether to show immediate feedback
  };
} 