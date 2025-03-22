import { v4 as uuidv4 } from 'uuid';
import { Test, TestStatus, TestType, Variant } from '../../models/ab-testing';
import { VariantAssigner } from './VariantAssigner';

/**
 * Mock database of A/B tests
 * In a real implementation, this would come from a database
 */
let tests: Test[] = [];

/**
 * Test Manager Service
 * 
 * Manages A/B test definitions, variants, and assignments
 */
export class TestManager {
  private variantAssigner: VariantAssigner;
  
  constructor() {
    this.variantAssigner = new VariantAssigner();
  }
  
  /**
   * Create a new A/B test
   * 
   * @param test The test configuration
   * @returns The created test with ID
   */
  createTest(test: Omit<Test, 'id' | 'createdAt' | 'updatedAt'>): Test {
    const newTest: Test = {
      id: uuidv4(),
      ...test,
      status: test.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Validate test
    this.validateTest(newTest);
    
    // Add to test collection
    tests.push(newTest);
    
    console.log(`[Test Manager] Created new test: ${newTest.id}`);
    
    return newTest;
  }
  
  /**
   * Update an existing A/B test
   * 
   * @param id The test ID
   * @param updates The test updates
   * @returns The updated test
   */
  updateTest(id: string, updates: Partial<Test>): Test {
    const index = tests.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error(`Test with ID ${id} not found`);
    }
    
    // Cannot update certain fields
    const { id: _, createdAt: __, ...allowedUpdates } = updates;
    
    // Update test
    const updatedTest = {
      ...tests[index],
      ...allowedUpdates,
      updatedAt: new Date()
    };
    
    // Validate test
    this.validateTest(updatedTest);
    
    // Update in collection
    tests[index] = updatedTest;
    
    console.log(`[Test Manager] Updated test: ${id}`);
    
    return updatedTest;
  }
  
  /**
   * Get a test by ID
   * 
   * @param id The test ID
   * @returns The test or undefined if not found
   */
  getTest(id: string): Test | undefined {
    return tests.find(t => t.id === id);
  }
  
  /**
   * Get all tests
   * 
   * @param filter Optional filter object
   * @returns Array of tests
   */
  getAllTests(filter?: {
    status?: TestStatus;
    adType?: string;
    companyId?: string;
  }): Test[] {
    let filteredTests = [...tests];
    
    if (filter?.status) {
      filteredTests = filteredTests.filter(t => t.status === filter.status);
    }
    
    if (filter?.adType) {
      filteredTests = filteredTests.filter(t => 
        t.targetCriteria.adTypes?.includes(filter.adType!)
      );
    }
    
    if (filter?.companyId) {
      filteredTests = filteredTests.filter(t => 
        t.targetCriteria.companyIds?.includes(filter.companyId!)
      );
    }
    
    return filteredTests;
  }
  
  /**
   * Delete a test
   * 
   * @param id The test ID
   * @returns True if deleted, false if not found
   */
  deleteTest(id: string): boolean {
    const index = tests.findIndex(t => t.id === id);
    
    if (index === -1) {
      return false;
    }
    
    // Remove from collection
    tests.splice(index, 1);
    
    console.log(`[Test Manager] Deleted test: ${id}`);
    
    return true;
  }
  
  /**
   * Start a test
   * 
   * @param id The test ID
   * @returns The updated test
   */
  startTest(id: string): Test {
    return this.updateTest(id, { 
      status: 'running',
      startDate: new Date()
    });
  }
  
  /**
   * Stop a test
   * 
   * @param id The test ID
   * @returns The updated test
   */
  stopTest(id: string): Test {
    return this.updateTest(id, { 
      status: 'completed',
      endDate: new Date()
    });
  }
  
  /**
   * Add a variant to a test
   * 
   * @param testId The test ID
   * @param variant The variant to add
   * @returns The updated test
   */
  addVariant(testId: string, variant: Omit<Variant, 'id'>): Test {
    const test = this.getTest(testId);
    
    if (!test) {
      throw new Error(`Test with ID ${testId} not found`);
    }
    
    const newVariant: Variant = {
      id: uuidv4(),
      ...variant
    };
    
    // Update test with new variant
    return this.updateTest(testId, {
      variants: [...(test.variants || []), newVariant]
    });
  }
  
  /**
   * Get the variant that should be shown to a user/session
   * 
   * @param testId The test ID
   * @param sessionId The user/session ID
   * @returns The assigned variant
   */
  getAssignedVariant(testId: string, sessionId: string): Variant {
    const test = this.getTest(testId);
    
    if (!test) {
      throw new Error(`Test with ID ${testId} not found`);
    }
    
    if (!test.variants || test.variants.length === 0) {
      throw new Error(`Test with ID ${testId} has no variants`);
    }
    
    return VariantAssigner.assignVariant(test, sessionId);
  }
  
  /**
   * Validate a test definition
   * 
   * @param test The test to validate
   * @throws Error if the test is invalid
   */
  private validateTest(test: Test): void {
    // Must have a name
    if (!test.name) {
      throw new Error('Test must have a name');
    }
    
    // Must have at least one variant for active tests
    if (test.status === 'running' && (!test.variants || test.variants.length < 2)) {
      throw new Error('Active test must have at least two variants');
    }
    
    // Validate traffic allocation if specified
    if (test.trafficAllocation !== undefined) {
      if (test.trafficAllocation <= 0 || test.trafficAllocation > 1) {
        throw new Error('Traffic allocation must be between 0 and 1');
      }
    }
    
    // Other validations as needed...
  }
} 