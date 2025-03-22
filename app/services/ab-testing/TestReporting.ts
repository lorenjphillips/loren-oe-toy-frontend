import { Test, TestResults, VariantResult } from '../../models/ab-testing';
import { ResultsCalculator } from './ResultsCalculator';
import { TestManager } from './TestManager';

/**
 * Test Reporting Service
 * 
 * Generates reports and insights based on A/B test results
 */
export class TestReporting {
  /**
   * Get results for a specific test
   */
  static async getTestResults(testId: string): Promise<TestResults | null> {
    try {
      // Get the test
      const test = await Promise.resolve(TestManager.prototype.getTest(testId));
      if (!test) {
        console.error(`Test with ID ${testId} not found`);
        return null;
      }
      
      // Only completed tests have results
      if (test.status !== 'completed') {
        console.warn(`Test ${testId} is not completed, status: ${test.status}`);
        return null;
      }
      
      // In a real app, we would fetch actual metrics for the test
      // Here we'll generate mock data using the ResultsCalculator
      return ResultsCalculator.calculateTestResults(test, null);
    } catch (error) {
      console.error('Error getting test results:', error);
      return null;
    }
  }
  
  /**
   * Get a summary of all completed tests
   */
  static async getCompletedTestsSummary(): Promise<{
    testId: string;
    name: string;
    startDate: Date;
    endDate: Date | null;
    hasWinner: boolean;
    winningVariantName?: string;
    improvement?: number;
  }[]> {
    try {
      // Get all completed tests
      const completedTests = await Promise.resolve(TestManager.prototype.getAllTests({ status: 'completed' }));
      
      // Return a summary for each test
      return await Promise.all(completedTests.map(async (test) => {
        const results = await this.getTestResults(test.id);
        
        // Find winning variant name if there is one
        const winningVariant = results?.winningVariantId 
          ? test.variants.find(v => v.id === results.winningVariantId)
          : undefined;
        
        return {
          testId: test.id,
          name: test.name,
          startDate: test.startDate,
          endDate: test.endDate,
          hasWinner: !!results?.winningVariantId,
          winningVariantName: winningVariant?.name,
          improvement: results?.summaryMetrics.improvementOverControl
        };
      }));
    } catch (error) {
      console.error('Error getting completed tests summary:', error);
      return [];
    }
  }
  
