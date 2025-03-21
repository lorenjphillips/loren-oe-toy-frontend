import { Test, TestResults, VariantResult } from '../../models/ab-testing';
import { TestMetrics } from '../../models/ab-testing/TestMetrics';
import { Variant } from '../../models/ab-testing/Variant';

/**
 * Results Calculator Service
 * 
 * Calculates statistical significance and other metrics for A/B tests
 */
export class ResultsCalculator {
  /**
   * Calculate test results for a given test
   * 
   * @param test The test to calculate results for
   * @param variantData Variant data containing metrics for each variant
   * @returns The calculated test results
   */
  calculateResults(test: Test, variantData: Record<string, TestMetrics>): TestResults {
    // Validate that we have data for all variants
    this.validateVariantData(test, variantData);
    
    // Identify control variant (first variant is usually the control)
    const controlVariant = test.variants[0];
    const controlData = variantData[controlVariant.id];
    
    // Calculate results for each variant compared to control
    const variantResults = test.variants.map(variant => {
      // Skip calculations for control variant
      if (variant.id === controlVariant.id) {
        return {
          variantId: variant.id,
          name: variant.name,
          isControl: true,
          metrics: variantData[variant.id],
          improvement: 0,
          confidenceInterval: null,
          pValue: null,
          significanceLevel: null
        };
      }
      
      const metrics = variantData[variant.id];
      
      // Calculate conversion rate improvements
      const improvementRatio = this.calculateImprovement(
        metrics.conversions,
        metrics.impressions,
        controlData.conversions,
        controlData.impressions
      );
      
      // Calculate p-value for statistical significance
      const pValue = this.calculatePValue(
        metrics.conversions,
        metrics.impressions,
        controlData.conversions,
        controlData.impressions
      );
      
      // Calculate confidence interval
      const confidenceInterval = this.calculateConfidenceInterval(
        metrics.conversions,
        metrics.impressions,
        controlData.conversions,
        controlData.impressions
      );
      
      // Determine significance level based on p-value
      const significanceLevel = this.getSignificanceLevel(pValue);
      
      return {
        variantId: variant.id,
        name: variant.name,
        isControl: false,
        metrics,
        improvement: improvementRatio,
        confidenceInterval,
        pValue,
        significanceLevel
      };
    });
    
    // Find the winner variant (if any)
    const winner = this.determineWinner(variantResults);
    
    // Return overall results
    return {
      testId: test.id,
      testName: test.name,
      startDate: test.startDate,
      endDate: test.endDate || new Date(),
      totalImpressions: Object.values(variantData).reduce((sum, data) => sum + data.impressions, 0),
      totalConversions: Object.values(variantData).reduce((sum, data) => sum + data.conversions, 0),
      variants: variantResults,
      winner,
      hasSignificantResult: variantResults.some(v => v.significanceLevel === 'high' && !v.isControl),
      calculatedAt: new Date()
    };
  }
  
  /**
   * Calculate relative improvement between treatment and control
   * 
   * @param treatmentConversions Treatment group conversions
   * @param treatmentImpressions Treatment group impressions
   * @param controlConversions Control group conversions
   * @param controlImpressions Control group impressions
   * @returns Relative improvement as a decimal (-0.1 = 10% worse, 0.1 = 10% better)
   */
  private calculateImprovement(
    treatmentConversions: number, 
    treatmentImpressions: number,
    controlConversions: number,
    controlImpressions: number
  ): number {
    const treatmentRate = treatmentConversions / treatmentImpressions;
    const controlRate = controlConversions / controlImpressions;
    
    // Calculate relative improvement
    if (controlRate === 0) {
      // Avoid division by zero
      return treatmentRate > 0 ? Infinity : 0;
    }
    
    return (treatmentRate - controlRate) / controlRate;
  }
  
  /**
   * Calculate p-value for the difference between two conversion rates
   * 
   * @param treatmentConversions Treatment group conversions
   * @param treatmentImpressions Treatment group impressions
   * @param controlConversions Control group conversions
   * @param controlImpressions Control group impressions
   * @returns The p-value
   */
  private calculatePValue(
    treatmentConversions: number, 
    treatmentImpressions: number,
    controlConversions: number,
    controlImpressions: number
  ): number {
    // Using Z-test for proportions
    const treatmentRate = treatmentConversions / treatmentImpressions;
    const controlRate = controlConversions / controlImpressions;
    
    // Calculate pooled proportion
    const totalConversions = treatmentConversions + controlConversions;
    const totalImpressions = treatmentImpressions + controlImpressions;
    const pooledProportion = totalConversions / totalImpressions;
    
    // Standard error of difference
    const standardError = Math.sqrt(
      pooledProportion * (1 - pooledProportion) * (1/treatmentImpressions + 1/controlImpressions)
    );
    
    // Z-score
    const z = (treatmentRate - controlRate) / standardError;
    
    // Approximate p-value from z-score (two-tailed)
    // This is a simple approximation - in production, use a proper statistics library
    return 2 * (1 - this.cumulativeStandardNormal(Math.abs(z)));
  }
  
