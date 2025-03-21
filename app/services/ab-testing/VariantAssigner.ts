import { Test, Variant } from '../../models/ab-testing';

/**
 * Variant Assigner Service
 * 
 * Consistently assigns users/sessions to test variants
 */
export class VariantAssigner {
  /**
   * Assigns a user to a variant for a specific test
   * 
   * @param test The test definition
   * @param userId The user identifier
   * @returns The assigned variant or null if no variant is assigned
   */
  static assignVariant(test: Test, userId: string): Variant | null {
    if (!test || !test.variants || test.variants.length === 0) {
      return null;
    }
    
    // Use a hash of the user ID and test ID for consistent assignment
    const hash = this.hashString(`${userId}-${test.id}`);
    
    // Calculate total traffic allocation across all variants
    const totalAllocation = test.variants.reduce(
      (total, variant) => total + variant.trafficAllocation, 
      0
    );
    
    // If the user falls outside the test's traffic allocation, don't assign a variant
    if ((hash % 100) > test.trafficAllocation) {
      return null;
    }
    
    // Distribute the user to a variant based on the traffic allocation
    let bucketValue = hash % totalAllocation;
    let cumulativeAllocation = 0;
    
    for (const variant of test.variants) {
      cumulativeAllocation += variant.trafficAllocation;
      if (bucketValue < cumulativeAllocation) {
        return variant;
      }
    }
    
    // Fallback to control variant if something went wrong
    return test.variants.find(v => v.isControl) || test.variants[0];
  }
  
  /**
   * Simple hash function for consistent variant assignment
   * 
   * @param str The input string
   * @returns A hash value
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Ensure positive number
    return Math.abs(hash);
  }
  
  /**
   * Gets the variant assignment for a user across all active tests
   * 
   * @param userId The user identifier
   * @param activeTests An array of active tests
   * @returns A map of test IDs to assigned variants or null
   */
  static getUserAssignments(userId: string, activeTests: Test[]): Map<string, Variant | null> {
    const assignments = new Map<string, Variant | null>();
    
    for (const test of activeTests) {
      const variant = this.assignVariant(test, userId);
      assignments.set(test.id, variant);
    }
    
    return assignments;
  }
  
  /**
   * Check if a user is part of a specific test
   * 
   * @param test The test definition
   * @param userId The user identifier
   * @returns True if the user is part of the test
   */
  static isUserInTest(test: Test, userId: string): boolean {
    return this.assignVariant(test, userId) !== null;
  }
} 