  /**
   * Get recommendations based on test results
   */
  static async getRecommendationsFromTests(): Promise<{
    sourceTestId: string;
    sourceTestName: string;
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
    category: string;
  }[]> {
    try {
      // Get all completed tests with results
      const completedTests = await Promise.resolve(TestManager.prototype.getAllTests({ status: 'completed' }));
      const recommendations: {
        sourceTestId: string;
        sourceTestName: string;
        recommendation: string;
        impact: 'high' | 'medium' | 'low';
        category: string;
      }[] = [];
      
      // Generate recommendations for each test
      for (const test of completedTests) {
        const results = await this.getTestResults(test.id);
        if (!results) continue;
        
        // Only generate recommendations for tests with a clear winner
        if (results.winningVariantId) {
          const winningVariant = test.variants.find((v: any) => v.id === results.winningVariantId);
          const controlVariant = test.variants.find((v: any) => v.isControl);
          
          if (winningVariant && controlVariant) {
            // Create recommendation based on test type and winning variant
            const improvement = results.summaryMetrics.improvementOverControl;
            let impact: 'high' | 'medium' | 'low' = 'low';
            
            if (improvement > 15) {
              impact = 'high';
            } else if (improvement > 5) {
              impact = 'medium';
            }
            
            // Based on test type, create specific recommendations
            switch (test.type) {
              case 'a/b':
                recommendations.push({
                  sourceTestId: test.id,
                  sourceTestName: test.name,
                  recommendation: `Implement ${winningVariant.name} which showed a ${improvement.toFixed(1)}% improvement over control`,
                  impact,
                  category: 'UI Optimization'
                });
                break;
                
              case 'multivariate':
                recommendations.push({
                  sourceTestId: test.id,
                  sourceTestName: test.name,
                  recommendation: `Adopt the winning combination from test "${test.name}" for ${improvement.toFixed(1)}% better conversion`,
                  impact,
                  category: 'Content Strategy'
                });
                break;
                
              default:
                recommendations.push({
                  sourceTestId: test.id,
                  sourceTestName: test.name,
                  recommendation: `Apply insights from test "${test.name}" with ${improvement.toFixed(1)}% improvement`,
                  impact,
                  category: 'General Optimization'
                });
            }
          }
        }
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }
  
  /**
   * Export test results to CSV format
   */
  static exportResultsToCsv(testResults: TestResults): string {
    let csv = 'Variant,IsControl,Exposures,Conversions,Conversion Rate,Improvement vs Control,P-Value,Significant\n';
    
    for (const variant of testResults.variantResults) {
      csv += [
        variant.name,
        variant.isControl ? 'Yes' : 'No',
        variant.metrics.impressions,
        variant.metrics.conversions,
        `${(variant.metrics.conversionRate * 100).toFixed(2)}%`,
        variant.improvement ? `${(variant.improvement * 100).toFixed(2)}%` : 'N/A',
        variant.pValue ? variant.pValue.toFixed(4) : 'N/A',
        variant.significanceLevel === 'high' || variant.significanceLevel === 'medium' ? 'Yes' : 'No'
      ].join(',');
      csv += '\n';
    }
    
    return csv;
  }
  
  /**
   * Get a performance comparison of multiple tests
   */
  static async compareTests(testIds: string[]): Promise<{
    testName: string;
    startDate: Date;
    endDate: Date | null;
    sampleSize: number;
    conversionRate: number;
    hasWinner: boolean;
    improvement: number;
  }[]> {
    try {
      const comparisonData = [];
      
      for (const testId of testIds) {
        const test = await Promise.resolve(TestManager.prototype.getTest(testId));
        const results = await this.getTestResults(testId);
        
        if (test && results) {
          comparisonData.push({
            testName: test.name,
            startDate: test.startDate,
            endDate: test.endDate,
            sampleSize: results.sampleSize,
            conversionRate: results.summaryMetrics.overallConversionRate * 100,
            hasWinner: !!results.winningVariantId,
            improvement: results.summaryMetrics.improvementOverControl
          });
        }
      }
      
      return comparisonData;
    } catch (error) {
      console.error('Error comparing tests:', error);
      return [];
    }
  }
  
  /**
   * Generate detailed report from test results
   */
  static async generateDetailedReport(results: TestResults): Promise<any> {
    try {
      // In a real application, this would generate a comprehensive report
      // with statistical analysis, graphs data, etc.
      
      // Calculate overall conversion rate
      const overallConversionRate = results.summaryMetrics.totalConversions / results.totalExposure;
      
      // Find control variant
      const controlVariant = results.variantResults.find(variant => variant.isControl);
      
      // Calculate confidence intervals for all variants
      const variantsWithConfidence = results.variantResults.map(variant => {
        // Determine confidence level based on p-value
        let confidenceLevel = null;
        if (variant.pValue && variant.pValue < 0.01) {
          confidenceLevel = 'high';
        } else if (variant.pValue && variant.pValue < 0.05) {
          confidenceLevel = 'medium';
        } else if (variant.pValue && variant.pValue < 0.1) {
          confidenceLevel = 'low';
        }
        
        return {
          variantId: variant.variantId,
          name: variant.name,
          isControl: variant.isControl,
          impressions: variant.metrics.impressions,
          conversions: variant.metrics.conversions,
          conversionRate: variant.metrics.conversionRate,
          confidenceLevel,
          relativeImprovement: variant.isControl ? 0 : variant.improvement * 100
        };
      });
      
      // Highlight key insights
      let insights = [];
      
      if (results.winningVariantId) {
        const winner = results.variantResults.find(v => v.variantId === results.winningVariantId);
        
        if (winner) {
          insights.push({
            type: 'positive',
            message: `The winning variant "${winner.name}" showed a ${(winner.improvement * 100).toFixed(2)}% improvement over the control.`
          });
        }
      }
      
      // Add more insights based on the data...
      
      return {
        summary: {
          testId: results.testId,
          dateGenerated: results.dateGenerated,
          sampleSize: results.sampleSize,
          overallConversionRate,
          hasWinner: !!results.winningVariantId
        },
        variants: variantsWithConfidence,
        insights
      };
    } catch (error) {
      console.error('Error generating detailed report:', error);
      return null;
    }
  }
} 