  /**
   * Calculate confidence interval for the difference between two conversion rates
   * 
   * @param treatmentConversions Treatment group conversions
   * @param treatmentImpressions Treatment group impressions
   * @param controlConversions Control group conversions
   * @param controlImpressions Control group impressions
   * @returns The 95% confidence interval [lower, upper]
   */
  private calculateConfidenceInterval(
    treatmentConversions: number, 
    treatmentImpressions: number,
    controlConversions: number,
    controlImpressions: number
  ): [number, number] {
    const treatmentRate = treatmentConversions / treatmentImpressions;
    const controlRate = controlConversions / controlImpressions;
    const difference = treatmentRate - controlRate;
    
    // Standard error of the difference
    const treatmentVariance = treatmentRate * (1 - treatmentRate) / treatmentImpressions;
    const controlVariance = controlRate * (1 - controlRate) / controlImpressions;
    const standardError = Math.sqrt(treatmentVariance + controlVariance);
    
    // 95% confidence interval (using z=1.96 for 95% CI)
    const z = 1.96;
    const marginOfError = z * standardError;
    
    return [difference - marginOfError, difference + marginOfError];
  }
  
  /**
   * Determine the significance level based on p-value
   * 
   * @param pValue The p-value
   * @returns Significance level
   */
  private getSignificanceLevel(pValue: number): 'none' | 'low' | 'medium' | 'high' {
    if (pValue < 0.01) {
      return 'high';
    } else if (pValue < 0.05) {
      return 'medium';
    } else if (pValue < 0.1) {
      return 'low';
    } else {
      return 'none';
    }
  }
  
  /**
   * Determine the winner variant (if any)
   * 
   * @param variantResults The results for each variant
   * @returns The winner variant ID or null if no clear winner
   */
  private determineWinner(variantResults: any[]): string | null {
    // Filter to only significant results
    const significantVariants = variantResults.filter(v => 
      !v.isControl && (v.significanceLevel === 'high' || v.significanceLevel === 'medium')
    );
    
    if (significantVariants.length === 0) {
      return null;
    }
    
    // Find the variant with the highest improvement
    const bestVariant = significantVariants.reduce((best, current) => 
      current.improvement > best.improvement ? current : best
    , significantVariants[0]);
    
    // Only declare a winner if the improvement is positive
    return bestVariant.improvement > 0 ? bestVariant.variantId : null;
  }
  
  /**
   * Validate that we have metrics data for all variants
   * 
   * @param test The test definition
   * @param variantData The variant metrics data
   */
  private validateVariantData(test: Test, variantData: Record<string, TestMetrics>): void {
    for (const variant of test.variants) {
      if (!variantData[variant.id]) {
        throw new Error(`Missing data for variant ${variant.id} (${variant.name})`);
      }
    }
  }
  
  /**
   * Approximation of the cumulative standard normal distribution function
   * 
   * @param z Z-score
   * @returns Probability
   */
  private cumulativeStandardNormal(z: number): number {
    // Approximation by Abramowitz and Stegun
    const b1 = 0.31938153;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;
    const p = 0.2316419;
    const c = 0.39894228;
    
    if (z >= 0) {
      const t = 1 / (1 + p * z);
      return 1 - c * Math.exp(-z * z / 2) * t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
    } else {
      return 1 - this.cumulativeStandardNormal(-z);
    }
  }

