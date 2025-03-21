import { Variant } from './Variant';

/**
 * Test status enum
 */
export enum TestStatus {
  DRAFT = 'draft',         // Test is in draft mode, not yet ready to run
  SCHEDULED = 'scheduled',  // Test is scheduled but not yet active
  RUNNING = 'running',      // Test is currently running
  PAUSED = 'paused',         // Test is paused temporarily
  COMPLETED = 'completed',   // Test has finished its run
  ARCHIVED = 'archived'      // Test is archived
}

/**
 * Test type enum
 */
export enum TestType {
  AB = 'a/b',
  MULTIVARIATE = 'multivariate',
  SPLIT_URL = 'split_url',
  FEATURE_FLAG = 'feature_flag'
}

/**
 * Target criteria for a test
 */
export interface TestTargetCriteria {
  companyIds?: string[];           // Target specific pharmaceutical companies
  adTypes?: string[];              // Target specific ad types
  categories?: string[];           // Target specific content categories
  devices?: ('mobile' | 'desktop' | 'tablet')[];  // Target specific devices
  userTypes?: ('new' | 'returning')[];            // Target user types
  customSegments?: Record<string, string[]>;      // Custom segment targeting
}

/**
 * AB Test model
 */
export interface Test {
  id: string;                     // Unique identifier
  name: string;                   // Human-readable name
  description: string;            // Description of the test
  status: TestStatus;             // Current status
  type: TestType;                 // Type of the test
  startDate: Date;                 // When the test started
  endDate: Date | null;           // When the test ended (null if ongoing)
  targetAudience: string[];       // Target audience for the test
  conversionGoals: string[];       // Conversion goals for the test
  variants: Variant[];            // Array of variants (first is usually control)
  targetCriteria: TestTargetCriteria; // Targeting criteria
  primaryMetric: string;          // Main conversion metric (e.g., "clickThroughRate")
  secondaryMetrics?: string[];    // Secondary metrics to track
  trafficAllocation: number;       // Percentage of traffic to include in test (0-100)
  createdAt: Date;                // Creation timestamp
  updatedAt: Date;                // Last update timestamp
  createdBy: string;             // User who created the test
  sampleSize: number;            // Number of participants in the test
  confidenceLevel: number;         // Desired confidence level (0.95 = 95%)
  notes?: string;                 // Additional notes
} 