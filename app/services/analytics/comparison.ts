import { z } from 'zod';
import { jStat } from 'jstat';

// Types for comparison metrics
export interface PerformanceMetric {
  value: number;
  sampleSize: number;
  confidence?: number;
}

export interface MetricComparisonResult {
  relativeChange: number;
  isSignificant: boolean;
  confidenceInterval: [number, number];
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ComparisonResult {
  engagement: MetricComparisonResult;
  retention: MetricComparisonResult;
  conversion: MetricComparisonResult;
  satisfaction: MetricComparisonResult;
}

export interface CategoryMetrics {
  engagement: PerformanceMetric;
  retention: PerformanceMetric;
  conversion: PerformanceMetric;
  satisfaction: PerformanceMetric;
}

// Schema validation for input data
const metricSchema = z.object({
  value: z.number(),
  sampleSize: z.number().positive(),
  confidence: z.number().optional(),
});

export class ComparisonService {
  private static SIGNIFICANCE_LEVEL = 0.05;

  /**
   * Calculate relative performance difference between two metrics
   */
  public calculateRelativePerformance(
    baseline: PerformanceMetric,
    comparison: PerformanceMetric
  ): MetricComparisonResult {
    const relativeChange = (comparison.value - baseline.value) / baseline.value;
    
    // Perform statistical significance test (t-test)
    const tStat = this.calculateTStatistic(baseline, comparison);
    const degreesOfFreedom = baseline.sampleSize + comparison.sampleSize - 2;
    const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), degreesOfFreedom));
    
    // Calculate confidence interval
    const standardError = Math.sqrt(
      (baseline.value * (1 - baseline.value) / baseline.sampleSize) +
      (comparison.value * (1 - comparison.value) / comparison.sampleSize)
    );
    const criticalValue = jStat.studentt.inv(1 - ComparisonService.SIGNIFICANCE_LEVEL / 2, degreesOfFreedom);
    const margin = criticalValue * standardError;
    
    return {
      relativeChange,
      isSignificant: pValue < ComparisonService.SIGNIFICANCE_LEVEL,
      confidenceInterval: [relativeChange - margin, relativeChange + margin],
      trend: this.determineTrend(relativeChange, pValue),
    };
  }

  /**
   * Normalize metrics for fair comparison
   */
  public normalizeMetrics(metrics: PerformanceMetric[]): PerformanceMetric[] {
    const values = metrics.map(m => m.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return metrics.map(metric => ({
      ...metric,
      value: (metric.value - min) / (max - min),
    }));
  }

  /**
   * Compare performance across multiple categories
   */
  public compareCategoryPerformance(
    categories: Record<string, CategoryMetrics>
  ): Record<string, ComparisonResult> {
    const results: Record<string, ComparisonResult> = {};
    const categoryNames = Object.keys(categories);

    for (let i = 0; i < categoryNames.length; i++) {
      const baseCategory = categoryNames[i];
      results[baseCategory] = {} as ComparisonResult;

      for (let j = 0; j < categoryNames.length; j++) {
        if (i === j) continue;
        const compCategory = categoryNames[j];
        
        results[baseCategory] = {
          engagement: this.calculateRelativePerformance(
            categories[baseCategory].engagement,
            categories[compCategory].engagement
          ),
          retention: this.calculateRelativePerformance(
            categories[baseCategory].retention,
            categories[compCategory].retention
          ),
          conversion: this.calculateRelativePerformance(
            categories[baseCategory].conversion,
            categories[compCategory].conversion
          ),
          satisfaction: this.calculateRelativePerformance(
            categories[baseCategory].satisfaction,
            categories[compCategory].satisfaction
          ),
        };
      }
    }

    return results;
  }

  /**
   * Calculate time-based performance trends
   */
  public calculateTimeTrends(
    timeSeriesData: PerformanceMetric[]
  ): {
    trend: 'increasing' | 'decreasing' | 'stable';
    significance: boolean;
    velocity: number;
  } {
    const values = timeSeriesData.map(d => d.value);
    const n = values.length;
    
    // Calculate linear regression
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;
    
    let xxSum = 0;
    let xySum = 0;
    
    for (let i = 0; i < n; i++) {
      xxSum += Math.pow(i - xMean, 2);
      xySum += (i - xMean) * (values[i] - yMean);
    }
    
    const slope = xySum / xxSum;
    const velocity = slope;
    
    // Determine significance and trend
    const significance = Math.abs(slope) > ComparisonService.SIGNIFICANCE_LEVEL;
    const trend = this.determineTrend(slope, significance ? 0.01 : 0.5);
    
    return {
      trend,
      significance,
      velocity,
    };
  }

  private calculateTStatistic(
    baseline: PerformanceMetric,
    comparison: PerformanceMetric
  ): number {
    const pooledVariance = (
      (baseline.sampleSize - 1) * Math.pow(baseline.confidence || 0.1, 2) +
      (comparison.sampleSize - 1) * Math.pow(comparison.confidence || 0.1, 2)
    ) / (baseline.sampleSize + comparison.sampleSize - 2);

    return (comparison.value - baseline.value) /
      Math.sqrt(pooledVariance * (1/baseline.sampleSize + 1/comparison.sampleSize));
  }

  private determineTrend(
    change: number,
    pValue: number
  ): 'increasing' | 'decreasing' | 'stable' {
    if (pValue >= ComparisonService.SIGNIFICANCE_LEVEL) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }
} 