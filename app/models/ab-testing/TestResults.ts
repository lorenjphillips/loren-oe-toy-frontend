import { TestMetrics } from './TestMetrics';

/**
 * Significance level of a test result
 */
export type SignificanceLevel = 'none' | 'low' | 'medium' | 'high';

/**
 * Results for a specific variant
 */
export interface VariantResult {
  variantId: string;               // Variant identifier
  name: string;                    // Variant name
  isControl: boolean;              // Whether this is the control variant
  metrics: TestMetrics;            // Metrics for this variant
  improvement: number;             // Relative improvement over control (as decimal)
  confidenceInterval: [number, number] | null; // 95% confidence interval [lower, upper]
  pValue: number | null;           // p-value for statistical significance
  significanceLevel: SignificanceLevel | null; // Significance level
}

/**
 * Overall test results
 */
export interface TestResults {
  testId: string;
  dateGenerated: Date;
  isComplete: boolean;
  sampleSize: number;
  totalExposure: number; // total number of exposures
  variantResults: VariantResult[];
  winningVariantId: string | null;
  confidenceLevel: number;
  summaryMetrics: {
    totalConversions: number;
    overallConversionRate: number;
    improvementOverControl: number; // % improvement of winner over control
  };
} 