  /**
   * Calculate results for a completed test
   */
  static calculateTestResults(test: Test, rawData: any): TestResults {
    // In a real application, rawData would contain actual metrics for the test
    // For this example, we'll generate mock results
    
    // Create basic results object
    const results: TestResults = {
      testId: test.id,
      dateGenerated: new Date(),
      isComplete: true,
      sampleSize: test.sampleSize,
      totalExposure: 0,
      variantResults: [],
      winningVariantId: null,
      confidenceLevel: test.confidenceLevel,
      summaryMetrics: {
        totalConversions: 0,
        overallConversionRate: 0,
        improvementOverControl: 0
      }
    };
    
    // Find control variant
    const controlVariant = test.variants.find(v => v.isControl);
    if (!controlVariant) {
      throw new Error('No control variant found');
    }
    
    // Mock conversion rates - typically these would come from actual data
    const mockConversionRates: Record<string, number> = {};
    let controlConversionRate = 0.05; // Base 5% conversion rate for control
    
    // Set up mock data for control
    mockConversionRates[controlVariant.id] = controlConversionRate;
    
    // Generate mock data for other variants, with some performing better and some worse
    for (const variant of test.variants) {
      if (!variant.isControl) {
        // Random variation between -30% and +50% compared to control
        const variation = (Math.random() * 0.8) - 0.3; // -0.3 to +0.5
        mockConversionRates[variant.id] = controlConversionRate * (1 + variation);
      }
    }
    
    // Calculate stats for each variant
    let totalExposures = 0;
    let totalConversions = 0;
    let bestPerformingVariantId = controlVariant.id;
    let bestConversionRate = controlConversionRate;
    
    for (const variant of test.variants) {
      // Calculate exposures based on traffic allocation
      const variantExposures = Math.round(test.sampleSize * (variant.trafficAllocation / 100));
      totalExposures += variantExposures;
      
      // Calculate conversions based on mock conversion rate
      const conversionRate = mockConversionRates[variant.id];
      const variantConversions = Math.round(variantExposures * conversionRate);
      totalConversions += variantConversions;
      
      // Check if this is the best performing variant
      if (conversionRate > bestConversionRate) {
        bestPerformingVariantId = variant.id;
        bestConversionRate = conversionRate;
      }
      
      // Statistical significance calculation (simplified)
      // In a real application, use proper statistical methods
      const improvementOverControl = variant.isControl 
        ? 0 
        : ((conversionRate / controlConversionRate) - 1) * 100;
      
      const pValue = this.calculatePValue(
        variantConversions, 
        variantExposures, 
        controlVariant.isControl 
          ? variantConversions 
          : Math.round(test.sampleSize * (controlVariant.trafficAllocation / 100) * controlConversionRate),
        controlVariant.isControl 
          ? variantExposures 
          : Math.round(test.sampleSize * (controlVariant.trafficAllocation / 100))
      );
      
      const isSignificant = pValue < (1 - test.confidenceLevel);
      
      // Calculate confidence interval (simplified)
      const standardError = Math.sqrt((conversionRate * (1 - conversionRate)) / variantExposures);
      const zScore = this.getZScore(test.confidenceLevel);
      const marginOfError = zScore * standardError;
      const confidenceInterval: [number, number] = [
        Math.max(0, conversionRate - marginOfError),
        Math.min(1, conversionRate + marginOfError)
      ];
      
      // Add variant result
      results.variantResults.push({
        variantId: variant.id,
        variantName: variant.name,
        isControl: variant.isControl,
        metrics: {
          exposures: variantExposures,
          conversions: variantConversions,
          conversionRate: conversionRate,
          improvementOverControl: variant.isControl ? undefined : improvementOverControl
        },
        statisticalSignificance: {
          pValue,
          isSignificant,
          confidenceInterval
        }
      });
    }
    
    // Update summary metrics
    results.totalExposure = totalExposures;
    results.summaryMetrics.totalConversions = totalConversions;
    results.summaryMetrics.overallConversionRate = totalConversions / totalExposures;
    
    // Determine if there's a winning variant
    const winningVariant = results.variantResults.find(
      vr => vr.variantId === bestPerformingVariantId && 
            !vr.isControl && 
            vr.statisticalSignificance.isSignificant
    );
    
    if (winningVariant) {
      results.winningVariantId = winningVariant.variantId;
      results.summaryMetrics.improvementOverControl = winningVariant.metrics.improvementOverControl || 0;
    }
    
    return results;
  }
  
  /**
   * Get Z-score for the given confidence level
   */
  private static getZScore(confidenceLevel: number): number {
    const alpha = 1 - confidenceLevel;
    
    // Common confidence levels
    if (Math.abs(confidenceLevel - 0.9) < 0.001) return 1.645;
    if (Math.abs(confidenceLevel - 0.95) < 0.001) return 1.96;
    if (Math.abs(confidenceLevel - 0.99) < 0.001) return 2.576;
    
    // Approximation for other values
    return -this.invNormalCDF(alpha/2);
  }
  
  /**
   * Inverse of normal CDF (approximation)
   */
  private static invNormalCDF(p: number): number {
    if (p <= 0 || p >= 1) {
      throw new Error('Invalid probability for inverse normal CDF');
    }
    
    // Approximation for the inverse normal CDF
    if (p < 0.5) {
      return -this.ratioOfPolynomials(p);
    } else {
      return this.ratioOfPolynomials(1 - p);
    }
  }
  
  /**
   * Helper for inverse normal CDF approximation
   */
  private static ratioOfPolynomials(p: number): number {
    const a1 = -39.6968302866538;
    const a2 = 220.946098424521;
    const a3 = -275.928510446969;
    const a4 = 138.357751867269;
    const a5 = -30.6647980661472;
    const a6 = 2.50662827745924;
    
    const b1 = -54.4760987982241;
    const b2 = 161.585836858041;
    const b3 = -155.698979859887;
    const b4 = 66.8013118877197;
    const b5 = -13.2806815528857;
    
    const c1 = -7.78489400243029E-03;
    const c2 = -0.322396458041136;
    const c3 = -2.40075827716184;
    const c4 = -2.54973253934373;
    const c5 = 4.37466414146497;
    const c6 = 2.93816398269878;
    
    const d1 = 7.78469570904146E-03;
    const d2 = 0.32246712907004;
    const d3 = 2.445134137143;
    const d4 = 3.75440866190742;
    
    const p_low = 0.02425;
    const p_high = 1 - p_low;
    
    let q, r;
    
    if (p < p_low) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / 
             ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (p <= p_high) {
      q = p - 0.5;
      r = q * q;
      return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / 
             (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / 
              ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
  }
} 